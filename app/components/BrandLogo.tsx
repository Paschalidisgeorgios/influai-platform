import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8ad5f]/40 bg-[#d8ad5f]/10 backdrop-blur-md transition group-hover:border-[#d8ad5f]">
        <div className="h-2 w-2 rounded-full bg-[#d8ad5f]" />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-[0.72rem] font-black uppercase tracking-[0.38em] text-white">
          AIINFLU<span className="text-[#d8ad5f]">GEN</span>
        </span>

        <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.32em] text-white/35">
          AI Creator Studio
        </span>
      </div>
    </Link>
  );
}