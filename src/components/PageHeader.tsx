"use client";

import { findByKey } from "@/lib/nav";
import { useLang } from "@/lib/i18n";

/**
 * Shared breadcrumb + page title used at the top of every built screen, so
 * the language toggle can translate both from the nav.ts Marathi (`dv`)
 * labels without each screen re-implementing the same markup.
 */
export default function PageHeader({
  routeKey,
  title,
  group: groupOverride,
  subtitle,
  bare = false,
}: {
  /** Key into NAV — resolves breadcrumb group + leaf label. */
  routeKey: string;
  /** English page heading; falls back to the nav leaf label if omitted. */
  title?: string;
  /** English breadcrumb group text; falls back to the nav menu label if omitted. */
  group?: string;
  subtitle?: string;
  /** Skip the outer `mb-6` wrapper when the caller supplies its own (e.g. a header row with an action button). */
  bare?: boolean;
}) {
  const { lang } = useLang();
  const resolved = findByKey(routeKey);
  if (!resolved) return null;
  const { item, menu } = resolved;

  const group = lang === "mr" ? menu.dv : (groupOverride ?? menu.label);
  const leafLabel = lang === "mr" ? item.dv : item.label;
  const heading = lang === "mr" ? item.dv : (title ?? item.label);

  return (
    <div className={bare ? undefined : "mb-6"}>
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-border-soft px-3 py-1 text-[11.5px] font-medium text-muted-2 ${lang === "mr" ? "dv" : ""}`}>
        {group} <span>›</span> <span className="text-accent-dark">{leafLabel}</span>
      </div>
      <h1 className={`disp mt-3 text-[22px] font-semibold text-ink ${lang === "mr" ? "dv" : ""}`}>{heading}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}
