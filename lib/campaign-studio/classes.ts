/** AI Campaign Studio — premium dark glass design tokens */
export const CS = {
  page: "bg-[#0a0a0a] text-white antialiased",
  glass:
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
  glassHover:
    "transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07]",
  headline:
    "font-semibold tracking-tighter text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]",
  sectionTitle:
    "text-center text-2xl font-semibold tracking-tighter text-white sm:text-3xl md:text-4xl",
  subtitle: "text-base text-neutral-400 sm:text-lg leading-relaxed",
  ctaPrimary:
    "inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]",
  ctaSecondary:
    "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10",
  section: "relative px-4 py-24 sm:px-6 lg:px-8",
  glowPurple:
    "pointer-events-none absolute rounded-full bg-purple-600/20 blur-[120px]",
  glowCyan:
    "pointer-events-none absolute rounded-full bg-cyan-500/15 blur-[100px]",
} as const;
