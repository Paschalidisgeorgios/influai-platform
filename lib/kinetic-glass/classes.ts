/** Shared Borderless Full-Screen + Kinetic-Glass design tokens. */
export const KG = {
  page: "bg-[#050505] text-white",
  glassFloat:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all",
  glassCard:
    "rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all",
  glassPanel:
    "rounded-2xl border border-neutral-800 bg-neutral-900/50 shadow-2xl backdrop-blur-xl",
  glassCommand:
    "relative z-20 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-2xl backdrop-blur-xl",
  glassConsole:
    "rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl backdrop-blur-xl",
  legibilityMask: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10",
  fullScreenCover: "h-full w-full object-cover object-center",
  titleWhite: "font-extrabold uppercase tracking-tighter text-white",
  titleHero: "text-4xl font-extrabold uppercase leading-none tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl",
  titleGradient:
    "bg-gradient-to-r from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent",
  amberBtn:
    "rounded-xl bg-amber-500 font-black text-neutral-950 transition hover:bg-amber-600",
  whiteCta:
    "rounded-xl bg-white px-8 py-4 font-black tracking-wider text-black shadow-xl transition-all hover:bg-neutral-200",
  engineSelected:
    "border-amber-500 bg-amber-500/10 font-bold text-amber-400 ring-1 ring-amber-500",
  engineDefault:
    "border-neutral-800/80 bg-neutral-900/40 text-neutral-200 hover:border-white/30",
  previewCanvas:
    "mx-auto mb-6 w-full max-w-4xl max-h-[55vh] rounded-2xl border border-neutral-800/50 bg-neutral-900/20 object-contain p-2 shadow-2xl",
  input:
    "w-full resize-none border-none bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-0",
} as const;
