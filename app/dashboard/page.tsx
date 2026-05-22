"use client";

import Link from "next/link";

import {
  Users,
  ImageIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const cards = [
  {
    title: "Characters",
    description:
      "Create and manage cinematic AI characters with persistent identity.",
    href: "/dashboard/characters",
    icon: Users,
  },
  {
    title: "Gallery",
    description:
      "Browse, favorite, and open every image you have generated.",
    href: "/dashboard/gallery",
    icon: ImageIcon,
  },
  {
    title: "Image Generator",
    description:
      "Generate four FLUX variations with character consistency and prompt intelligence.",
    href: "/dashboard/image-generator",
    icon: Sparkles,
  },
];

export default function DashboardPage() {

  return (

    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

      <div className="mb-12 md:mb-16">

        <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-xs md:text-sm mb-4">
          InfluAI
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Creator Dashboard
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-2xl">
          Your workspace for characters, cinematic image generation, and gallery management.
        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">

        {cards.map((card) => {

          const Icon = card.icon;

          return (

            <Link
              key={card.href}
              href={card.href}
              className="group bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8 hover:border-[#c7a36a]/40 transition"
            >

              <div className="w-14 h-14 rounded-2xl bg-[#1a140d] flex items-center justify-center mb-6">

                <Icon
                  size={26}
                  className="text-[#c7a36a]"
                />

              </div>

              <h2 className="text-2xl font-bold mb-3">
                {card.title}
              </h2>

              <p className="text-gray-500 mb-8 leading-relaxed">
                {card.description}
              </p>

              <span className="inline-flex items-center gap-2 text-[#c7a36a] font-semibold group-hover:gap-3 transition-all">
                Open
                <ArrowRight size={18} />
              </span>

            </Link>
          );
        })}

      </div>

    </div>
  );
}
