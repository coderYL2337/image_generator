import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    const startTime = Date.now();

    // TODO: Call your Image Generation API here
    const apiSecret = request.headers.get("X-API-Key");
    if (apiSecret != process.env.API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // For now, we'll just echo back the text
    console.log(text);
    const modalUrl = process.env.MODAL_URL;
    const url = new URL(modalUrl);
    url.searchParams.set("prompt", text);

    console.log("Requesting URL", url.toString());

    // Get image from Modal
    const modalResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });
    if (!modalResponse.ok) {
      const errorText = await modalResponse.text();
      console.error("API Response:", errorText);
      throw new Error(
        `HTTP error! status: ${modalResponse.status}, message: ${errorText}`
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await modalResponse.arrayBuffer());
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "ai-generated",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Store metadata in database
    const image = await prisma.image.create({
      data: {
        url: uploadResponse.secure_url,
        prompt: text,
        latency: Date.now() - startTime,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
      imageId: image.id,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
      },
      { status: 500 }
    );
  }
}
