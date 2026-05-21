import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {

    /*
      REQUEST BODY
    */

    const body = await req.json();

    const prompt =
      body.prompt;

    const characterId =
      body.characterId || null;

    console.log(
      "PROMPT:",
      prompt
    );

    /*
      GENERATE IMAGE
    */

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
        },
      }
    );

    console.log(
      "RAW OUTPUT:",
      output
    );

    /*
      IMAGE URL
    */

    let image = "";

    if (Array.isArray(output)) {

      const first =
        output[0];

      console.log(
        "FIRST OUTPUT:",
        first
      );

      /*
        NEW FILE OBJECT
      */

      if (
        typeof first === "object" &&
        first !== null &&
        "url" in first
      ) {

        image = first.url();

      /*
        STRING URL
      */

      } else if (
        typeof first === "string"
      ) {

        image = first;
      }
    }

    console.log(
      "FINAL IMAGE:",
      image
    );

    /*
      SAVE TO DATABASE
    */

    const { error } =
      await supabase
        .from("generations")
        .insert({
          prompt,
          image_url: image,
          model: "flux-schnell",
          character_id:
            characterId,
        });

    if (error) {

      console.log(
        "DATABASE ERROR:"
      );

      console.dir(error, {
        depth: null,
      });

    } else {

      console.log(
        "GENERATION SAVED"
      );
    }

    /*
      RESPONSE
    */

    return NextResponse.json({
      image,
    });

  } catch (error: any) {

    console.log(
      "FULL ERROR:"
    );

    console.dir(error, {
      depth: null,
    });

    return NextResponse.json(
      {
        error:
          error.message ||
          "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}