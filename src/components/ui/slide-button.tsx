"use client";

import { useRef, useState, useCallback } from "react";
import { Icon } from "@/components/ui/icon";
import { cn, clamp } from "@/lib/utils";

/**
 * Kaydır-onayla kontrolü. Thumb'ı sağa sonuna kadar çekince onConfirm tetiklenir.
 * Apple koyu stil; dolgu rengi `color` prop'undan gelir (ör. var(--color-accent)).
 */
export function SlideButton({
  label,
  confirmLabel = "Bırak",
  doneLabel,
  color = "var(--color-accent)",
  icon = "ArrowRight",
  onConfirm,
  disabled,
  className,
}: {
  label: string;
  confirmLabel?: string;
  doneLabel?: string;
  color?: string;
  icon?: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0); // 0..1
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const THUMB = 44;

  const maxTravel = useCallback(() => {
    const w = trackRef.current?.clientWidth ?? 0;
    return Math.max(0, w - THUMB - 6); // 3px padding her iki yanda
  }, []);

  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    setPos(1);
    onConfirm();
  }, [done, onConfirm]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || done) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || disabled || done) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left - 3 - THUMB / 2;
    const t = clamp(x / maxTravel(), 0, 1);
    setPos(t);
    if (t >= 0.985) finish();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
    if (!done) {
      if (pos >= 0.985) finish();
      else setPos(0); // geri kay
    }
  };

  const travel = maxTravel();

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-[50px] w-full select-none overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--bg-hover)]",
        disabled && "opacity-40",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {/* dolgu */}
      <div
        className={cn("absolute inset-y-0 left-0 rounded-full", !dragging && "transition-[width] duration-300")}
        style={{
          width: `${6 + pos * travel + THUMB}px`,
          background: `color-mix(in srgb, ${color} ${22 + pos * 30}%, transparent)`,
        }}
      />
      {/* etiket */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10">
        <span
          className="text-sm font-medium transition-opacity"
          style={{
            color: pos > 0.4 ? color : "var(--text-dim)",
            opacity: done ? 0 : 1 - pos * 0.5,
          }}
        >
          {done ? doneLabel ?? label : pos > 0.55 ? confirmLabel : label}
        </span>
      </div>
      {/* thumb */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-[var(--shadow-pop)]",
          disabled || done ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          !dragging && "transition-[left] duration-300"
        )}
        style={{
          left: `${3 + pos * travel}px`,
          background: color,
        }}
      >
        <Icon name={done ? "Check" : icon} size={20} weight="bold" />
      </div>
    </div>
  );
}
