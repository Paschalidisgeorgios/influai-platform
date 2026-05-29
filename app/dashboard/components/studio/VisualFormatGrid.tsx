"use client";

export type VisualFormatOption = {
  id: string;
  label: string;
  description?: string;
  value: string;
  ratio: string;
};

export type VisualFormatGridProps = {
  options: VisualFormatOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  variant?: "light" | "dark";
};

function ratioShapeClass(
  ratio: string,
  active: boolean,
  variant: "light" | "dark"
) {
  const shapeBase =
    variant === "dark"
      ? active
        ? "border-orange-500 bg-orange-500/20"
        : "border-white/20 bg-white/5"
      : active
        ? "border-orange-500 bg-orange-100"
        : "border-gray-300 bg-gray-50";

  switch (ratio) {
    case "1:1":
      return `w-12 h-12 rounded-lg ${shapeBase}`;
    case "9:16":
      return `w-8 h-14 rounded-lg ${shapeBase}`;
    case "16:9":
      return `w-16 h-9 rounded-lg ${shapeBase}`;
    case "4:5":
      return `w-10 h-14 rounded-lg ${shapeBase}`;
    case "3:4":
      return `w-10 h-[52px] rounded-lg ${shapeBase}`;
    default:
      return `w-12 h-12 rounded-lg ${shapeBase}`;
  }
}

function FormatWireframe({
  ratio,
  active,
  variant,
}: {
  ratio: string;
  active: boolean;
  variant: "light" | "dark";
}) {
  return (
    <div className="flex h-16 w-full items-center justify-center">
      <div className={`relative ${ratioShapeClass(ratio, active, variant)}`}>
        <div
          className={`absolute inset-2 rounded border ${
            active
              ? "border-orange-500/25"
              : variant === "dark"
                ? "border-white/20"
                : "border-gray-300/80"
          }`}
          aria-hidden
        />
      </div>
    </div>
  );
}

export default function VisualFormatGrid({
  options,
  value,
  onChange,
  className = "",
  ariaLabel = "Visual format",
  variant = "light",
}: VisualFormatGridProps) {
  return (
    <div
      id="visual-format-grid"
      role="group"
      aria-label={ariaLabel}
      className={`flex items-center gap-3 overflow-x-auto py-2 justify-start md:justify-center ${className}`}
    >
      {options.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            aria-label={`${option.label}, ${option.ratio}`}
            onClick={() => onChange(option.value)}
            className={`flex h-36 w-32 flex-shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border p-4 transition ${
              variant === "dark"
                ? active
                  ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 hover:border-orange-400"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                : active
                  ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-sm hover:border-gray-300"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <FormatWireframe ratio={option.ratio} active={active} variant={variant} />
            <div className="w-full text-center">
              <p
                className={`text-xs font-bold ${
                  active
                    ? variant === "dark"
                      ? "text-orange-300"
                      : "text-orange-700"
                    : variant === "dark"
                      ? "text-white/80"
                      : "text-slate-800"
                }`}
              >
                {option.label}
              </p>
              {option.description ? (
                <p
                  className={`mt-0.5 text-[11px] font-medium ${
                    variant === "dark" ? "text-white/45" : "text-slate-500"
                  }`}
                >
                  {option.description}
                </p>
              ) : (
                <p
                  className={`mt-0.5 text-[11px] font-medium ${
                    variant === "dark" ? "text-white/45" : "text-slate-500"
                  }`}
                >
                  {option.ratio}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
