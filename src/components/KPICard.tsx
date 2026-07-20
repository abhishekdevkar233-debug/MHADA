import Icon from "@/components/Icon";

type Tone = "primary" | "accent" | "success" | "neutral";

const TONE_CLS: Record<Tone, string> = {
  primary: "bg-primary-tint text-primary",
  accent: "bg-accent-tint text-accent-dark",
  success: "bg-primary-tint text-primary",
  neutral: "bg-border-soft text-muted",
};

export default function KPICard({
  label,
  value,
  sub,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10.5px] font-semibold tracking-[0.03em] text-muted-2 uppercase">{label}</div>
        {icon && (
          <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] ${TONE_CLS[tone]}`}>
            <Icon name={icon} className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="disp mt-1.5 truncate text-[19px] font-semibold text-ink">{value}</div>
      {sub && <div className="mt-0.5 truncate text-[11px] text-muted">{sub}</div>}
    </div>
  );
}
