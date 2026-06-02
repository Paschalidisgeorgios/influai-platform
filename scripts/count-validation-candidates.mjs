import { collectValidationCandidates } from "../lib/ai/krea-model-validation.ts";

const motion = collectValidationCandidates("motion_transfer");
console.log("motion_transfer:", motion.length, motion.map((c) => c.modelId).join(", "));

const image = collectValidationCandidates("image");
console.log("image:", image.length);

const video = collectValidationCandidates("video");
console.log("video:", video.length);

const all = collectValidationCandidates();
console.log("all:", all.length);
