"use client";

export type ModelOption = {
  value: string;
  label: string;
  note?: string;
  credits?: number;
  badge?: string;
};

type ModelSelectorProps = {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  columns?: 1 | 2;
};

const FALLBACK: ModelOption = {
  value: "default",
  label: "Standard Engine",
  note: "Campaign-ready generation",
};

export default function ModelSelector({
  options,
  value,
  onChange,
  label = "Model / Engine",
  columns = 2,
}: ModelSelectorProps) {
  const resolved = options.length > 0 ? options : [FALLBACK];
  const active =
    resolved.find((o) => o.value === value)?.value ?? resolved[0]?.value ?? "default";

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <div
        className={`mt-2 grid gap-3 ${
          columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {resolved.map((option) => {
          const selected = active === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`flex min-h-28 cursor-pointer flex-col rounded-2xl border bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm ${
                selected
                  ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500"
                  : "border-gray-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{option.label}</span>
                {option.badge ? (
                  <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                    {option.badge}
                  </span>
                ) : null}
              </div>
              {option.note ? (
                <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-600">
                  {option.note}
                </p>
              ) : null}
              {typeof option.credits === "number" ? (
                <p className="mt-auto pt-2 text-xs font-bold text-orange-600">
                  {option.credits} Credits
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
