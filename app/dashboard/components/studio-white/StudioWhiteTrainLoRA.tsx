"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { getModelCatalogForTool } from "@/lib/ai/krea-model-ui";
import {
  TRAINING_REGISTRY_TO_TYPE,
  type CustomStyleTrainingType,
  isKreaTrainLoRARouteEnabled,
} from "@/lib/ai/krea-style-profiles";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

const TRAINING_TYPE_OPTIONS: {
  value: CustomStyleTrainingType;
  labelEn: string;
  labelDe: string;
  registryId: string;
}[] = [
  {
    value: "style",
    labelEn: "Style",
    labelDe: "Stil",
    registryId: "style_lora_training",
  },
  {
    value: "character",
    labelEn: "Character",
    labelDe: "Character",
    registryId: "character_lora_training",
  },
  {
    value: "product",
    labelEn: "Product / Object",
    labelDe: "Produkt / Objekt",
    registryId: "object_product_lora_training",
  },
  {
    value: "brand",
    labelEn: "Brand Style",
    labelDe: "Markenstil",
    registryId: "brand_style_training",
  },
];

export default function StudioWhiteTrainLoRA() {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const routeEnabled = isKreaTrainLoRARouteEnabled();

  const catalog = useMemo(
    () => getModelCatalogForTool("train_lora", language === "de" ? "de" : "en"),
    [language]
  );

  const [trainingType, setTrainingType] =
    useState<CustomStyleTrainingType>("style");
  const [name, setName] = useState("");
  const [triggerWord, setTriggerWord] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRegistryId, setSelectedRegistryId] = useState(
    "style_lora_training"
  );

  const selectedOption = TRAINING_TYPE_OPTIONS.find((o) => o.value === trainingType);
  const selectedModel = catalog.find((m) => m.value === selectedRegistryId);
  const credits = selectedModel?.credits;

  function onTypeChange(type: CustomStyleTrainingType) {
    setTrainingType(type);
    const match = TRAINING_TYPE_OPTIONS.find((o) => o.value === type);
    if (match) setSelectedRegistryId(match.registryId);
  }

  const disabled = !routeEnabled;
  const connectHint = isDe
    ? "Style Training wird gerade angebunden."
    : "Style Training is being connected.";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-4">
      <header className="text-center">
        <p className={OBS.mono}>{isDe ? "Style Training" : "Style Training"}</p>
        <h1 className={`mt-2 ${OBS.title} text-2xl sm:text-3xl`}>
          {isDe ? "Train LoRA" : "Train LoRA"}
        </h1>
        <p className="mt-3 text-sm text-neutral-400">
          {isDe
            ? "Lade 10–50 hochwertige Referenzbilder hoch, um einen wiederverwendbaren Stil zu trainieren."
            : "Upload 10–50 high-quality reference images to train a reusable style."}
        </p>
      </header>

      {!routeEnabled ? (
        <div
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-center text-sm text-amber-200/90"
          role="status"
        >
          {connectHint}
        </div>
      ) : null}

      <div className={`space-y-5 ${OBS.glassPad}`}>
        <div>
          <label className={`mb-2 block ${OBS.mono}`}>
            {isDe ? "Training-Typ" : "Training type"}
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TRAINING_TYPE_OPTIONS.map((opt) => {
              const active = trainingType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeChange(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                    active ? OBS.pillActive : OBS.pillIdle
                  }`}
                >
                  {isDe ? opt.labelDe : opt.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="train-name" className={`mb-2 block ${OBS.mono}`}>
            {isDe ? "Name" : "Name"}
          </label>
          <input
            id="train-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isDe ? "z. B. Campaign Amber Glow" : "e.g. Campaign Amber Glow"}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className={`mb-2 block ${OBS.mono}`}>
            {isDe ? "Referenzbilder" : "Reference images"}
          </label>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/40 px-6 py-10 text-center">
            <Upload className="mb-3 h-8 w-8 text-neutral-600" />
            <p className="text-sm text-neutral-400">
              {isDe
                ? "Upload folgt — 10–50 JPG/PNG Referenzen"
                : "Upload coming soon — 10–50 JPG/PNG references"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="train-trigger" className={`mb-2 block ${OBS.mono}`}>
              {isDe ? "Trigger Word (optional)" : "Trigger word (optional)"}
            </label>
            <input
              id="train-trigger"
              type="text"
              value={triggerWord}
              onChange={(e) => setTriggerWord(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="train-desc" className={`mb-2 block ${OBS.mono}`}>
              {isDe ? "Beschreibung (optional)" : "Description (optional)"}
            </label>
            <input
              id="train-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
        </div>

        {selectedOption ? (
          <p className="text-xs text-neutral-500">
            {isDe ? "Registry-Workflow" : "Registry workflow"}:{" "}
            <span className="text-neutral-400">{selectedRegistryId}</span>
            {TRAINING_REGISTRY_TO_TYPE[selectedRegistryId]
              ? ` · ${selectedOption.labelEn}`
              : null}
            {credits != null ? ` · ${credits} Credits` : null}
          </p>
        ) : null}

        <button
          type="button"
          disabled={disabled}
          title={disabled ? connectHint : undefined}
          className={`w-full py-3.5 text-sm font-black uppercase tracking-wide ${OBS.amberBtn} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {isDe ? "Training vorbereiten" : "Prepare training"}
        </button>
      </div>
    </div>
  );
}
