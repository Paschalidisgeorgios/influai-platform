"use client";

import { useReducedMotion } from "framer-motion";

export default function FloatingOrbs() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(216,173,95,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: prefersReducedMotion ? "none" : "orbDrift1 35s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: prefersReducedMotion ? "none" : "orbDrift2 42s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(60px,-40px); }
          66% { transform: translate(-30px,50px); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0,0); }
          33% { transform: translate(-50px,60px); }
          66% { transform: translate(40px,-30px); }
        }
      `}</style>
    </div>
  );
}
