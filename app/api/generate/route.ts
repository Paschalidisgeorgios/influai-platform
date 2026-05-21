import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Prompt required",
        },
        {
          status: 400,
        }
      );
    }

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          aspect_ratio: "3:4",
          num_outputs: 1,
          output_format: "jpg",
          output_quality: 100,
        },
      }
    );

    console.log("OUTPUT:", output);

    let image = "";

    if (Array.isArray(output)) {
      image = String(output[0]);
    } else {
      image = String(output);
    }

    return NextResponse.json({
      image,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        error: error.message || "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}