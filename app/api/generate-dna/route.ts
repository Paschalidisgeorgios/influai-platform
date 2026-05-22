import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest
) {

  try {

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

    console.log(
      "GENERATED DNA:",
      dna
    );

    return NextResponse.json({
      dna,
    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "DNA generation failed",
      },
      {
        status: 500,
      }
    );
  }
}