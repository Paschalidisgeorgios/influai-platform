"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VideoCardProps {
  title: string;
  subtitle: string;
  badge: string;
  vertical?: boolean;
}

export default function VideoCard({
  title,
  subtitle,
  badge,
  vertical = false,
}: VideoCardProps) {

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
    >

      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden ${
          vertical
            ? "aspect-[4/5]"
            : "aspect-video"
        }`}
      >

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black transition duration-500 group-hover:scale-105" />

        {/* Glow */}
        <div className="absolute inset-0 bg-[#D6A35D]/0 transition duration-500 group-hover:bg-[#D6A35D]/10" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">

          <motion.div
            whileHover={{ scale: 1.08 }}
            className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-xl"
          >

            <Play
              className="ml-1 h-8 w-8 text-white"
              fill="white"
            />

          </motion.div>

        </div>

        {/* Top Badge */}
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-medium tracking-[0.2em] text-[#D6A35D] backdrop-blur-xl">

          {badge}

        </div>

        {/* Bottom Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6">

          <h3 className="text-2xl font-semibold">

            {title}

          </h3>

          <p className="mt-2 text-sm text-zinc-400">

            {subtitle}

          </p>

        </div>

      </div>

    </motion.div>
  );
}