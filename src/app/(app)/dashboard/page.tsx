"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { EMPLOYEE_DIRECTORY } from "@/lib/employee-directory";

/* ---------------- Mock summary data (client-side only, no backend) ---------------- */

const KPIS = [
  { key: "total", label: "Total Employees", value: 1842, trend: "+2.4%", up: true, icon: "employee", tone: "primary" as const },
  { key: "active", label: "Active Employees", value: 1690, trend: "+1.1%", up: true, icon: "attendance", tone: "success" as const },
  { key: "retired", label: "Retired Employees", value: 94, trend: "+3", up: true, icon: "retirement", tone: "warning" as const },
  { key: "onleave", label: "Employees on Leave", value: 58, trend: "-6", up: false, icon: "leave-balance", tone: "primary" as const },
  { key: "billsgen", label: "Bills Generated", value: 417, trend: "+12", up: true, icon: "bill-create", tone: "success" as const },
  { key: "billsproc", label: "Bills Processed", value: 398, trend: "+9", up: true, icon: "bill-process", tone: "primary" as const },
  { key: "pending", label: "Pending Payroll Tasks", value: 12, trend: "-3", up: false, icon: "special-deduction", tone: "warning" as const },
];

const MONTHLY_BILLS = [
  { month: "Feb", generated: 380, processed: 372 },
  { month: "Mar", generated: 395, processed: 390 },
  { month: "Apr", generated: 402, processed: 396 },
  { month: "May", generated: 410, processed: 405 },
  { month: "Jun", generated: 417, processed: 398 },
  { month: "Jul", generated: 260, processed: 140 },
];

const DEPARTMENTS = [
  { name: "Mumbai Board", count: 612 },
  { name: "Konkan Board", count: 384 },
  { name: "Pune Board", count: 356 },
  { name: "Nagpur Board", count: 298 },
  { name: "Nashik Board", count: 192 },
];

const LEAVE_STATS = [
  { type: "Casual Leave", count: 214, tone: "primary" as const },
  { type: "Sick Leave", count: 132, tone: "warning" as const },
  { type: "Earned Leave", count: 96, tone: "success" as const },
  { type: "Other", count: 41, tone: "accent" as const },
];

const ATTENDANCE_SUMMARY = [
  { label: "Present", pct: 91, tone: "success" as const },
  { label: "On Leave", pct: 6, tone: "warning" as const },
  { label: "Absent", pct: 3, tone: "danger" as const },
];

const QUICK_ACTIONS = [
  { label: "Employee Records", desc: "Add or update service records", href: "/employee-records", icon: "employee" },
  { label: "Leave Management", desc: "Sanction and track leave", href: "/employee-leave", icon: "leave-assign" },
  { label: "Attendance", desc: "Review biometric attendance", href: "/attendance", icon: "attendance" },
  { label: "Payroll Bill", desc: "Generate a salary bill", href: "/bill-create", icon: "bill-create" },
  { label: "Bill Processing", desc: "Process an existing bill", href: "/bill-process", icon: "bill-process" },
  { label: "Reports", desc: "Deductions & pay slip reports", href: "/ij-all-deductions-report", icon: "bill-report" },
  { label: "Allowances & Deductions", desc: "Assign to an employee", href: "/allowance", icon: "allowance" },
];

type Activity = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  tone: "primary" | "success" | "warning";
};

const ACTIVITIES: Activity[] = [
  { id: "a1", icon: "employee", title: "Employee Added", detail: `${EMPLOYEE_DIRECTORY[0].name} added to ${EMPLOYEE_DIRECTORY[0].department}`, time: "10 min ago", tone: "success" },
  { id: "a2", icon: "leave-assign", title: "Leave Approved", detail: `${EMPLOYEE_DIRECTORY[1].name}'s Casual Leave sanctioned`, time: "42 min ago", tone: "success" },
  { id: "a3", icon: "bill-create", title: "Bill Generated", detail: "BILL/2026/0417 generated for June 2026", time: "1 hr ago", tone: "primary" },
  { id: "a4", icon: "bill-process", title: "Payroll Processed", detail: "June 2026 payroll processed for 564 employees", time: "2 hrs ago", tone: "success" },
  { id: "a5", icon: "retirement", title: "Employee Retired", detail: `${EMPLOYEE_DIRECTORY[5].name}'s retirement order recorded`, time: "1 day ago", tone: "warning" },
  { id: "a6", icon: "attendance", title: "Attendance Imported", detail: "Biometric attendance imported for July 2026", time: "1 day ago", tone: "primary" },
];

type Alert = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
};

const ALERTS: Alert[] = [
  { id: "al1", icon: "bill-process", title: "Pending Bills", detail: "19 bills awaiting processing for July 2026.", priority: "High" },
  { id: "al2", icon: "leave-assign", title: "Pending Leave Requests", detail: "7 leave requests awaiting sanction.", priority: "Medium" },
  { id: "al3", icon: "leave-balance", title: "Payroll Deadline", detail: "July 2026 payroll must be finalized by 25 Jul.", priority: "High" },
  { id: "al4", icon: "shield", title: "System Announcement", detail: "Scheduled maintenance on 21 Jul, 11 PM–1 AM.", priority: "Low" },
];

const PRIORITY_CLS: Record<Alert["priority"], string> = {
  High: "bg-danger/10 text-danger",
  Medium: "bg-warning-tint text-warning",
  Low: "bg-primary-tint text-primary",
};

const SYSTEM_STATUS = [
  { label: "Payroll Status", detail: "June 2026 payroll processed", status: "ok" as const },
  { label: "Biometric Sync Status", detail: "Last synced 5 minutes ago", status: "ok" as const },
  { label: "Last Database Sync", detail: "Delayed — last sync 32 minutes ago", status: "warn" as const },
  { label: "Report Generation Status", detail: "All scheduled reports up to date", status: "ok" as const },
];

const STATUS_DOT: Record<"ok" | "warn" | "down", string> = {
  ok: "bg-success",
  warn: "bg-warning",
  down: "bg-danger",
};

const CALENDAR_EVENTS: Record<number, { label: string; tone: "primary" | "success" | "warning" }> = {
  15: { label: "Attendance Cut-off", tone: "warning" },
  20: { label: "Restricted Holiday", tone: "success" },
  25: { label: "Payroll Processing Date", tone: "primary" },
  28: { label: "Leave Deadline", tone: "warning" },
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 24;
    const stepMs = duration / steps;
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / steps);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress >= 1) clearInterval(id);
    }, stepMs);
    return () => clearInterval(id);
  }, [target, duration]);
  return value;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Welcome */}
      <div className="animate-fade-in-up relative mb-6 overflow-hidden rounded-xl border border-border bg-primary p-6 text-white sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[12px] font-medium text-white/70">{greeting()}</div>
            <h1 className="disp mt-1 text-[22px] font-semibold sm:text-[24px]">Welcome, Mumbai Division</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-white/80">
              <span className="flex items-center gap-1.5">
                <Icon name="shield" className="h-3.5 w-3.5" />
                Mumbai Board · Payroll Administrator
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="leave-balance" className="h-3.5 w-3.5" />
                {now.toLocaleString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="dashboard" className="h-7 w-7" />
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k, i) => {
          const { key, ...rest } = k;
          return <KpiCard key={key} {...rest} delay={i * 60} />;
        })}
      </div>

      {/* Payroll overview */}
      <SectionHeading icon="bill-report" title="Payroll Overview" />
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Bills Generated vs Processed" subtitle="Last 6 months">
          <BillsBarChart />
        </ChartCard>
        <ChartCard title="Leave Statistics" subtitle="By leave type, this year">
          <LeaveStatsChart />
        </ChartCard>
        <ChartCard title="Attendance Summary" subtitle="July 2026">
          <AttendanceDonut />
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <SectionHeading icon="sliders" title="Quick Actions" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_ACTIONS.map((qa, i) => (
              <Link
                key={qa.href}
                href={qa.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className="animate-fade-in-up group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(22,35,28,0.18)]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon name={qa.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-ink">{qa.label}</div>
                  <div className="mt-0.5 text-[12px] text-muted">{qa.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Department overview */}
        <div>
          <SectionHeading icon="shield" title="Department Overview" />
          <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="space-y-3">
              {DEPARTMENTS.map((d, i) => {
                const max = DEPARTMENTS[0].count;
                return (
                  <div key={d.name}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-ink">{d.name}</span>
                      <span className="text-muted-2">{d.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border-soft">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${(d.count / max) * 100}%`, transitionDelay: `${i * 80}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activities */}
        <div className="lg:col-span-1">
          <SectionHeading icon="leave-balance" title="Recent Activities" />
          <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <ol className="space-y-4">
              {ACTIVITIES.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                      a.tone === "success" ? "bg-success-tint text-success" : a.tone === "warning" ? "bg-warning-tint text-warning" : "bg-primary-tint text-primary"
                    }`}
                  >
                    <Icon name={a.icon} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-border-soft pb-4 last:border-0 last:pb-0">
                    <div className="text-[12.5px] font-semibold text-ink">{a.title}</div>
                    <div className="mt-0.5 text-[12px] leading-snug text-muted">{a.detail}</div>
                    <div className="mt-1 text-[11px] text-muted-2">{a.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Notifications & alerts */}
        <div className="lg:col-span-1">
          <SectionHeading icon="bell" title="Notifications & Alerts" />
          <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="space-y-3">
              {ALERTS.map((al) => (
                <div key={al.id} className="flex items-start gap-3 border-b border-border-soft pb-3 last:border-0 last:pb-0">
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-canvas text-muted">
                    <Icon name={al.icon} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-ink">{al.title}</span>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRIORITY_CLS[al.priority]}`}>
                        {al.priority}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] leading-snug text-muted">{al.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-1">
          <SectionHeading icon="leave-assign" title="Calendar" />
          <MiniCalendar />
        </div>
      </div>

      {/* System status */}
      <SectionHeading icon="settings" title="System Status" />
      <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SYSTEM_STATUS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[s.status]}`} />
              <span className="text-[12.5px] font-semibold text-ink">{s.label}</span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-muted">{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Sub-components ---------------- */

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary-tint text-primary">
        <Icon name={icon} className="h-3.5 w-3.5" />
      </span>
      <h2 className="disp text-[14.5px] font-semibold text-ink">{title}</h2>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
  up,
  icon,
  tone,
  delay,
}: {
  label: string;
  value: number;
  trend: string;
  up: boolean;
  icon: string;
  tone: "primary" | "success" | "warning";
  delay: number;
}) {
  const count = useCountUp(value);
  const toneCls = tone === "success" ? "bg-success-tint text-success" : tone === "warning" ? "bg-warning-tint text-warning" : "bg-primary-tint text-primary";
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="animate-fade-in-up rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(22,35,28,0.18)]"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${toneCls}`}>
          <Icon name={icon} className="h-4.5 w-4.5" />
        </span>
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-success" : "text-danger"}`}>
          <Icon name={up ? "da-arrears" : "pay-change"} className="h-3 w-3" />
          {trend}
        </span>
      </div>
      <div className="disp mt-3 text-[24px] font-bold text-ink">{count.toLocaleString("en-IN")}</div>
      <div className="mt-0.5 text-[12px] text-muted">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
      <div className="mb-3">
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        <div className="text-[11.5px] text-muted-2">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function ChartTooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-[8px] bg-ink px-3 py-2 text-[11.5px] leading-snug text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
      {children}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink" />
    </div>
  );
}

function BillsBarChart() {
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  const max = Math.max(...MONTHLY_BILLS.map((m) => m.generated));

  // Line overlay tracking the processing rate (%), plotted across the chart width.
  const linePoints = MONTHLY_BILLS.map((m, i) => {
    const x = (i / (MONTHLY_BILLS.length - 1)) * 100;
    const rate = m.processed / m.generated;
    const y = 100 - rate * 100;
    return { x, y };
  });
  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div>
      <div className="relative flex h-36 items-end gap-3">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-dark)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={200}
            strokeDashoffset={ready ? 0 : 200}
            className="transition-[stroke-dashoffset] duration-[900ms] ease-out"
          />
          {ready &&
            linePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="var(--accent-dark)" vectorEffect="non-scaling-stroke" />
            ))}
        </svg>

        {MONTHLY_BILLS.map((m, i) => (
          <div
            key={m.month}
            className="relative flex h-full flex-1 flex-col items-center justify-end gap-1"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((v) => (v === i ? null : v))}
          >
            {hover === i && (
              <ChartTooltip>
                <div className="font-semibold">{m.month} 2026</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-tint" /> Generated: {m.generated}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Processed: {m.processed}
                </div>
                <div className="mt-1 text-white/70">{Math.round((m.processed / m.generated) * 100)}% processed</div>
              </ChartTooltip>
            )}
            <div className="flex h-full w-full items-end gap-0.5">
              <div
                className={`flex-1 rounded-t-[4px] transition-all duration-700 ease-out ${hover === i ? "bg-primary-tint/80" : "bg-primary-tint"}`}
                style={{ height: ready ? `${(m.generated / max) * 100}%` : "0%" }}
              />
              <div
                className={`flex-1 rounded-t-[4px] transition-all duration-700 ease-out ${hover === i ? "bg-primary-dark" : "bg-primary"}`}
                style={{ height: ready ? `${(m.processed / max) * 100}%` : "0%", transitionDelay: "80ms" }}
              />
            </div>
            <span className={`text-[10.5px] transition-colors ${hover === i ? "font-semibold text-ink" : "text-muted-2"}`}>{m.month}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary-tint" /> Generated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Processed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-dark" /> Processing rate
        </span>
      </div>
    </div>
  );
}

function LeaveStatsChart() {
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  const total = LEAVE_STATS.reduce((s, l) => s + l.count, 0);
  const toneCls: Record<string, string> = {
    primary: "bg-primary",
    warning: "bg-warning",
    success: "bg-success",
    accent: "bg-accent",
  };
  return (
    <div>
      <div className="relative flex h-6 w-full overflow-visible rounded-full bg-border-soft">
        <div className="flex h-full w-full overflow-hidden rounded-full">
          {LEAVE_STATS.map((l, i) => (
            <div
              key={l.type}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((v) => (v === i ? null : v))}
              className={`relative h-full cursor-pointer transition-all duration-700 ease-out ${toneCls[l.tone]} ${
                hover === i ? "opacity-100" : hover === null ? "opacity-100" : "opacity-50"
              }`}
              style={{ width: ready ? `${(l.count / total) * 100}%` : "0%" }}
            >
              {hover === i && (
                <ChartTooltip>
                  <div className="font-semibold">{l.type}</div>
                  <div className="text-white/80">
                    {l.count} days · {Math.round((l.count / total) * 100)}%
                  </div>
                </ChartTooltip>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {LEAVE_STATS.map((l, i) => (
          <div
            key={l.type}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((v) => (v === i ? null : v))}
            className={`flex items-center justify-between rounded-[6px] px-1.5 py-1 text-[12px] transition-colors ${
              hover === i ? "bg-canvas" : ""
            }`}
          >
            <span className="flex items-center gap-1.5 text-ink">
              <span className={`h-2 w-2 rounded-full ${toneCls[l.tone]}`} />
              {l.type}
            </span>
            <span className="font-medium text-muted-2">
              {l.count} <span className="text-muted-2/70">({Math.round((l.count / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceDonut() {
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const toneStroke: Record<string, string> = {
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  };
  const segments = ATTENDANCE_SUMMARY.reduce<{ label: string; pct: number; tone: string; dash: number; offset: number }[]>((acc, s) => {
    const dash = (s.pct / 100) * circumference;
    const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ label: s.label, pct: s.pct, tone: s.tone, dash, offset });
    return acc;
  }, []);
  const primary = ATTENDANCE_SUMMARY[0];

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-28 w-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-soft)" strokeWidth="10" />
          {segments.map((s, i) => (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={toneStroke[s.tone]}
              strokeWidth={hover === i ? "13" : "10"}
              strokeDasharray={`${ready ? s.dash : 0} ${circumference}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((v) => (v === i ? null : v))}
              className="cursor-pointer transition-all duration-700 ease-out"
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="disp text-[22px] font-bold text-ink">
            {hover !== null ? ATTENDANCE_SUMMARY[hover].pct : primary.pct}%
          </span>
          <span className="text-[10px] text-muted-2">{hover !== null ? ATTENDANCE_SUMMARY[hover].label : primary.label}</span>
        </div>
      </div>
      <div className="space-y-2">
        {ATTENDANCE_SUMMARY.map((s, i) => (
          <div
            key={s.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover((v) => (v === i ? null : v))}
            className={`flex items-center gap-2 rounded-[6px] px-1.5 py-1 text-[12px] transition-colors ${hover === i ? "bg-canvas" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full ${s.tone === "success" ? "bg-success" : s.tone === "warning" ? "bg-warning" : "bg-danger"}`} />
            <span className="text-ink">{s.label}</span>
            <span className="font-semibold text-muted-2">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(22,35,28,0.04)]">
      <div className="mb-2 text-center text-[13px] font-semibold text-ink">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="flex h-6 items-center justify-center text-[10px] font-semibold text-muted-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const isToday = day === today.getDate();
          const event = CALENDAR_EVENTS[day];
          const toneCls = event
            ? event.tone === "success"
              ? "bg-success-tint text-success"
              : event.tone === "warning"
                ? "bg-warning-tint text-warning"
                : "bg-primary-tint text-primary"
            : "";
          return (
            <div key={day} className="flex flex-col items-center py-0.5">
              <span
                title={event?.label}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] transition-colors ${
                  isToday ? "bg-primary font-semibold text-white" : event ? `font-medium ${toneCls}` : "text-ink hover:bg-canvas"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 space-y-1 border-t border-border-soft pt-2.5">
        {Object.entries(CALENDAR_EVENTS).map(([day, e]) => (
          <div key={day} className="flex items-center gap-2 text-[11px] text-muted">
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                e.tone === "success" ? "bg-success" : e.tone === "warning" ? "bg-warning" : "bg-primary"
              }`}
            />
            <span className="font-medium text-ink">{day}</span> {e.label}
          </div>
        ))}
      </div>
    </div>
  );
}
