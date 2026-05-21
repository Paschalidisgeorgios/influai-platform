import CharacterLibrary from "@/app/components/CharacterLibrary";

export default function CharactersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-12">
          <p className="text-[#c7a36a] uppercase tracking-[0.35em] text-sm mb-4">
            CineAI Studio
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Character Library
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl">
            Manage your AI influencers, reference images and cinematic character assets.
          </p>
        </div>

        {/* ACTION BAR */}
        <div className="flex items-center justify-between mb-10">

          <div>
            <h2 className="text-2xl font-semibold">
              Your Characters
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              All saved AI character profiles
            </p>
          </div>

          <a
            href="/dashboard/characters/create"
            className="bg-[#c7a36a] hover:bg-[#d6b27a] transition-all duration-200 text-black font-semibold px-6 py-3 rounded-2xl"
          >
            Create Character
          </a>

        </div>

        {/* CHARACTER GRID */}
        <CharacterLibrary />

      </div>
    </main>
  );
}