import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;

  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  console.log("CHARACTER:", character);
  console.log("ERROR:", error);

  if (!character) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Character not found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-12">

          <p className="text-[#c7a36a] uppercase tracking-[0.3em] text-sm mb-4">
            CineAI Character
          </p>

          <h1 className="text-6xl font-bold mb-4">
            {character.name}
          </h1>

          <p className="text-gray-400 text-lg">
            AI influencer reference profile
          </p>

        </div>

        {/* IMAGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {character.reference_images?.map((image: string) => (
            <div
              key={image}
              className="rounded-3xl overflow-hidden border border-[#1a1a1a]"
            >
              <img
                src={image}
                alt={character.name}
                className="w-full h-[500px] object-cover"
              />
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}