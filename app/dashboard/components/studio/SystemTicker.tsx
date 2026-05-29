"use client";

type SystemTickerProps = {
  language: "de" | "en";
};

export default function SystemTicker({ language }: SystemTickerProps) {
  const text =
    language === "de"
      ? "System-Meldung: UNLIMITIERTE Seedance 2 + Kling 3.0 Rechen-Pipelines jetzt aktiv für Pro, Max und Business Pakete."
      : "System Announcement: UNLIMITED Seedance 2 + Kling 3.0 processing pipelines now active for Pro, Max, and Business tiers.";

  const doubled = `${text}     •     ${text}     •     `;

  return (
    <div
      className="mb-8 overflow-hidden rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-md"
      aria-live="polite"
    >
      <div className="flex items-center">
        <div className="ticker-track flex whitespace-nowrap">
          <span className="ticker-content px-4">{doubled}</span>
          <span className="ticker-content px-4" aria-hidden>
            {doubled}
          </span>
        </div>
      </div>
      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 28s linear infinite;
          will-change: transform;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
