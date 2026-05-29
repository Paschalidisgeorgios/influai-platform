"use client";

import GenerationGallery from "../../GenerationGallery";
import CreativePageHeader from "./CreativePageHeader";
import { useCreativeSuite } from "./CreativeSuiteProvider";

export default function CreativeAssets() {
  const { galleryRefreshKey, handleRegenerate } = useCreativeSuite();

  return (
    <div className="w-full">
      <CreativePageHeader
        titleEn="Assets"
        titleDe="Assets"
        subtitleEn="Manage generated images, videos and campaign assets."
        subtitleDe="Verwalte generierte Bilder, Videos und Kampagnenassets."
      />
      <GenerationGallery
        appearance="dark"
        refreshKey={galleryRefreshKey}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}
