"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Lock,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Character = {
  id: string;
  name: string;
  gender?: string | null;
  gender_identity?: string | null;
  description?: string | null;
  appearance_prompt?: string | null;
  style_prompt?: string | null;
  reference_image_url?: string | null;
  face_workflow?: string | null;
  training_status?: string | null;
  training_provider?: string | null;
  training_model?: string | null;
  trained_model_url?: string | null;
  trained_model_version?: string | null;
  trained_trigger_word?: string | null;
  training_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ReferenceImage = {
  id: string;
  user_id: string;
  character_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number | null;
  is_primary: boolean;
  created_at: string;
};

type CharacterManagerProps = {
  onCharactersChange?: () => void;
};

type CharacterForm = {
  name: string;
  gender: string;
  description: string;
  appearancePrompt: string;
  stylePrompt: string;
};

const initialForm: CharacterForm = {
  name: "",
  gender: "",
  description: "",
  appearancePrompt: "",
  stylePrompt: "",
};

export default function CharacterManager({
  onCharactersChange,
}: CharacterManagerProps) {
  const supabase = createClient();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [referenceImagesByCharacter, setReferenceImagesByCharacter] = useState<
    Record<string, ReferenceImage[]>
  >({});

  const [form, setForm] = useState<CharacterForm>(initialForm);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploadingCharacterId, setUploadingCharacterId] = useState<
    string | null
  >(null);
  const [updatingReferenceId, setUpdatingReferenceId] = useState<string | null>(
    null
  );
  const [deletingReferenceId, setDeletingReferenceId] = useState<string | null>(
    null
  );
  const [deletingCharacterId, setDeletingCharacterId] = useState<string | null>(
    null
  );

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedCharacters = useMemo(() => {
    return [...characters].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;

      return bTime - aTime;
    });
  }, [characters]);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  function showStatus(message: string) {
    setStatusMessage(message);
    setErrorMessage(null);

    window.setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  }

  function showError(message: string) {
    setErrorMessage(message);
    setStatusMessage(null);
  }

  async function loadCharacters() {
    try {
      setLoading(true);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        setCharacters([]);
        return;
      }

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to load style profiles.");
        return;
      }

      const nextCharacters: Character[] =
        data.characters ?? data.aiCharacters ?? [];

      setCharacters(nextCharacters);

      await Promise.all(
        nextCharacters.map((character) => loadReferenceImages(character.id))
      );
    } catch (error) {
      console.error("Load characters error:", error);
      showError("Failed to load style profiles.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReferenceImages(characterId: string) {
    try {
      const token = await getAccessToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `/api/characters/reference-images?characterId=${encodeURIComponent(
          characterId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Reference image load failed:", data.error);
        return;
      }

      setReferenceImagesByCharacter((current) => ({
        ...current,
        [characterId]: data.images ?? [],
      }));
    } catch (error) {
      console.error("Load reference images error:", error);
    }
  }

  function updateForm<K extends keyof CharacterForm>(
    key: K,
    value: CharacterForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function createCharacter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setCreating(true);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError("Please sign in again.");
        return;
      }

      const cleanName = form.name.trim();

      if (!cleanName) {
        showError("Style profile name is required.");
        return;
      }

      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
          gender: form.gender.trim(),
          genderIdentity: form.gender.trim(),
          description: form.description.trim(),
          appearancePrompt: form.appearancePrompt.trim(),
          stylePrompt: form.stylePrompt.trim(),
          gender_identity: form.gender.trim(),
          appearance_prompt: form.appearancePrompt.trim(),
          style_prompt: form.stylePrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to create style profile.");
        return;
      }

      setForm(initialForm);
      showStatus("Style profile created.");
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Create character error:", error);
      showError("Failed to create style profile.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteCharacter(characterId: string) {
    try {
      const confirmed = window.confirm(
        "Delete this style profile and all its visual references?"
      );

      if (!confirmed) return;

      setDeletingCharacterId(characterId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError("Please sign in again.");
        return;
      }

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showError(data.error || "Failed to delete style profile.");
        return;
      }

      setCharacters((current) =>
        current.filter((character) => character.id !== characterId)
      );

      setReferenceImagesByCharacter((current) => {
        const copy = { ...current };
        delete copy[characterId];
        return copy;
      });

      showStatus("Style profile deleted.");
      onCharactersChange?.();
    } catch (error) {
      console.error("Delete character error:", error);
      showError("Failed to delete style profile.");
    } finally {
      setDeletingCharacterId(null);
    }
  }

  async function uploadReferenceImage(characterId: string, file: File) {
    try {
      setUploadingCharacterId(characterId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError("Please sign in again.");
        return;
      }

      const existingImages = referenceImagesByCharacter[characterId] ?? [];

      const formData = new FormData();
      formData.set("characterId", characterId);
      formData.set("file", file);
      formData.set("isPrimary", existingImages.length === 0 ? "true" : "false");

      const response = await fetch("/api/characters/reference-images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to upload visual reference.");
        return;
      }

      showStatus("Visual reference uploaded.");
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Reference upload error:", error);
      showError("Failed to upload visual reference.");
    } finally {
      setUploadingCharacterId(null);
    }
  }

  async function setPrimaryReference(referenceImageId: string) {
    try {
      setUpdatingReferenceId(referenceImageId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError("Please sign in again.");
        return;
      }

      const response = await fetch("/api/characters/reference-images", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          referenceImageId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to set cover reference.");
        return;
      }

      showStatus("Cover reference updated.");
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Set primary reference error:", error);
      showError("Failed to set cover reference.");
    } finally {
      setUpdatingReferenceId(null);
    }
  }

  async function deleteReferenceImage(referenceImageId: string) {
    try {
      const confirmed = window.confirm("Delete this visual reference?");
      if (!confirmed) return;

      setDeletingReferenceId(referenceImageId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError("Please sign in again.");
        return;
      }

      const response = await fetch("/api/characters/reference-images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          referenceImageId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.error || "Failed to delete visual reference.");
        return;
      }

      showStatus("Visual reference deleted.");
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Delete reference image error:", error);
      showError("Failed to delete visual reference.");
    } finally {
      setDeletingReferenceId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-8 text-center text-white/50 sm:rounded-[2rem] sm:p-10">
        Loading style profiles...
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {statusMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-bold text-emerald-100">
          <CheckCircle2 className="h-4 w-4" />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-100">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      <div className="rounded-[2rem] border border-[#d8ad5f]/15 bg-[#d8ad5f]/[0.04] px-5 py-4 sm:px-6">
        <p className="text-sm leading-6 text-white/55 sm:leading-6">
          Style profiles guide look, mood, styling and brand direction. They do
          not act as fixed identity models.
        </p>
      </div>

      <form
        onSubmit={createCharacter}
        className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:p-6"
      >
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d8ad5f]">
            New style profile
          </p>

          <h3 className="mt-3 text-xl font-black tracking-tight text-white sm:text-2xl">
            Build creative direction
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Define reusable appearance and styling direction for campaign
            visuals, portraits and product shots.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => updateForm("name", event.target.value)}
            placeholder="Profile name"
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#d8ad5f]/40"
          />

          <input
            value={form.gender}
            onChange={(event) => updateForm("gender", event.target.value)}
            placeholder="Creative tag (optional)"
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#d8ad5f]/40"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(event) => updateForm("description", event.target.value)}
          placeholder="Short profile description"
          className="mt-4 min-h-[86px] w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#d8ad5f]/40"
        />

        <textarea
          value={form.appearancePrompt}
          onChange={(event) =>
            updateForm("appearancePrompt", event.target.value)
          }
          placeholder="Appearance direction: hair, age range, wardrobe, signature look, subject framing..."
          className="mt-4 min-h-[96px] w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#d8ad5f]/40"
        />

        <textarea
          value={form.stylePrompt}
          onChange={(event) => updateForm("stylePrompt", event.target.value)}
          placeholder="Style direction: lighting, lens, color grading, mood, brand aesthetic..."
          className="mt-4 min-h-[96px] w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-white/30 focus:border-[#d8ad5f]/40"
        />

        <button
          type="submit"
          disabled={creating}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create style profile
            </>
          )}
        </button>
      </form>

      {sortedCharacters.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <UserRound className="mx-auto h-10 w-10 text-white/25" />
          <p className="mt-4 text-sm font-bold text-white/45">
            No style profiles yet.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/30">
            Create your first profile, then add visual references to guide
            future generations.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {sortedCharacters.map((character) => {
            const references = referenceImagesByCharacter[character.id] ?? [];
            const primaryReference = references.find(
              (reference) => reference.is_primary
            );
            const displayImage =
              primaryReference?.image_url ?? character.reference_image_url;

            return (
              <article
                key={character.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black/35">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={character.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-white/[0.03] to-black/40 text-white/35">
                      <ImagePlus className="h-9 w-9" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">
                        Add cover reference
                      </p>
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                      Style Profile
                    </span>

                    {primaryReference && (
                      <span className="rounded-full border border-[#d8ad5f]/40 bg-[#d8ad5f]/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#d8ad5f] backdrop-blur-xl">
                        Cover Reference
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteCharacter(character.id)}
                    disabled={deletingCharacterId === character.id}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-xl transition hover:scale-105 disabled:opacity-50"
                  >
                    {deletingCharacterId === character.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {character.name}
                    </h3>

                    {(character.gender_identity || character.gender) && (
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-[#d8ad5f]">
                        {character.gender_identity ?? character.gender}
                      </p>
                    )}

                    {character.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                        {character.description}
                      </p>
                    )}

                    {character.appearance_prompt && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                          Appearance Direction
                        </p>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/55">
                          {character.appearance_prompt}
                        </p>
                      </div>
                    )}

                    {character.style_prompt && (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                          Style Direction
                        </p>
                        <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/55">
                          {character.style_prompt}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-white">
                          Visual References
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/35">
                          {references.length} reference
                          {references.length === 1 ? "" : "s"} for this profile.
                        </p>
                      </div>

                      <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2.5 text-xs font-black text-black shadow-[0_8px_24px_rgba(255,255,255,0.12)] transition hover:bg-white/85 sm:w-auto">
                        {uploadingCharacterId === character.id ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Uploading
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Upload
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingCharacterId === character.id}
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                              uploadReferenceImage(character.id, file);
                            }

                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>

                    {references.length === 0 ? (
                      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8ad5f]/25 bg-[#d8ad5f]/[0.03] px-6 py-12 text-center transition hover:border-[#d8ad5f]/40 hover:bg-[#d8ad5f]/[0.06]">
                        <Upload className="h-8 w-8 text-[#d8ad5f]" />
                        <p className="mt-4 text-sm font-bold text-white">
                          Upload visual references
                        </p>
                        <p className="mt-2 max-w-xs text-xs leading-5 text-white/40">
                          Upload mood frames or product shots. The first file
                          becomes the cover reference.
                        </p>
                        <span className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                          Choose files
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingCharacterId === character.id}
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                              uploadReferenceImage(character.id, file);
                            }

                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    ) : (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                        {references.map((reference) => (
                          <div
                            key={reference.id}
                            className={`group relative aspect-square overflow-hidden rounded-2xl border ${
                              reference.is_primary
                                ? "border-[#d8ad5f]/70"
                                : "border-white/10"
                            } bg-black/40`}
                          >
                            <img
                              src={reference.image_url}
                              alt={`${character.name} reference`}
                              className="h-full w-full object-cover"
                            />

                            {reference.is_primary && (
                              <div className="absolute left-2 top-2 rounded-full bg-[#d8ad5f] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-black">
                                Cover Reference
                              </div>
                            )}

                            <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                              <button
                                type="button"
                                disabled={
                                  reference.is_primary ||
                                  updatingReferenceId === reference.id
                                }
                                onClick={() => setPrimaryReference(reference.id)}
                                className="flex h-8 flex-1 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Set as cover reference"
                              >
                                {updatingReferenceId === reference.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Star className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={deletingReferenceId === reference.id}
                                onClick={() =>
                                  deleteReferenceImage(reference.id)
                                }
                                className="flex h-8 flex-1 items-center justify-center rounded-full bg-red-500/90 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete reference"
                              >
                                {deletingReferenceId === reference.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-white/50">
                        <Lock className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d8ad5f]">
                          Advanced consistency
                        </p>

                        <p className="mt-2 text-sm leading-6 text-white/55">
                          Coming later. Advanced consistency modules are not
                          active in this release. Profiles currently guide
                          standard OpenAI image generation only.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}