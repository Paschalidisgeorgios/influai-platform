import GenerationGallery from "../../components/GenerationGallery";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-14">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            CineAI Studio
          </p>

          <h1 className="text-6xl font-bold mb-6">
            Generation Gallery
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl">
            View all your AI generated cinematic images.
          </p>

        </div>

        {/* GALLERY */}
        <GenerationGallery />

      </div>

    </main>
  );
}