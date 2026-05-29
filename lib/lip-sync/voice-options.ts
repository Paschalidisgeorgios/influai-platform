import { ELEVENLABS_NAMED_VOICES, LIP_SYNC_RECOMMENDED_VOICE_KEYS } from "./elevenlabs-voices";

export type VoiceOption = {
  key: string;
  label: string;
  gender: "female" | "male";
  recommended?: boolean;
  previewPath: string;
};

const recommendedKeys = new Set<string>(LIP_SYNC_RECOMMENDED_VOICE_KEYS);

export const LIP_SYNC_VOICE_OPTIONS: VoiceOption[] = ELEVENLABS_NAMED_VOICES.map(
  (voice) => ({
    key: voice.key,
    label: voice.label,
    gender: voice.group,
    recommended: recommendedKeys.has(voice.key),
    previewPath: `/audio/voices/${voice.key}.mp3`,
  })
);

export const LIP_SYNC_FEMALE_VOICES = LIP_SYNC_VOICE_OPTIONS.filter(
  (voice) => voice.gender === "female"
);

export const LIP_SYNC_MALE_VOICES = LIP_SYNC_VOICE_OPTIONS.filter(
  (voice) => voice.gender === "male"
);
