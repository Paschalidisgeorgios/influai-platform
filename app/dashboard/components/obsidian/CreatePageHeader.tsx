"use client";



import { CREATE_PAGE } from "@/lib/copy/launch-user-copy";

import { useLanguage } from "@/hooks/useLanguage";



/** Static headline — ambient glow lives in StudioInnerEffectsLayer */

export default function CreatePageHeader() {

  const { isDe } = useLanguage();



  return (

    <header className="px-2 py-4 text-center sm:py-5">

      <h1 className="text-2xl font-bold tracking-tight text-[#F9FAFB] sm:text-3xl">

        {isDe ? CREATE_PAGE.headline.de : CREATE_PAGE.headline.en}

      </h1>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#9CA3AF]">

        {isDe ? CREATE_PAGE.subtitle.de : CREATE_PAGE.subtitle.en}

      </p>

    </header>

  );

}

