"use client";

/**
 * Animasyonlu yumuşak bulanık blob arka planı.
 * Saf CSS/SVG, çok ince, koyu, accent-tonlu. Yavaş sürüklenir.
 * 21st.dev "blobs" konseptinin Apple koyu-sinematik temaya uyarlaması.
 */
export function Blobs({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Üstte ince ışık çizgisi */}
      <div
        className="absolute left-1/2 top-0 h-px w-[60%] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 50%, transparent), transparent)",
        }}
      />

      {/* Blob 1 — accent, sol üst */}
      <span
        className="blob-anim absolute -left-[10%] -top-[15%] h-[44vw] w-[44vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-accent) 40%, transparent), transparent 65%)",
          filter: "blur(80px)",
          opacity: 0.5,
          animationDelay: "0s",
        }}
      />

      {/* Blob 2 — mor-mavi, sağ üst */}
      <span
        className="blob-anim-2 absolute -right-[12%] top-[8%] h-[38vw] w-[38vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-stage-beta) 30%, transparent), transparent 65%)",
          filter: "blur(90px)",
          opacity: 0.35,
          animationDelay: "-6s",
        }}
      />

      {/* Blob 3 — soğuk gri, alt orta */}
      <span
        className="blob-anim absolute bottom-[-20%] left-[30%] h-[40vw] w-[40vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-accent-dim) 35%, transparent), transparent 60%)",
          filter: "blur(100px)",
          opacity: 0.3,
          animationDelay: "-12s",
        }}
      />

      {/* İnce nokta dokusu (shader hissi) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--border-strong) 1px, transparent 0)",
          backgroundSize: "44px 44px",
          opacity: 0.4,
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent 80%)",
        }}
      />

      <style jsx>{`
        @keyframes blobDrift {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(4%, 5%) scale(1.08);
          }
          66% {
            transform: translate(-3%, 2%) scale(0.96);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes blobDrift2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-5%, 4%) scale(1.1);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .blob-anim {
          animation: blobDrift 26s ease-in-out infinite;
        }
        .blob-anim-2 {
          animation: blobDrift2 32s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .blob-anim,
          .blob-anim-2 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
