"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getTrustCommercialFaq } from "@/lib/copy/trust-commercial-faq";

type Props = {
  language?: "en" | "de";
  variant?: "landing" | "settings";
  className?: string;
};

export default function TrustCommercialFaqList({
  language = "en",
  variant = "landing",
  className = "",
}: Props) {
  const faq = getTrustCommercialFaq(language);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const isSettings = variant === "settings";
  const shell = isSettings
    ? "divide-y divide-white/10 border border-white/10 bg-white/[0.03] rounded-xl overflow-hidden"
    : "divide-y divide-neutral-800 border border-neutral-800 bg-neutral-900 shadow-[8px_8px_0_0_#000]";
  const questionClass = isSettings
    ? "text-sm font-semibold text-white"
    : "text-xs font-black uppercase tracking-wide text-white sm:text-sm font-mono";
  const answerClass = isSettings
    ? "border-t border-white/10 px-4 pb-4 text-sm leading-relaxed text-neutral-400"
    : "border-t border-neutral-800 px-5 pb-5 text-xs leading-relaxed text-neutral-400 sm:px-6";
  const buttonClass = isSettings
    ? "flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
    : "flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-mono sm:px-6";
  const chevronClass = isSettings
    ? "h-4 w-4 shrink-0 text-amber-400 transition"
    : "h-5 w-5 shrink-0 text-amber-400 transition";

  return (
    <div className={className}>
      <div className={shell}>
        {faq.items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className={buttonClass}
                aria-expanded={open}
              >
                <span className={questionClass}>{item.q}</span>
                <ChevronDown
                  className={`${chevronClass} ${open ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {open ? <p className={answerClass}>{item.a}</p> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        {faq.notLegalAdvice}
      </p>
    </div>
  );
}
