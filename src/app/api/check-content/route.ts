// src/app/api/check-content/route.ts
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a content moderator. Evaluate if the given text prompt is safe and appropriate for image generation. Consider: violence, explicit content, hate speech, harassment, self-harm, or other harmful content. Respond with either 'SAFE' or 'UNSAFE' followed by a brief reason.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content || "";
    const isSafe = response.startsWith("SAFE");
    const reason = response.split("\n")[1] || "";

    return NextResponse.json({
      safe: isSafe,
      reason: reason,
    });
  } catch (error) {
    console.error("Content check error:", error);
    return NextResponse.json(
      { error: "Failed to check content safety" },
      { status: 500 }
    );
  }
}
