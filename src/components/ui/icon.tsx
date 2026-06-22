"use client";

import * as Phosphor from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

interface Props extends IconProps {
  name: string;
}

/**
 * Dinamik Phosphor ikon. İsim string olarak gelir (seed/veri içinden).
 * Bulunamazsa Cube fallback.
 */
export function Icon({ name, weight, ...props }: Props) {
  const Cmp = (Phosphor as any)[name] ?? Phosphor.Cube;
  // Notion ruhu: ince/regular ikonlar, duotone değil
  return <Cmp weight={weight ?? "regular"} {...props} />;
}
