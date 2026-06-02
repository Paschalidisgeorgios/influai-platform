/** Auto-generated from @krea-ai/sdk openapi — run: node scripts/generate-krea-official-catalog.mjs */
export type KreaOfficialEndpointKind = "image" | "video" | "enhance";

export type KreaOfficialEndpointRecord = {
  kind: KreaOfficialEndpointKind;
  modelPath: string;
  apiPath: string;
  subscribePath: string;
  summary: string | null;
  requiredFields: readonly string[];
};

export const KREA_OFFICIAL_ENDPOINT_RECORDS: readonly KreaOfficialEndpointRecord[] = [
  {
    "kind": "enhance",
    "modelPath": "topaz/bloom-enhance",
    "apiPath": "/generate/enhance/topaz/bloom-enhance",
    "subscribePath": "enhance/topaz/bloom-enhance",
    "summary": "Topaz Bloom",
    "requiredFields": [
      "width",
      "height",
      "image_url",
      "model"
    ]
  },
  {
    "kind": "enhance",
    "modelPath": "topaz/generative-enhance",
    "apiPath": "/generate/enhance/topaz/generative-enhance",
    "subscribePath": "enhance/topaz/generative-enhance",
    "summary": "Topaz Generative",
    "requiredFields": [
      "width",
      "height",
      "image_url"
    ]
  },
  {
    "kind": "enhance",
    "modelPath": "topaz/standard-enhance",
    "apiPath": "/generate/enhance/topaz/standard-enhance",
    "subscribePath": "enhance/topaz/standard-enhance",
    "summary": "Topaz",
    "requiredFields": [
      "width",
      "height",
      "image_url",
      "model"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bfl/flux-1-dev",
    "apiPath": "/generate/image/bfl/flux-1-dev",
    "subscribePath": "image/bfl/flux-1-dev",
    "summary": "Flux",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bfl/flux-1-kontext-dev",
    "apiPath": "/generate/image/bfl/flux-1-kontext-dev",
    "subscribePath": "image/bfl/flux-1-kontext-dev",
    "summary": "Flux Kontext",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bfl/flux-1.1-pro",
    "apiPath": "/generate/image/bfl/flux-1.1-pro",
    "subscribePath": "image/bfl/flux-1.1-pro",
    "summary": "Flux 1.1 Pro",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bfl/flux-1.1-pro-ultra",
    "apiPath": "/generate/image/bfl/flux-1.1-pro-ultra",
    "subscribePath": "image/bfl/flux-1.1-pro-ultra",
    "summary": "Flux 1.1 Pro Ultra",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bytedance/seededit",
    "apiPath": "/generate/image/bytedance/seededit",
    "subscribePath": "image/bytedance/seededit",
    "summary": "SeedEdit",
    "requiredFields": [
      "prompt",
      "image_url"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bytedance/seedream-4",
    "apiPath": "/generate/image/bytedance/seedream-4",
    "subscribePath": "image/bytedance/seedream-4",
    "summary": "Seedream 4",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "image",
    "modelPath": "bytedance/seedream-5-lite",
    "apiPath": "/generate/image/bytedance/seedream-5-lite",
    "subscribePath": "image/bytedance/seedream-5-lite",
    "summary": "Seedream 5 Lite",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/imagen-3",
    "apiPath": "/generate/image/google/imagen-3",
    "subscribePath": "image/google/imagen-3",
    "summary": "Imagen 3",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/imagen-4",
    "apiPath": "/generate/image/google/imagen-4",
    "subscribePath": "image/google/imagen-4",
    "summary": "Imagen 4",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/imagen-4-fast",
    "apiPath": "/generate/image/google/imagen-4-fast",
    "subscribePath": "image/google/imagen-4-fast",
    "summary": "Imagen 4 Fast",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/imagen-4-ultra",
    "apiPath": "/generate/image/google/imagen-4-ultra",
    "subscribePath": "image/google/imagen-4-ultra",
    "summary": "Imagen 4 Ultra",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/nano-banana",
    "apiPath": "/generate/image/google/nano-banana",
    "subscribePath": "image/google/nano-banana",
    "summary": "Nano Banana",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/nano-banana-2",
    "apiPath": "/generate/image/google/nano-banana-2",
    "subscribePath": "image/google/nano-banana-2",
    "summary": "Nano Banana 2",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "google/nano-banana-pro",
    "apiPath": "/generate/image/google/nano-banana-pro",
    "subscribePath": "image/google/nano-banana-pro",
    "summary": "Nano Banana Pro",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "ideogram/ideogram-2-turbo",
    "apiPath": "/generate/image/ideogram/ideogram-2-turbo",
    "subscribePath": "image/ideogram/ideogram-2-turbo",
    "summary": "Ideogram 2.0A Turbo",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "ideogram/ideogram-3",
    "apiPath": "/generate/image/ideogram/ideogram-3",
    "subscribePath": "image/ideogram/ideogram-3",
    "summary": "Ideogram 3.0",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "krea/krea-2/large",
    "apiPath": "/generate/image/krea/krea-2/large",
    "subscribePath": "image/krea/krea-2/large",
    "summary": "Krea 2 Large",
    "requiredFields": [
      "prompt",
      "aspect_ratio",
      "resolution"
    ]
  },
  {
    "kind": "image",
    "modelPath": "krea/krea-2/medium",
    "apiPath": "/generate/image/krea/krea-2/medium",
    "subscribePath": "image/krea/krea-2/medium",
    "summary": "Krea 2 Medium",
    "requiredFields": [
      "prompt",
      "aspect_ratio",
      "resolution"
    ]
  },
  {
    "kind": "image",
    "modelPath": "luma/uni-1",
    "apiPath": "/generate/image/luma/uni-1",
    "subscribePath": "image/luma/uni-1",
    "summary": "Luma UNI-1",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "openai/gpt-image",
    "apiPath": "/generate/image/openai/gpt-image",
    "subscribePath": "image/openai/gpt-image",
    "summary": "ChatGPT Image",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "openai/gpt-image-2",
    "apiPath": "/generate/image/openai/gpt-image-2",
    "subscribePath": "image/openai/gpt-image-2",
    "summary": "ChatGPT 2",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "qwen/2512",
    "apiPath": "/generate/image/qwen/2512",
    "subscribePath": "image/qwen/2512",
    "summary": "Qwen 2512",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "image",
    "modelPath": "runway/gen-4-image",
    "apiPath": "/generate/image/runway/gen-4-image",
    "subscribePath": "image/runway/gen-4-image",
    "summary": "Runway Gen-4",
    "requiredFields": [
      "prompt",
      "reference_images"
    ]
  },
  {
    "kind": "image",
    "modelPath": "z-image/z-image",
    "apiPath": "/generate/image/z-image/z-image",
    "subscribePath": "image/z-image/z-image",
    "summary": "Z Image",
    "requiredFields": [
      "prompt",
      "aspect_ratio",
      "resolution"
    ]
  },
  {
    "kind": "video",
    "modelPath": "alibaba/wan-2.1",
    "apiPath": "/generate/video/alibaba/wan-2.1",
    "subscribePath": "video/alibaba/wan-2.1",
    "summary": "Wan 2.1",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "video",
    "modelPath": "alibaba/wan-2.2",
    "apiPath": "/generate/video/alibaba/wan-2.2",
    "subscribePath": "video/alibaba/wan-2.2",
    "summary": "Wan 2.2",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "video",
    "modelPath": "alibaba/wan-2.5",
    "apiPath": "/generate/video/alibaba/wan-2.5",
    "subscribePath": "video/alibaba/wan-2.5",
    "summary": "Wan 2.5",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "bytedance/seedance-1.0-pro",
    "apiPath": "/generate/video/bytedance/seedance-1.0-pro",
    "subscribePath": "video/bytedance/seedance-1.0-pro",
    "summary": "Seedance Pro",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "bytedance/seedance-1.0-pro-fast",
    "apiPath": "/generate/video/bytedance/seedance-1.0-pro-fast",
    "subscribePath": "video/bytedance/seedance-1.0-pro-fast",
    "summary": "Seedance Pro Fast",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-2",
    "apiPath": "/generate/video/google/veo-2",
    "subscribePath": "video/google/veo-2",
    "summary": "Veo 2",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-3",
    "apiPath": "/generate/video/google/veo-3",
    "subscribePath": "video/google/veo-3",
    "summary": "Veo 3",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-3-fast",
    "apiPath": "/generate/video/google/veo-3-fast",
    "subscribePath": "video/google/veo-3-fast",
    "summary": "Veo 3 Fast",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-3.1",
    "apiPath": "/generate/video/google/veo-3.1",
    "subscribePath": "video/google/veo-3.1",
    "summary": "Veo 3.1",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-3.1-fast",
    "apiPath": "/generate/video/google/veo-3.1-fast",
    "subscribePath": "video/google/veo-3.1-fast",
    "summary": "Veo 3.1 Fast",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "google/veo-3.1-lite",
    "apiPath": "/generate/video/google/veo-3.1-lite",
    "subscribePath": "video/google/veo-3.1-lite",
    "summary": "Veo 3.1 Lite",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-1",
    "apiPath": "/generate/video/kling/kling-1",
    "subscribePath": "video/kling/kling-1",
    "summary": "Kling 1.0",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-1.5",
    "apiPath": "/generate/video/kling/kling-1.5",
    "subscribePath": "video/kling/kling-1.5",
    "summary": "Kling 1.5",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-1.6",
    "apiPath": "/generate/video/kling/kling-1.6",
    "subscribePath": "video/kling/kling-1.6",
    "summary": "Kling 1.6",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-2",
    "apiPath": "/generate/video/kling/kling-2",
    "subscribePath": "video/kling/kling-2",
    "summary": "Kling 2.0",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-2.1",
    "apiPath": "/generate/video/kling/kling-2.1",
    "subscribePath": "video/kling/kling-2.1",
    "summary": "Kling 2.1",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-2.5",
    "apiPath": "/generate/video/kling/kling-2.5",
    "subscribePath": "video/kling/kling-2.5",
    "summary": "Kling 2.5",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-2.6",
    "apiPath": "/generate/video/kling/kling-2.6",
    "subscribePath": "video/kling/kling-2.6",
    "summary": "Kling 2.6",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-3.0",
    "apiPath": "/generate/video/kling/kling-3.0",
    "subscribePath": "video/kling/kling-3.0",
    "summary": "Kling 3.0",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "kling/kling-o1",
    "apiPath": "/generate/video/kling/kling-o1",
    "subscribePath": "video/kling/kling-o1",
    "summary": "Kling o1",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "lightricks/ltx-video-2.3-22b",
    "apiPath": "/generate/video/lightricks/ltx-video-2.3-22b",
    "subscribePath": "video/lightricks/ltx-video-2.3-22b",
    "summary": "LTX-2.3 22B",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "luma/ray-2",
    "apiPath": "/generate/video/luma/ray-2",
    "subscribePath": "video/luma/ray-2",
    "summary": "Ray 2",
    "requiredFields": [
      "prompt",
      "width",
      "height"
    ]
  },
  {
    "kind": "video",
    "modelPath": "minimax/hailuo",
    "apiPath": "/generate/video/minimax/hailuo",
    "subscribePath": "video/minimax/hailuo",
    "summary": "Hailuo",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "minimax/hailuo-02",
    "apiPath": "/generate/video/minimax/hailuo-02",
    "subscribePath": "video/minimax/hailuo-02",
    "summary": "Hailuo 02",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "minimax/hailuo-2.3",
    "apiPath": "/generate/video/minimax/hailuo-2.3",
    "subscribePath": "video/minimax/hailuo-2.3",
    "summary": "Hailuo 2.3",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "minimax/hailuo-2.3-fast",
    "apiPath": "/generate/video/minimax/hailuo-2.3-fast",
    "subscribePath": "video/minimax/hailuo-2.3-fast",
    "summary": "Hailuo 2.3 Fast",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "runway/aleph",
    "apiPath": "/generate/video/runway/aleph",
    "subscribePath": "video/runway/aleph",
    "summary": "Runway Aleph",
    "requiredFields": [
      "prompt",
      "init_video"
    ]
  },
  {
    "kind": "video",
    "modelPath": "runway/gen-3",
    "apiPath": "/generate/video/runway/gen-3",
    "subscribePath": "video/runway/gen-3",
    "summary": "Runway Gen-3",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "runway/gen-4-video",
    "apiPath": "/generate/video/runway/gen-4-video",
    "subscribePath": "video/runway/gen-4-video",
    "summary": "Runway Gen-4",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "runway/gen-4.5",
    "apiPath": "/generate/video/runway/gen-4.5",
    "subscribePath": "video/runway/gen-4.5",
    "summary": "Runway Gen-4.5",
    "requiredFields": [
      "prompt"
    ]
  },
  {
    "kind": "video",
    "modelPath": "xai/grok-video",
    "apiPath": "/generate/video/xai/grok-video",
    "subscribePath": "video/xai/grok-video",
    "summary": "Grok Imagine",
    "requiredFields": [
      "prompt"
    ]
  }
];

export const KREA_OFFICIAL_MODEL_PATHS = new Set<string>(
  KREA_OFFICIAL_ENDPOINT_RECORDS.map((entry) => entry.modelPath)
);
