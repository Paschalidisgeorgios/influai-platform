"use client";

type CopyButtonProps = {
  value: string;
  label?: string;
};

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard may be unavailable in some contexts.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-white/70 hover:border-white/30 hover:text-white"
      title={`Copy ${value}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "active" || value === "passed" || value === "completed"
      ? "bg-emerald-500/15 text-emerald-300"
      : value === "failed" || value === "failed_validation"
        ? "bg-red-500/15 text-red-300"
        : value === "processing"
          ? "bg-amber-500/15 text-amber-300"
          : "bg-white/10 text-white/70";

  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs ${tone}`}>
      {value}
    </span>
  );
}

export function AdminTableShell({
  title,
  description,
  children,
  toolbar,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-white/55">{description}</p>
          ) : null}
        </div>
        {toolbar}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export { StatusBadge };
