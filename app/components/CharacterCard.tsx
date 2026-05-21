"use client";

import { motion } from "framer-motion";

interface CharacterCardProps {
  name: string;
  image: string;
  style: string;
  gender: string;
}

export default function CharacterCard({
  name,
  image,
  style,
  gender,
}: CharacterCardProps) {

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
    >

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">

        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Status */}
        <div className="absolute right-4 top-4 rounded-full border border-[#D6A35D]/20 bg-[#D6A35D]/10 px-3 py-2 text-xs font-medium text-[#D6A35D]">

          ACTIVE

        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">

          <h3 className="text-2xl font-semibold text-white">

            {name}

          </h3>

          <p className="mt-2 text-sm text-zinc-300">

            {style}

          </p>

        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 p-5">

        <div>

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">

            Gender

          </p>

          <p className="mt-2 text-sm text-white">

            {gender}

          </p>

        </div>

        <button className="rounded-2xl bg-[#D6A35D] px-5 py-3 text-sm font-medium text-black transition hover:bg-[#e7b56f]">

          Select

        </button>

      </div>

    </motion.div>
  );
}