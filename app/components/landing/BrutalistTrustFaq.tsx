"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";

export default function BrutalistTrustFaq({
  currentLanguage,
  studioHref,
}: {
  currentLanguage: LandingLanguage;
  studioHref: string;
}) {
  const t = magnificContent[currentLanguage].trust;
  const finalCta = magnificContent[currentLanguage].finalCta;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section className="border-t border-neutral-800 bg-black py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
          {t.metrics.map((metric, i) => (
            <motion.article
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center font-mono shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-amber-500/5"
            >
              <p className="text-4xl font-black text-lime-400">{metric.value}</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {metric.title}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-neutral-950 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 md:text-4xl">
            {t.faqTitle}
          </h2>

          <div className="mt-10 divide-y divide-neutral-800 border border-neutral-800 bg-neutral-900 shadow-[8px_8px_0_0_#000]">
            {t.faq.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-mono sm:px-6"
                  >
                    <span className="text-xs font-black uppercase tracking-wide text-white sm:text-sm">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-lime-400 transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open ? (
                    <p className="border-t border-neutral-800 px-5 pb-5 text-xs leading-relaxed text-neutral-400 sm:px-6">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-neutral-800 bg-neutral-900 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-lime-500/10 via-transparent to-transparent" />
        <h2 className="relative px-4 text-xl font-black uppercase italic tracking-tighter text-white md:text-3xl">
          {finalCta.headline}
        </h2>
        <Link
          href={studioHref}
          className="relative mt-8 inline-flex items-center rounded-xl bg-lime-400 px-8 py-4 font-mono text-sm font-black uppercase tracking-widest text-neutral-950 shadow-[0_0_40px_rgba(163,230,53,0.35)] transition hover:bg-lime-500 hover:shadow-[0_0_60px_rgba(163,230,53,0.5)]"
        >
          {finalCta.cta}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>
    </>
  );
}
