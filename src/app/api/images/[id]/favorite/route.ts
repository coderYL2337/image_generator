import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const updatedImage = await prisma.image.update({
      where: { id: params.id },
      data: { isFavorite: !image.isFavorite },
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
