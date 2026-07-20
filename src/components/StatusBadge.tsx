"use client";

import { useT } from "@/lib/i18n";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLS: Record<Tone, string> = {
  success: "bg-primary-tint text-primary",
  warning: "bg-accent-tint text-accent-dark",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary-tint text-primary-dark",
  neutral: "bg-border-soft text-muted",
};

export default function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${TONE_CLS[tone]}`}>
      {t(label)}
    </span>
  );
}
