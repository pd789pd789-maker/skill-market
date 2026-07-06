"use client";

import { Bot, Braces, Boxes, Command, Sparkles } from "lucide-react";
import { PLATFORM_LABELS } from "@/lib/catalog/constants";
import type { Platform } from "@/lib/catalog/types";

const iconMap = {
  codex: Command,
  claude: Bot,
  cursor: Boxes,
  gemini: Sparkles,
  "multi-agent": Braces,
} satisfies Record<Platform, React.ComponentType<{ className?: string }>>;

const colorMap = {
  codex: "bg-slate-950 text-white",
  claude: "bg-orange-100 text-orange-900",
  cursor: "bg-zinc-900 text-white",
  gemini: "bg-cyan-100 text-cyan-800",
  "multi-agent": "bg-emerald-100 text-emerald-800",
} satisfies Record<Platform, string>;

export function PlatformBadge({
  platform,
  muted = false,
}: {
  platform: Platform;
  muted?: boolean;
}) {
  const Icon = iconMap[platform];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        muted ? "bg-slate-100 text-slate-600" : colorMap[platform]
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {PLATFORM_LABELS[platform]}
    </span>
  );
}

export function PlatformMark({ platform }: { platform: Platform }) {
  const Icon = iconMap[platform];

  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 ${colorMap[platform]}`}
      aria-label={PLATFORM_LABELS[platform]}
      title={PLATFORM_LABELS[platform]}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
