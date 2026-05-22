import Navbar from "./components/landing/Navbar";

import HeroSection from "./components/landing/HeroSection";

import FeatureSection from "./components/landing/FeatureSection";

import GallerySection from "./components/landing/GallerySection";

import CTASection from "./components/landing/CTASection";

export default function HomePage() {

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* NAVBAR */}

      <Navbar />

      {/* HERO */}

      <HeroSection />

      {/* FEATURES */}

      <FeatureSection />

      {/* GALLERY */}

      <GallerySection />

      {/* CTA */}

      <CTASection />

    </main>
  );
}