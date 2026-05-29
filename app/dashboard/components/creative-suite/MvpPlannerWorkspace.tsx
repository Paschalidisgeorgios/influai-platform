"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getMatrixEntry, type ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import {
  getDefaultModelIdForActiveTool,
  getModelOptionsForActiveTool,
} from "@/lib/ai/krea-model-ui";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import ToolWorkspace from "../studio/ToolWorkspace";
import SocialFormatSelector from "../studio/SocialFormatSelector";
import type { WorkspacePreviewState } from "../studio/WorkspaceResultPanel";
import { planToTextResult } from "@/app/dashboard/hooks/useWorkspaceGeneration";

type MvpPlannerWorkspaceProps = {
  toolKey: ActiveTool;
};

function storageKey(tool: string) {
  return `influexai_mvp_${tool}`;
}

export default function MvpPlannerWorkspace({ toolKey }: MvpPlannerWorkspaceProps) {
  const tool = getMatrixEntry(toolKey);
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued } = useCreativeSuite();
  const supabase = createClient();

  const showModelSelect = toolKey === "node_editor" || toolKey === "batch_generator";
  const modelToolKey: ActiveTool = toolKey === "node_editor" ? "image" : toolKey;
  const modelOptions = useMemo(
    () => (showModelSelect ? getModelOptionsForActiveTool(modelToolKey) : []),
    [showModelSelect, modelToolKey]
  );
  const [selectedModel, setSelectedModel] = useState(() =>
    showModelSelect ? getDefaultModelIdForActiveTool(modelToolKey) : ""
  );

  useEffect(() => {
    if (showModelSelect) {
      setSelectedModel(getDefaultModelIdForActiveTool(modelToolKey));
    }
  }, [showModelSelect, modelToolKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Record<string, unknown> | null>(null);

  // Shared fields
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [duration, setDuration] = useState("7");
  const [basePrompt, setBasePrompt] = useState("");
  const [variants, setVariants] = useState("3");
  const [formats, setFormats] = useState("1:1, 9:16, 16:9");
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("natural");
  const [workflowSteps, setWorkflowSteps] = useState("Prompt → Image → Video → Publish");
  const [nodePrompt, setNodePrompt] = useState("");
  const [boardItems, setBoardItems] = useState<{ note: string; url: string }[]>([
    { note: "", url: "" },
  ]);

  useEffect(() => {
    if (!toolKey) return;
    try {
      const raw = localStorage.getItem(storageKey(toolKey));
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const saved = parsed.lastPlan;
        setPlan(
          saved && typeof saved === "object" && !Array.isArray(saved)
            ? (saved as Record<string, unknown>)
            : null
        );
        if (typeof parsed.title === "string") setTitle(parsed.title);
        if (typeof parsed.idea === "string") setIdea(parsed.idea);
      }
    } catch {
      /* ignore */
    }
  }, [toolKey]);

  const persist = useCallback(
    (lastPlan: Record<string, unknown>) => {
      if (!toolKey) return;
      localStorage.setItem(
        storageKey(toolKey),
        JSON.stringify({ title, idea, lastPlan, savedAt: new Date().toISOString() })
      );
    },
    [toolKey, title, idea]
  );

  const runPlanner = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? "mvp-local";

      const result = await handleGenerateForTool({
        toolKey,
        token,
        plannerPayload: payload,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const nextPlan = result.plan ?? payload;
      setPlan(nextPlan);
      persist(nextPlan);
    } catch {
      setError("Could not save plan.");
    } finally {
      setLoading(false);
    }
  };

  const buildCampaignPlan = () => {
    const days = Number(duration) || 7;
    const schedule = Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      format: i % 3 === 0 ? "9:16" : i % 3 === 1 ? "1:1" : "16:9",
      caption:
        language === "de"
          ? `Tag ${i + 1}: ${idea.slice(0, 60)}…`
          : `Day ${i + 1}: ${idea.slice(0, 60)}…`,
      hook: idea.slice(0, 120),
    }));
    return {
      title: title || idea.slice(0, 40) || "Campaign",
      platform,
      durationDays: days,
      idea,
      schedule,
      formats: ["9:16", "1:1", "16:9", "4:5"],
      nextStep: "/dashboard/image",
    };
  };

  const handleSubmit = async () => {
    if (!toolKey) return;

    if (toolKey === "node_editor") {
      if (!nodePrompt.trim()) {
        setError(language === "de" ? "Prompt erforderlich." : "Prompt required.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError("Session expired.");
          return;
        }
        const result = await handleGenerateForTool({
          toolKey: "image",
          token,
          prompt: nodePrompt.trim(),
          outputFormat: "square",
          kreaModelId: selectedModel || undefined,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setPlan({
          pipeline: workflowSteps,
          prompt: nodePrompt,
          generationId: result.generationId,
          status: "queued",
        });
        onGenerationQueued();
      } catch {
        setError("Pipeline failed.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (toolKey === "campaign_builder") {
      if (!idea.trim()) {
        setError(language === "de" ? "Kampagnenidee erforderlich." : "Campaign idea required.");
        return;
      }
      await runPlanner(buildCampaignPlan());
      return;
    }

    if (toolKey === "apps") {
      await runPlanner({
        title: title || "Workflow",
        steps: workflowSteps.split("→").map((s) => s.trim()),
        notes,
      });
      return;
    }

    if (toolKey === "batch_generator") {
      if (!basePrompt.trim()) {
        setError(language === "de" ? "Basis-Prompt erforderlich." : "Base prompt required.");
        return;
      }
      const count = Math.min(12, Math.max(1, Number(variants) || 3));
      const formatList = formats.split(",").map((f) => f.trim());
      await runPlanner({
        basePrompt,
        variantCount: count,
        formats: formatList,
        jobs: Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          prompt: `${basePrompt} — variant ${i + 1}`,
          format: formatList[i % formatList.length] ?? "1:1",
        })),
        launchUrl: "/dashboard/image",
      });
      return;
    }

    if (toolKey === "moodboards") {
      await runPlanner({
        title: title || "Moodboard",
        items: boardItems.filter((b) => b.note.trim() || b.url.trim()),
        notes,
      });
      return;
    }

    if (toolKey === "audio") {
      if (!script.trim()) {
        setError(language === "de" ? "Skript erforderlich." : "Script required.");
        return;
      }
      await runPlanner({
        script,
        voiceStyle,
        package: {
          scenes: script.split("\n").filter(Boolean),
          suggestedTool: "/dashboard/lipsync",
        },
      });
      return;
    }
  };

  const canSubmit =
    !!tool &&
    !loading &&
    (toolKey === "campaign_builder"
      ? idea.trim().length > 0
      : toolKey === "batch_generator"
        ? basePrompt.trim().length > 0
        : toolKey === "node_editor"
          ? nodePrompt.trim().length > 0
          : toolKey === "audio"
            ? script.trim().length > 0
            : toolKey === "moodboards"
              ? title.trim().length > 0 || boardItems.some((b) => b.note.trim())
              : title.trim().length > 0 || notes.trim().length > 0);

  const platformFormat =
    platform === "tiktok"
      ? "tiktok"
      : platform === "youtube"
        ? "youtube_thumbnail"
        : platform === "multi"
          ? "square"
          : "instagram_post";

  const submitLabel =
    toolKey === "node_editor"
      ? lang === "de"
        ? "Pipeline starten"
        : "Run pipeline"
      : lang === "de"
        ? "Plan erstellen"
        : "Create plan";

  const previewState: WorkspacePreviewState = useMemo(() => {
    if (!tool) return { status: "idle" };
    if (loading) {
      return {
        status: "loading",
        message: lang === "de" ? "Wird erstellt …" : "Creating …",
      };
    }
    if (error) {
      return { status: "error", message: error };
    }
    if (plan) {
      if (toolKey === "moodboards" && Array.isArray(plan.items)) {
        return {
          status: "success",
          result: {
            type: "text",
            content: String(plan.title ?? "Moodboard"),
            sections: (plan.items as { note: string; url?: string }[]).map(
              (it, i) => ({
                title: `#${i + 1}`,
                content: [it.note, it.url].filter(Boolean).join("\n"),
              })
            ),
          },
        };
      }
      return { status: "success", result: planToTextResult(plan, lang) };
    }
    return { status: "idle" };
  }, [tool, loading, error, plan, lang, toolKey]);

  if (!tool) return null;

  return (
    <ToolWorkspace
      embedded
      title={language === "de" ? tool.titleDe : tool.titleEn}
      subtitle={language === "de" ? tool.subtitleDe : tool.subtitleEn}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      showModelSelect={showModelSelect}
      showPrompt={false}
      promptText=""
      onPromptChange={() => {}}
      badges={tool.commandBarBadges}
      creditCost={tool.creditCost}
      availableCredits={credits}
      onGenerate={() => void handleSubmit()}
      generateDisabled={!canSubmit}
      loading={loading}
      generateLabel={submitLabel}
      previewState={previewState}
      idlePreviewLabel={
        lang === "de"
          ? "Dein Plan erscheint hier."
          : "Your plan will appear here."
      }
    >
        {toolKey === "campaign_builder" ? (
          <>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                {language === "de" ? "Kampagnenidee" : "Campaign idea"}
              </span>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={3}
                className="pointer-events-auto mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </label>
            <SocialFormatSelector
              value={platformFormat}
              onChange={(value) => {
                if (value === "tiktok" || value === "instagram_story") setPlatform("tiktok");
                else if (value === "youtube_thumbnail") setPlatform("youtube");
                else if (value === "square") setPlatform("multi");
                else setPlatform("instagram");
              }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {language === "de" ? "Dauer (Tage)" : "Duration (days)"}
                </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="pointer-events-auto mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
              </label>
            </div>
          </>
        ) : null}

        {toolKey === "apps" ? (
          <>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">
                {language === "de" ? "Workflow-Name" : "Workflow name"}
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">Steps (→ separated)</span>
              <input
                value={workflowSteps}
                onChange={(e) => setWorkflowSteps(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              />
            </label>
          </>
        ) : null}

        {toolKey === "batch_generator" ? (
          <>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">Base prompt</span>
              <textarea
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold text-slate-500">Variants</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={variants}
                  onChange={(e) => setVariants(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-500">Formats</span>
                <input
                  value={formats}
                  onChange={(e) => setFormats(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
                />
              </label>
            </div>
          </>
        ) : null}

        {toolKey === "moodboards" ? (
          <>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">
                {language === "de" ? "Board-Titel" : "Board title"}
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              />
            </label>
            {boardItems.map((item, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder={language === "de" ? "Notiz" : "Note"}
                  value={item.note}
                  onChange={(e) => {
                    const next = [...boardItems];
                    next[i] = { ...next[i], note: e.target.value };
                    setBoardItems(next);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
                />
                <input
                  placeholder="URL (optional)"
                  value={item.url}
                  onChange={(e) => {
                    const next = [...boardItems];
                    next[i] = { ...next[i], url: e.target.value };
                    setBoardItems(next);
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBoardItems((b) => [...b, { note: "", url: "" }])}
              className="text-xs font-bold text-orange-600"
            >
              + {language === "de" ? "Eintrag" : "Item"}
            </button>
          </>
        ) : null}

        {toolKey === "audio" ? (
          <>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">Script</span>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">
                {language === "de" ? "Stil" : "Style"}
              </span>
              <select
                value={voiceStyle}
                onChange={(e) => setVoiceStyle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
              >
                <option value="natural">Natural</option>
                <option value="energetic">Energetic</option>
                <option value="premium">Premium</option>
              </select>
            </label>
          </>
        ) : null}

        {toolKey === "node_editor" ? (
          <>
            <p className="text-xs text-slate-600">{workflowSteps}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {["Prompt", "Image", "Done"].map((step) => (
                <div
                  key={step}
                  className="rounded-xl border border-orange-200 bg-orange-50/40 px-3 py-4 text-center text-xs font-bold text-orange-700"
                >
                  {step}
                </div>
              ))}
            </div>
            <label className="block">
              <span className="text-xs font-bold text-slate-500">Image prompt</span>
              <textarea
                value={nodePrompt}
                onChange={(e) => setNodePrompt(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
              />
            </label>
          </>
        ) : null}

        {toolKey === "apps" ? (
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        ) : null}

        {toolKey === "moodboards" ? (
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900"
            />
          </label>
        ) : null}

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      {plan && toolKey === "campaign_builder" ? (
        <Link
          href="/dashboard/image"
          className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
        >
          {lang === "de"
            ? "Visuals in Image Studio erstellen"
            : "Create visuals in Image Studio"}
        </Link>
      ) : null}
    </ToolWorkspace>
  );
}
