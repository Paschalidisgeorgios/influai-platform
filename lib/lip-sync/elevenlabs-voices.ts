export type ElevenLabsVoiceGroup = "female" | "male";

export type ElevenLabsVoiceDefinition = {
  key: string;
  label: string;
  description: string;
  group: ElevenLabsVoiceGroup;
  previewPath: string;
};

export const LIP_SYNC_RECOMMENDED_VOICE_KEYS = [
  "sarah",
  "laura",
  "liam",
  "brian",
  "matilda",
  "george",
] as const;

export const ELEVENLABS_NAMED_VOICES: ElevenLabsVoiceDefinition[] = [
  {
    key: "sarah",
    label: "Sarah",
    description: "Mature, reassuring, confident",
    group: "female",
    previewPath: "/audio/voices/sarah.mp3",
  },
  {
    key: "laura",
    label: "Laura",
    description: "Enthusiastic, quirky attitude",
    group: "female",
    previewPath: "/audio/voices/laura.mp3",
  },
  {
    key: "alice",
    label: "Alice",
    description: "Clear, engaging educator",
    group: "female",
    previewPath: "/audio/voices/alice.mp3",
  },
  {
    key: "matilda",
    label: "Matilda",
    description: "Knowledgeable, professional",
    group: "female",
    previewPath: "/audio/voices/matilda.mp3",
  },
  {
    key: "jessica",
    label: "Jessica",
    description: "Playful, bright, warm",
    group: "female",
    previewPath: "/audio/voices/jessica.mp3",
  },
  {
    key: "bella",
    label: "Bella",
    description: "Professional, bright, warm",
    group: "female",
    previewPath: "/audio/voices/bella.mp3",
  },
  {
    key: "lily",
    label: "Lily",
    description: "Velvety actress",
    group: "female",
    previewPath: "/audio/voices/lily.mp3",
  },
  {
    key: "roger",
    label: "Roger",
    description: "Laid-back, casual, resonant",
    group: "male",
    previewPath: "/audio/voices/roger.mp3",
  },
  {
    key: "charlie",
    label: "Charlie",
    description: "Deep, confident, energetic",
    group: "male",
    previewPath: "/audio/voices/charlie.mp3",
  },
  {
    key: "george",
    label: "George",
    description: "Warm, captivating storyteller",
    group: "male",
    previewPath: "/audio/voices/george.mp3",
  },
  {
    key: "callum",
    label: "Callum",
    description: "Husky trickster",
    group: "male",
    previewPath: "/audio/voices/callum.mp3",
  },
  {
    key: "river",
    label: "River",
    description: "Relaxed, neutral, informative",
    group: "male",
    previewPath: "/audio/voices/river.mp3",
  },
  {
    key: "harry",
    label: "Harry",
    description: "Fierce warrior",
    group: "male",
    previewPath: "/audio/voices/harry.mp3",
  },
  {
    key: "liam",
    label: "Liam",
    description: "Energetic social media creator",
    group: "male",
    previewPath: "/audio/voices/liam.mp3",
  },
  {
    key: "will",
    label: "Will",
    description: "Relaxed optimist",
    group: "male",
    previewPath: "/audio/voices/will.mp3",
  },
  {
    key: "eric",
    label: "Eric",
    description: "Smooth, trustworthy",
    group: "male",
    previewPath: "/audio/voices/eric.mp3",
  },
  {
    key: "chris",
    label: "Chris",
    description: "Charming, down-to-earth",
    group: "male",
    previewPath: "/audio/voices/chris.mp3",
  },
  {
    key: "brian",
    label: "Brian",
    description: "Deep, resonant, comforting",
    group: "male",
    previewPath: "/audio/voices/brian.mp3",
  },
  {
    key: "daniel",
    label: "Daniel",
    description: "Steady broadcaster",
    group: "male",
    previewPath: "/audio/voices/daniel.mp3",
  },
  {
    key: "adam",
    label: "Adam",
    description: "Dominant, firm",
    group: "male",
    previewPath: "/audio/voices/adam.mp3",
  },
  {
    key: "bill",
    label: "Bill",
    description: "Wise, mature, balanced",
    group: "male",
    previewPath: "/audio/voices/bill.mp3",
  },
];

export const LIP_SYNC_CATEGORY_VOICE_STYLES: ElevenLabsVoiceDefinition[] = [
  {
    key: "female_natural",
    label: "Female Natural",
    description: "Natural, friendly creator voice",
    group: "female",
    previewPath: "/audio/voices/female_natural.mp3",
  },
  {
    key: "female_soft",
    label: "Female Soft",
    description: "Soft, polished, beauty/lifestyle voice",
    group: "female",
    previewPath: "/audio/voices/female_soft.mp3",
  },
  {
    key: "female_energetic",
    label: "Female Energetic",
    description: "Bright, upbeat, TikTok/Reels style",
    group: "female",
    previewPath: "/audio/voices/female_energetic.mp3",
  },
  {
    key: "female_premium",
    label: "Female Premium",
    description: "Elegant, brand-ready campaign voice",
    group: "female",
    previewPath: "/audio/voices/female_premium.mp3",
  },
  {
    key: "male_natural",
    label: "Male Natural",
    description: "Clear, neutral creator voice",
    group: "male",
    previewPath: "/audio/voices/male_natural.mp3",
  },
  {
    key: "male_deep",
    label: "Male Deep",
    description: "Deep, confident, premium voice",
    group: "male",
    previewPath: "/audio/voices/male_deep.mp3",
  },
  {
    key: "male_storytelling",
    label: "Male Storytelling",
    description: "Warm, narrative, character voice",
    group: "male",
    previewPath: "/audio/voices/male_storytelling.mp3",
  },
  {
    key: "male_energetic",
    label: "Male Energetic",
    description: "Clear, upbeat, ad-style voice",
    group: "male",
    previewPath: "/audio/voices/male_energetic.mp3",
  },
];

export const LIP_SYNC_ALL_VOICES: ElevenLabsVoiceDefinition[] = [
  ...ELEVENLABS_NAMED_VOICES,
  ...LIP_SYNC_CATEGORY_VOICE_STYLES,
];

export const LIP_SYNC_VOICE_KEYS = new Set(
  LIP_SYNC_ALL_VOICES.map((voice) => voice.key)
);

export const ELEVENLABS_VOICE_ENV_BY_KEY: Record<string, string> = {
  roger: "ELEVENLABS_VOICE_ROGER",
  sarah: "ELEVENLABS_VOICE_SARAH",
  laura: "ELEVENLABS_VOICE_LAURA",
  charlie: "ELEVENLABS_VOICE_CHARLIE",
  george: "ELEVENLABS_VOICE_GEORGE",
  callum: "ELEVENLABS_VOICE_CALLUM",
  river: "ELEVENLABS_VOICE_RIVER",
  harry: "ELEVENLABS_VOICE_HARRY",
  liam: "ELEVENLABS_VOICE_LIAM",
  alice: "ELEVENLABS_VOICE_ALICE",
  matilda: "ELEVENLABS_VOICE_MATILDA",
  will: "ELEVENLABS_VOICE_WILL",
  jessica: "ELEVENLABS_VOICE_JESSICA",
  eric: "ELEVENLABS_VOICE_ERIC",
  bella: "ELEVENLABS_VOICE_BELLA",
  chris: "ELEVENLABS_VOICE_CHRIS",
  brian: "ELEVENLABS_VOICE_BRIAN",
  daniel: "ELEVENLABS_VOICE_DANIEL",
  lily: "ELEVENLABS_VOICE_LILY",
  adam: "ELEVENLABS_VOICE_ADAM",
  bill: "ELEVENLABS_VOICE_BILL",
  female_natural: "ELEVENLABS_VOICE_FEMALE_NATURAL",
  female_soft: "ELEVENLABS_VOICE_FEMALE_SOFT",
  female_energetic: "ELEVENLABS_VOICE_FEMALE_ENERGETIC",
  female_premium: "ELEVENLABS_VOICE_FEMALE_PREMIUM",
  male_natural: "ELEVENLABS_VOICE_MALE_NATURAL",
  male_deep: "ELEVENLABS_VOICE_MALE_DEEP",
  male_storytelling: "ELEVENLABS_VOICE_MALE_STORYTELLING",
  male_energetic: "ELEVENLABS_VOICE_MALE_ENERGETIC",
};

function parseConfiguredVoiceKeysFromPublicEnv(): Set<string> | null {
  const raw = process.env.NEXT_PUBLIC_ELEVENLABS_CONFIGURED_VOICE_KEYS;
  if (!raw?.trim()) return null;

  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** UI enablement when NEXT_PUBLIC_ELEVENLABS_CONFIGURED_VOICE_KEYS is set. */
export function isClientVoiceConfigured(voiceKey: string): boolean {
  const configured = parseConfiguredVoiceKeysFromPublicEnv();
  if (!configured) return true;
  return configured.has(voiceKey.trim().toLowerCase());
}

export function resolveDefaultLipSyncVoiceKey(): string {
  if (process.env.ELEVENLABS_VOICE_SARAH?.trim()) return "sarah";
  if (process.env.ELEVENLABS_VOICE_FEMALE_NATURAL?.trim()) {
    return "female_natural";
  }
  return "sarah";
}

export function resolveElevenLabsVoiceIdFromKey(voiceKey: string): string | null {
  const envName = ELEVENLABS_VOICE_ENV_BY_KEY[voiceKey.trim().toLowerCase()];
  if (!envName) return null;

  const resolved = process.env[envName];
  return typeof resolved === "string" && resolved.trim().length > 0
    ? resolved.trim()
    : null;
}
