"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Layers,
  Loader2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "./DashboardLanguageProvider";
import { formatCopy } from "./i18n";

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

const labelClass = "mb-2 block text-sm font-semibold text-slate-800";
const inputClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";
const textareaClass =
  "min-h-[88px] w-full resize-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";
const panelClass =
  "rounded-2xl border border-gray-100 bg-white shadow-sm";

export default function CharacterManager({
  onCharactersChange,
}: CharacterManagerProps) {
  const { copy, format } = useDashboardLanguage();
  const sp = copy.styleProfiles;
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
        showError(data.error || sp.loadFailed);
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
      showError(sp.loadFailed);
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
        showError(sp.signInAgain);
        return;
      }

      const cleanName = form.name.trim();

      if (!cleanName) {
        showError(sp.nameRequired);
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
        showError(data.error || sp.createFailed);
        return;
      }

      setForm(initialForm);
      showStatus(sp.created);
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Create character error:", error);
      showError(sp.createFailed);
    } finally {
      setCreating(false);
    }
  }

  async function deleteCharacter(characterId: string) {
    try {
      const confirmed = window.confirm(
        sp.deleteProfileConfirm
      );

      if (!confirmed) return;

      setDeletingCharacterId(characterId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError(sp.signInAgain);
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
        showError(data.error || sp.deleteFailed);
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

      showStatus(sp.deleted);
      onCharactersChange?.();
    } catch (error) {
      console.error("Delete character error:", error);
      showError(sp.deleteFailed);
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
        showError(sp.signInAgain);
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
        showError(data.error || sp.uploadFailed);
        return;
      }

      showStatus(sp.referenceUploaded);
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Reference upload error:", error);
      showError(sp.uploadFailed);
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
        showError(sp.signInAgain);
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
        showError(data.error || sp.coverFailed);
        return;
      }

      showStatus(sp.coverUpdated);
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Set primary reference error:", error);
      showError(sp.coverFailed);
    } finally {
      setUpdatingReferenceId(null);
    }
  }

  async function deleteReferenceImage(referenceImageId: string) {
    try {
      const confirmed = window.confirm(sp.deleteReferenceConfirm);
      if (!confirmed) return;

      setDeletingReferenceId(referenceImageId);
      setErrorMessage(null);

      const token = await getAccessToken();

      if (!token) {
        showError(sp.signInAgain);
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
        showError(data.error || sp.referenceDeleteFailed);
        return;
      }

      showStatus(sp.referenceDeleted);
      await loadCharacters();
      onCharactersChange?.();
    } catch (error) {
      console.error("Delete reference image error:", error);
      showError(sp.referenceDeleteFailed);
    } finally {
      setDeletingReferenceId(null);
    }
  }

  if (loading) {
    return (
      <section className={`${panelClass} p-8 text-center text-slate-600 sm:p-10`}>
        {sp.loading}
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

      <div className="rounded-[2rem] border border-[#d8ad5f]/20 bg-gradient-to-r from-[#d8ad5f]/[0.07] to-transparent px-5 py-4 sm:px-6">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
              {sp.guidanceTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{sp.guidanceBody}</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={createCharacter}
        className={`${panelClass} p-5 sm:p-6`}
      >
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d8ad5f]">
            {sp.newProfile}
          </p>

          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {sp.buildDirection}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {sp.buildDescription}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              {sp.profileName}
            </label>
            <input
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              placeholder={sp.profileNamePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {sp.creativeTag}
            </label>
            <input
              value={form.gender}
              onChange={(event) => updateForm("gender", event.target.value)}
              placeholder={sp.creativeTagPlaceholder}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass}>
            {sp.profileSummary}
          </label>
          <textarea
            value={form.description}
            onChange={(event) => updateForm("description", event.target.value)}
            placeholder={sp.profileSummaryPlaceholder}
            className={textareaClass}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
            {sp.creativeDirection}
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>
                {sp.appearanceDirection}
              </label>
              <textarea
                value={form.appearancePrompt}
                onChange={(event) =>
                  updateForm("appearancePrompt", event.target.value)
                }
                placeholder={sp.appearancePlaceholder}
                className={textareaClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {sp.styleDirection}
              </label>
              <textarea
                value={form.stylePrompt}
                onChange={(event) => updateForm("stylePrompt", event.target.value)}
                placeholder={sp.stylePlaceholder}
                className={textareaClass}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {sp.creating}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {sp.createProfile}
            </>
          )}
        </button>
      </form>

      {sortedCharacters.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[#d8ad5f]/20 bg-[#d8ad5f]/[0.03] px-6 py-16 text-center sm:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
            <UserRound className="h-7 w-7" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-900">
            {sp.emptyTitle}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            {sp.emptyBody}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
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
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative aspect-[2/1] overflow-hidden bg-gray-100 sm:aspect-[21/9]">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={`${character.name} cover`}
                      className="h-full w-full object-cover object-[center_25%]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-white/[0.04] via-black/30 to-black/50 px-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-[#d8ad5f]/30 bg-[#d8ad5f]/10 text-[#d8ad5f]">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {sp.noCoverYet}
                      </p>
                      <p className="max-w-xs text-[11px] leading-5 text-slate-500">
                        {sp.noCoverHint}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                    <span className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 backdrop-blur-sm">
                      {sp.styleProfileBadge}
                    </span>

                    {primaryReference && (
                      <span className="rounded-full border border-[#d8ad5f]/45 bg-[#d8ad5f]/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#efc777] backdrop-blur-xl">
                        {sp.coverReference}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        {character.name}
                      </h3>

                      {(character.gender_identity || character.gender) && (
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#d8ad5f]">
                          {character.gender_identity ?? character.gender}
                        </p>
                      )}

                        {character.description ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {character.description}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm italic text-slate-500">
                          {sp.noSummary}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCharacter(character.id)}
                      disabled={deletingCharacterId === character.id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingCharacterId === character.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {sp.removeProfile}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {sp.appearanceDirection}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {character.appearance_prompt?.trim() || sp.notDefined}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {sp.styleDirection}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {character.style_prompt?.trim() || sp.notDefined}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8ad5f]">
                          {sp.visualReferences}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {sp.uploadHint}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {references.length === 1
                            ? formatCopy(sp.referenceCount, {
                                count: references.length,
                              })
                            : formatCopy(sp.referenceCountPlural, {
                                count: references.length,
                              })}
                        </p>
                      </div>

                      <label className="inline-flex w-full shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d8ad5f]/35 bg-[#d8ad5f] px-4 py-2.5 text-xs font-black text-black shadow-[0_8px_24px_rgba(216,173,95,0.25)] transition hover:bg-[#efc777] sm:w-auto">
                        {uploadingCharacterId === character.id ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            {sp.uploading}
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            {sp.uploadReference}
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
                      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8ad5f]/25 bg-gradient-to-b from-[#d8ad5f]/[0.04] to-transparent px-5 py-10 text-center transition hover:border-[#d8ad5f]/40 sm:py-12">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-800">
                          {sp.addReferences}
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
                          {sp.addReferencesHint}
                        </p>
                        <span className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                          {sp.chooseImage}
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
                      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                        {references.map((reference) => (
                          <div
                            key={reference.id}
                            className={`group relative aspect-square overflow-hidden rounded-xl border sm:rounded-2xl ${
                              reference.is_primary
                                ? "border-[#d8ad5f]/60 ring-1 ring-[#d8ad5f]/25"
                                : "border-gray-200"
                            } bg-gray-100`}
                          >
                            <img
                              src={reference.image_url}
                              alt={`${character.name} visual reference`}
                              className="h-full w-full object-cover"
                            />

                            {reference.is_primary && (
                              <div className="absolute left-2 top-2 rounded-full bg-[#d8ad5f] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-black shadow-sm">
                                {sp.coverReference}
                              </div>
                            )}

                            <div className="absolute inset-x-2 bottom-2 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                              <button
                                type="button"
                                disabled={
                                  reference.is_primary ||
                                  updatingReferenceId === reference.id
                                }
                                onClick={() => setPrimaryReference(reference.id)}
                                className="flex h-8 flex-1 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                                title={sp.setCoverReference}
                                aria-label={sp.setCoverReference}
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
                                className="flex h-8 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                                title={sp.removeReference}
                                aria-label={sp.removeReference}
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
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}