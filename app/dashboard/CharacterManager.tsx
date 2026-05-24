"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Edit3,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Character = {
  id: string;
  name: string;
  description: string | null;
  appearance_prompt: string | null;
  style_prompt: string | null;
  gender: string | null;
  avatar_url: string | null;
  reference_image_url: string | null;
  face_workflow: string | null;
  created_at: string;
};

type CharacterManagerProps = {
  onCharactersChange?: () => void;
};

export default function CharacterManager({
  onCharactersChange,
}: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCharacterId, setUploadingCharacterId] = useState<
    string | null
  >(null);

  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [appearancePrompt, setAppearancePrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [gender, setGender] = useState("");

  const supabase = createClient();

  const isEditing = editingCharacterId !== null;

  useEffect(() => {
    loadCharacters();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  function resetForm() {
    setEditingCharacterId(null);
    setName("");
    setDescription("");
    setAppearancePrompt("");
    setStylePrompt("");
    setGender("");
  }

  function startEdit(character: Character) {
    setEditingCharacterId(character.id);
    setName(character.name);
    setDescription(character.description ?? "");
    setAppearancePrompt(character.appearance_prompt ?? "");
    setStylePrompt(character.style_prompt ?? "");
    setGender(character.gender ?? "");
  }

  async function loadCharacters() {
    try {
      setLoading(true);

      const token = await getAccessToken();

      if (!token) {
        throw new Error("No active session");
      }

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load characters");
      }

      setCharacters(data.characters || []);
    } catch (error) {
      console.error("Characters load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createCharacter() {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("No active session");
    }

    const response = await fetch("/api/characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        appearancePrompt,
        stylePrompt,
        gender,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create character");
    }

    setCharacters((prev) => [data.character, ...prev]);
  }

  async function updateCharacter() {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("No active session");
    }

    if (!editingCharacterId) {
      throw new Error("No character selected");
    }

    const response = await fetch("/api/characters/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        characterId: editingCharacterId,
        name,
        description,
        appearancePrompt,
        stylePrompt,
        gender,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update character");
    }

    setCharacters((prev) =>
      prev.map((character) =>
        character.id === editingCharacterId ? data.character : character
      )
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);

      if (isEditing) {
        await updateCharacter();
      } else {
        await createCharacter();
      }

      resetForm();
      onCharactersChange?.();
    } catch (error) {
      console.error("Character save error:", error);
      alert("Failed to save character.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCharacter(characterId: string) {
    try {
      const confirmed = window.confirm("Delete this character permanently?");

      if (!confirmed) return;

      const token = await getAccessToken();

      if (!token) return;

      const response = await fetch("/api/characters/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          characterId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete character");
      }

      setCharacters((prev) =>
        prev.filter((character) => character.id !== characterId)
      );

      if (editingCharacterId === characterId) {
        resetForm();
      }

      onCharactersChange?.();
    } catch (error) {
      console.error("Character delete error:", error);
      alert("Failed to delete character.");
    }
  }

  async function uploadReferenceImage(
    characterId: string,
    file: File | undefined
  ) {
    if (!file) return;

    try {
      setUploadingCharacterId(characterId);

      const token = await getAccessToken();

      if (!token) {
        throw new Error("No active session");
      }

      const formData = new FormData();
      formData.append("characterId", characterId);
      formData.append("file", file);

      const response = await fetch("/api/characters/upload-reference", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload reference image");
      }

      setCharacters((prev) =>
        prev.map((character) =>
          character.id === characterId ? data.character : character
        )
      );

      onCharactersChange?.();
    } catch (error) {
      console.error("Reference image upload error:", error);
      alert("Failed to upload reference image.");
    } finally {
      setUploadingCharacterId(null);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/35">
          AI Personas
        </p>

        <h2 className="mt-3 text-3xl font-black text-white">Characters</h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Create reusable AI personas. Add a reference image to prepare this
          character for face-consistent workflows.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">
              {isEditing ? "Edit character" : "Create character"}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {isEditing
                ? "Update this AI persona for future generations."
                : "Define a reusable AI persona for consistent visuals."}
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white transition hover:border-white/25"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Character name"
            required
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
          />

          <input
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            placeholder="Gender / identity"
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
          />
        </div>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short character description"
          className="mt-4 min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />

        <textarea
          value={appearancePrompt}
          onChange={(event) => setAppearancePrompt(event.target.value)}
          placeholder="Appearance prompt: face, hair, body type, age, ethnicity, signature details..."
          className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />

        <textarea
          value={stylePrompt}
          onChange={(event) => setStylePrompt(event.target.value)}
          placeholder="Style prompt: cinematic, fashion editorial, lighting, lens, color grading..."
          className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/80 disabled:opacity-50"
        >
          {isEditing ? (
            <Save className="mr-2 h-4 w-4" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}

          {saving
            ? "Saving..."
            : isEditing
              ? "Save character"
              : "Create character"}
        </button>
      </form>

      {loading ? (
        <div className="py-10 text-center text-white/50">
          Loading characters...
        </div>
      ) : characters.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
          No characters yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`relative overflow-hidden rounded-3xl border transition ${
                editingCharacterId === character.id
                  ? "border-white/35 bg-white/[0.08]"
                  : "border-white/10 bg-[#0a0a0a]"
              }`}
            >
              <div className="relative aspect-[4/3] bg-white/[0.03]">
                {character.reference_image_url || character.avatar_url ? (
                  <Image
                    src={character.reference_image_url ?? character.avatar_url!}
                    alt={character.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/35">
                    <UserRound className="h-10 w-10" />
                    <p className="text-xs font-bold uppercase tracking-[0.25em]">
                      No reference image
                    </p>
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-bold text-white backdrop-blur-xl">
                  {character.face_workflow ?? "openai"}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {character.name}
                    </h3>

                    {character.gender && (
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
                        {character.gender}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(character)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-white/15"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCharacter(character.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-red-500/20 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {character.description && (
                  <p className="line-clamp-3 text-sm leading-6 text-white/55">
                    {character.description}
                  </p>
                )}

                {character.appearance_prompt && (
                  <p className="mt-4 line-clamp-3 text-xs leading-5 text-white/35">
                    {character.appearance_prompt}
                  </p>
                )}

                <label className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:border-white/25">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  {uploadingCharacterId === character.id
                    ? "Uploading..."
                    : character.reference_image_url
                      ? "Replace reference"
                      : "Upload reference"}

                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCharacterId === character.id}
                    onChange={(event) => {
                      uploadReferenceImage(
                        character.id,
                        event.target.files?.[0]
                      );

                      event.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}