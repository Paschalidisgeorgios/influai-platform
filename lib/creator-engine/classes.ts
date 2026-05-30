/** InfluExAi Creator Engine — cyber action landing tokens */
export const CE = {
  page: "bg-[#030712] text-white antialiased",
  headline:
    "font-black tracking-tight text-white text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.02]",
  sectionTitle:
    "text-center text-2xl font-black tracking-tight sm:text-3xl md:text-4xl",
  glass:
    "rounded-2xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl",
  glassGlow:
    "shadow-[0_0_40px_rgba(34,211,238,0.15),0_0_80px_rgba(168,85,247,0.08)]",
  ctaPulse:
    "relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-cyan-400 px-8 py-4 text-sm font-black uppercase tracking-wider text-[#030712] transition hover:bg-cyan-300 animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.5),0_0_60px_rgba(34,211,238,0.25)]",
  section: "relative px-4 py-24 sm:px-6 lg:px-8",
  mono: "font-mono",
} as const;

/** Dummy public paths — swap when real assets are ready */
export const CREATOR_ASSETS = {
  video: "/video.mp4",
  videoFallback: "/assets/preview-lipsync.mp4",
  images: ["/image1.jpg", "/image2.jpg", "/image3.jpg"] as const,
  imageFallbacks: [
    "/assets/hero-model.png",
    "/assets/hero-training.png",
    "/assets/hero-model1.png.jpg",
  ] as const,
  scanImage: "/image1.jpg",
  scanFallback: "/assets/hero-model.png",
} as const;
