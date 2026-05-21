export async function generateWithReplicate({
    prompt,
    referenceImage,
  }: {
    prompt: string;
    referenceImage: string;
  }) {
  
    try {
  
      const response = await fetch(
        "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: `
  ${prompt},
  
  highly detailed cinematic influencer portrait,
  ultra realistic skin texture,
  luxury fashion photography,
  consistent face identity,
  same person consistency,
  editorial lighting,
  8k realism
              `,
              go_fast: true,
              megapixels: "1",
            },
          }),
        }
      );
  
      const data = await response.json();
  
      return data;
  
    } catch (error) {
  
      console.error(error);
  
      throw error;
    }
  }