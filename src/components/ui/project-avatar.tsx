"use client";

import { Icon } from "./icon";
import type { Project } from "@/lib/types";

/** Projenin logosu varsa onu, yoksa renkli Phosphor ikonunu gösterir. */
export function ProjectAvatar({ project, size = 16, rounded = "md" }: { project: Pick<Project, "icon" | "color" | "logoUrl" | "name">; size?: number; rounded?: "md" | "lg" }) {
  if (project.logoUrl) {
    return (
      <img
        src={project.logoUrl}
        alt={project.name}
        width={size}
        height={size}
        className={rounded === "lg" ? "rounded-lg object-cover" : "rounded object-cover"}
        style={{ width: size, height: size }}
      />
    );
  }
  return <Icon name={project.icon} size={size} style={{ color: project.color }} />;
}
