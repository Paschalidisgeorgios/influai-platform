"use client";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";

export default function DashboardPage() {

  const router = useRouter();

  async function handleLogout() {

    await supabase.auth.signOut();

    router.push("/login");
  }

  return (

    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-16">

          <div>

            <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
              CineAI Studio
            </p>

            <h1 className="text-6xl font-bold">
              Dashboard
            </h1>

          </div>

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-2xl"
          >
            Logout
          </button>

        </div>

        {/* CONTENT */}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {/* CHARACTERS */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-4">
              Characters
            </h2>

            <p className="text-gray-500 mb-8">
              Create and manage cinematic AI characters.
            </p>

            <a
              href="/dashboard/characters"
              className="inline-block bg-[#c7a36a] text-black px-5 py-3 rounded-2xl font-semibold"
            >
              Open Characters
            </a>

          </div>

          {/* GALLERY */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-4">
              Gallery
            </h2>

            <p className="text-gray-500 mb-8">
              Browse all generated AI assets.
            </p>

            <a
              href="/dashboard/gallery"
              className="inline-block bg-[#c7a36a] text-black px-5 py-3 rounded-2xl font-semibold"
            >
              Open Gallery
            </a>

          </div>

          {/* GENERATOR */}

          <div className="bg-[#080808] border border-[#1a1a1a] rounded-3xl p-8">

            <h2 className="text-2xl font-bold mb-4">
              Image Generator
            </h2>

            <p className="text-gray-500 mb-8">
              Generate cinematic AI images.
            </p>

            <a
              href="/dashboard/image-generator"
              className="inline-block bg-[#c7a36a] text-black px-5 py-3 rounded-2xl font-semibold"
            >
              Open Generator
            </a>

          </div>

        </div>

      </div>

    </main>
  );
}