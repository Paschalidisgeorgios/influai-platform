import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

export async function POST(
  req: NextRequest
) {

  try {

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI is not configured" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body =
      await req.json();

    const images =
      body.images || [];

    /*
      VALIDATION
    */

    if (
      !images.length
    ) {

      return NextResponse.json(
        {
          error:
            "No images provided",
        },
        {
          status: 400,
        }
      );
    }

    /*
      BUILD IMAGE INPUTS
    */

    const content: any[] = [

      {
        type: "text",

        text: `
Analyze these reference images and create a cinematic AI character DNA description.

Focus on:
- facial structure
- skin tone
- hairstyle
- beauty aesthetic
- influencer vibe
- fashion energy
- cinematic style
- visual identity
- overall persona

Return ONLY a clean concise DNA description.
No bullet points.
No intro text.
`
      }
    ];

    /*
      ADD IMAGES
    */

    for (const image of images) {

      content.push({

        type: "image_url",

        image_url: {
          url: image,
        },
      });
    }

    /*
      GPT VISION
    */

    const response =
      await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: [

          {
            role: "user",
            content,
          },
        ],

        temperature: 0.7,
      });

    const dna =
      response.choices?.[0]
        ?.message?.content || "";

    return NextResponse.json({
      dna,
    });

  } catch (error: unknown) {

    const message =
      error instanceof Error
        ? error.message
        : "DNA generation failed";

    console.error("GENERATE DNA ERROR:", message);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}