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
};

function ratioShapeClass(ratio: string, active: boolean) {
  const shapeBase = active
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

function FormatWireframe({ ratio, active }: { ratio: string; active: boolean }) {
  return (
    <div className="flex h-16 w-full items-center justify-center">
      <div className={`relative ${ratioShapeClass(ratio, active)}`}>
        <div
          className={`absolute inset-2 rounded border ${
            active ? "border-orange-500/25" : "border-gray-300/80"
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
            className={`flex h-36 w-32 flex-shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border p-4 transition hover:border-gray-300 hover:shadow-sm ${
              active
                ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-sm"
                : "border-gray-200 bg-white"
            }`}
          >
            <FormatWireframe ratio={option.ratio} active={active} />
            <div className="w-full text-center">
              <p
                className={`text-xs font-bold ${
                  active ? "text-orange-700" : "text-slate-800"
                }`}
              >
                {option.label}
              </p>
              {option.description ? (
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                  {option.description}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] font-medium text-slate-500">
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
