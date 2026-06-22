"use client";

import { useEffect, useState } from "react";

/**
 * Daktilo efekti — bir dizi cümle arasında döner (yaz, bekle, sil, sonraki).
 * Yanıp sönen imleç ile. Hero'da kullanılır.
 */
export function Typewriter({
  phrases,
  className = "",
  typingSpeed = 55,
  deletingSpeed = 28,
  pause = 1600,
}: {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[index % phrases.length];

    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(
        () => {
          setText((prev) =>
            deleting
              ? current.slice(0, prev.length - 1)
              : current.slice(0, prev.length + 1)
          );
        },
        deleting ? deletingSpeed : typingSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, phrases, typingSpeed, deletingSpeed, pause]);

  return (
    <span className={className}>
      <span
        style={{ color: "var(--color-accent)" }}
        className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-stage-beta)] bg-clip-text text-transparent"
      >
        {text || " "}
      </span>
      <span
        aria-hidden
        className="tw-caret ml-0.5 inline-block w-[2px] translate-y-[2px] self-stretch"
        style={{ background: "var(--color-accent)" }}
      />
      <style jsx>{`
        .tw-caret {
          height: 1em;
          animation: twBlink 1s step-end infinite;
        }
        @keyframes twBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}
