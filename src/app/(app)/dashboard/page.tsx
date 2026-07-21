"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const DEPARTMENTS = [
  { name: "Mumbai Board", count: 612 },
  { name: "Konkan Board", count: 384 },
  { name: "Pune Board", count: 356 },
  { name: "Nagpur Board", count: 298 },
  { name: "Nashik Board", count: 192 },
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
      <div className="animate-fade-in-up relative mb-6 rounded-xl border border-border bg-primary p-6 text-white sm:p-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden="true">
          <div
            className="absolute -top-10 -right-10 h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 right-24 h-40 w-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }}
          />
        </div>

        <Image
          src="/mhada-building.png"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1024}
          sizes="(min-width: 1280px) 420px, (min-width: 640px) 320px, 0px"
          priority
          className="pointer-events-none absolute right-4 bottom-0 hidden h-[calc(100%+1.75rem)] w-auto max-w-[42%] object-contain object-bottom sm:block md:right-8"
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[60%] sm:max-w-[55%]">
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
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k, i) => {
          const { key, ...rest } = k;
          return <KpiCard key={key} {...rest} delay={i * 60} />;
        })}
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
