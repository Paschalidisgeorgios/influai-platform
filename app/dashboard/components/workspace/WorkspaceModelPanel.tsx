"use client";

type ModelCard = {
  name: string;
  status: string;
  statusClass: string;
  modelId?: string;
  credits?: string;
  pipeline?: string;
  active?: boolean;
};

type WorkspaceModelPanelProps = {
  title: string;
  cards: ModelCard[];
  footer?: string;
};

export function WorkspaceModelPanel({
  title,
  cards,
  footer,
}: WorkspaceModelPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
        {title}
      </p>
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={card.name}
            className={`rounded-xl border p-3 ${
              card.active
                ? "border-[#d8ad5f]/35 bg-[#d8ad5f]/10"
                : "border-white/10 bg-white/[0.03] opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-black text-white">{card.name}</p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${card.statusClass}`}
              >
                {card.status}
              </span>
            </div>
            {card.modelId ? (
              <p className="mt-1.5 font-mono text-[10px] leading-4 text-white/35">
                {card.modelId}
              </p>
            ) : null}
            {card.credits ? (
              <p className="mt-1 text-[10px] font-bold text-[#d8ad5f]">{card.credits}</p>
            ) : null}
            {card.pipeline ? (
              <p className="mt-1 text-[10px] leading-4 text-white/45">{card.pipeline}</p>
            ) : null}
          </div>
        ))}
      </div>
      {footer ? <p className="text-[10px] leading-4 text-white/35">{footer}</p> : null}
    </div>
  );
}
