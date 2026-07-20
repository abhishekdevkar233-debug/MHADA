"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { findRoute } from "@/lib/nav";
import Icon from "@/components/Icon";
import { Label, Toast } from "@/components/form/Field";
import { useLang } from "@/lib/i18n";
import { THEMES, useTheme } from "@/lib/theme";
import ThemeCustomizerPanel from "@/components/ThemeCustomizerPanel";

type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  tone: "primary" | "success" | "warning" | "danger";
};

const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", icon: "bill-process", title: "Bill Processing complete", detail: "BILL/2026/0417 — 564 employees processed.", time: "10 min ago", tone: "success" },
  { id: "n2", icon: "employee", title: "Leave request pending", detail: "Kalpana Nandan Pawar requested Casual Leave.", time: "42 min ago", tone: "warning" },
  { id: "n3", icon: "bill-create", title: "Salary Bill generated", detail: "BILL/2026/0417 for June 2026 is ready for review.", time: "1 hr ago", tone: "primary" },
  { id: "n4", icon: "bell", title: "Payroll deadline approaching", detail: "June 2026 payroll must be finalized by 25 Jul.", time: "3 hrs ago", tone: "danger" },
  { id: "n5", icon: "shield", title: "System announcement", detail: "Scheduled maintenance window on 21 Jul, 11 PM–1 AM.", time: "1 day ago", tone: "primary" },
];

const NOTIFICATION_TONE_CLS: Record<NotificationItem["tone"], string> = {
  primary: "bg-primary-tint text-primary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger/10 text-danger",
};

type TopbarProps = {
  onMenuOpen: () => void;
};

function currentCrumb(pathname: string, lang: "en" | "mr") {
  const key = pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  const found = findRoute(key);
  if (found) return { group: lang === "mr" ? found.groupDv : found.group, title: lang === "mr" ? found.titleDv : found.title };
  return lang === "mr" ? { group: "मुख्यपृष्ठ", title: "मुख्यपृष्ठ" } : { group: "Home", title: "Dashboard" };
}

export default function Topbar({ onMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const crumb = currentCrumb(pathname, lang);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {/* Left: menu toggle + page title / breadcrumb */}
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-ink hover:bg-canvas lg:hidden"
        >
          <Icon name="menu" className="h-[18px] w-[18px]" />
        </button>

        <div className={`min-w-0 flex-1 ${lang === "mr" ? "dv" : ""}`}>
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-2">
            <span className="truncate">{crumb.group}</span>
            <Icon name="chevron" className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-muted">{crumb.title}</span>
          </div>
          <h1 className="disp truncate text-[16px] leading-tight font-semibold text-ink">
            {crumb.title}
          </h1>
        </div>

        {/* Center: search (desktop) */}
        <div className="relative hidden max-w-xs flex-1 md:block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search employees, bills, reports…"
            aria-label="Search"
            className="h-9 w-full rounded-lg border border-border bg-canvas pr-3 pl-9 text-[13px] text-ink placeholder:text-muted-2 focus:border-primary focus:bg-surface focus:outline-none"
          />
        </div>

        {/* Right: actions + user */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher />

          <LanguageToggle lang={lang} onChange={setLang} />

          <button
            type="button"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink md:hidden"
          >
            <Icon name="search" className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            aria-label="Change Password"
            title="Change Password"
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-muted transition-colors hover:border-primary/40 hover:bg-primary-tint hover:text-primary sm:px-3"
          >
            <Icon name="key" className="h-[17px] w-[17px]" />
            <span className="hidden text-[12.5px] font-semibold sm:inline">Change Password</span>
          </button>
          <button
            type="button"
            aria-label="Help"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink sm:flex"
          >
            <Icon name="help" className="h-[18px] w-[18px]" />
          </button>
          <NotificationBell />

          <span className="mx-1 hidden h-8 w-px bg-border sm:block" />

          {/* User block */}
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-lg py-1 pr-1.5 pl-1 transition-colors hover:bg-canvas"
            title="Account"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">
              MU
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[13px] font-semibold text-ink">Mumbai Division</span>
              <span className="block text-[11px] text-muted">Payroll Administrator</span>
            </span>
            <Icon name="chevron" className="hidden h-3.5 w-3.5 rotate-90 text-muted-2 lg:block" />
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Log out"
            title="Log out"
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-danger transition-colors hover:border-danger/40 hover:bg-danger/8 sm:px-3"
          >
            <Icon name="logout" className="h-[17px] w-[17px]" />
            <span className="hidden text-[12.5px] font-semibold sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onLoggedOut={() => router.push("/")}
        />
      )}
    </header>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme, customColors } = useTheme();
  const [open, setOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <Icon name="palette" className="h-[18px] w-[18px]" />
      </button>

      <div
        className={`absolute top-full right-0 z-30 mt-2 w-[240px] origin-top-right rounded-xl border border-border bg-surface shadow-[0_20px_45px_-15px_rgba(22,35,28,0.35)] transition-all duration-150 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="border-b border-border-soft px-4 py-3">
          <h3 className="text-[13.5px] font-semibold text-ink">Theme</h3>
          <p className="mt-0.5 text-[11.5px] text-muted">Preview a different color palette</p>
        </div>
        <div className="p-1.5">
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors ${
                  active ? "bg-primary-tint" : "hover:bg-canvas"
                }`}
              >
                <span className="flex flex-shrink-0 items-center -space-x-1.5">
                  {t.swatches.map((c, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-full border border-white/80 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className={`flex-1 text-[12.5px] font-medium ${active ? "text-primary" : "text-ink"}`}>
                  {t.label}
                </span>
                {active && <Icon name="check" className="h-4 w-4 flex-shrink-0 text-primary" />}
              </button>
            );
          })}

          <div className="my-1.5 border-t border-border-soft" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCustomizerOpen(true);
            }}
            className={`flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors ${
              theme === "custom" ? "bg-primary-tint" : "hover:bg-canvas"
            }`}
          >
            <span className="flex flex-shrink-0 items-center -space-x-1.5">
              {[customColors.primary, customColors.secondary, customColors.accent1].map((c, i) => (
                <span key={i} className="h-4 w-4 rounded-full border border-white/80 shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </span>
            <span className={`flex-1 text-[12.5px] font-medium ${theme === "custom" ? "text-primary" : "text-ink"}`}>
              Theme 05 · Custom Theme…
            </span>
            {theme === "custom" ? (
              <Icon name="check" className="h-4 w-4 flex-shrink-0 text-primary" />
            ) : (
              <Icon name="chevron" className="h-3.5 w-3.5 flex-shrink-0 text-muted-2" />
            )}
          </button>
        </div>
      </div>

      {customizerOpen && <ThemeCustomizerPanel onClose={() => setCustomizerOpen(false)} />}
    </div>
  );
}

function LanguageToggle({ lang, onChange }: { lang: "en" | "mr"; onChange: (lang: "en" | "mr") => void }) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="mr-1 hidden flex-shrink-0 items-center gap-0.5 rounded-lg border border-border bg-canvas p-0.5 sm:flex"
    >
      <button
        type="button"
        onClick={() => onChange("en")}
        aria-pressed={lang === "en"}
        className={`rounded-[6px] px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
          lang === "en" ? "bg-primary text-white" : "text-muted hover:text-ink"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onChange("mr")}
        aria-pressed={lang === "mr"}
        className={`dv rounded-[6px] px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
          lang === "mr" ? "bg-primary text-white" : "text-muted hover:text-ink"
        }`}
      >
        मराठी
      </button>
    </div>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <Icon name="bell" className="h-[18px] w-[18px]" />
        <span className="absolute top-1.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
          {NOTIFICATIONS.length}
        </span>
      </button>

      <div
        className={`absolute top-full right-0 z-30 mt-2 w-[340px] origin-top-right rounded-xl border border-border bg-surface shadow-[0_20px_45px_-15px_rgba(22,35,28,0.35)] transition-all duration-150 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-soft px-4 py-3">
          <h3 className="text-[13.5px] font-semibold text-ink">Notifications</h3>
          <span className="rounded-full bg-primary-tint px-2 py-0.5 text-[11px] font-semibold text-primary">
            {NOTIFICATIONS.length} new
          </span>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex items-start gap-3 border-b border-border-soft px-4 py-3 last:border-0 hover:bg-canvas">
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${NOTIFICATION_TONE_CLS[n.tone]}`}>
                <Icon name={n.icon} className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-ink">{n.title}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-muted">{n.detail}</div>
                <div className="mt-1 text-[11px] text-muted-2">{n.time}</div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="#"
          onClick={() => setOpen(false)}
          className="block border-t border-border-soft px-4 py-2.5 text-center text-[12.5px] font-semibold text-primary hover:bg-primary-tint/60"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  );
}

function ChangePasswordModal({
  onClose,
  onLoggedOut,
}: {
  onClose: () => void;
  onLoggedOut: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function handleSave() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setError(null);
    setToast("Password updated. Please log in again.");
    window.setTimeout(() => {
      onClose();
      onLoggedOut();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
        <h3 className="text-[16px] font-semibold text-ink">Change your password</h3>
        <p className="mt-1 text-[13px] text-muted">
          Choose a new password for your account.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <Label required>Current Password</Label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <Label required>New Password</Label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <Label required>Confirm New Password</Label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-[12.5px] font-medium text-danger">{error}</p>}
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[9px] border-[1.5px] border-border py-2.5 text-[13.5px] font-semibold text-ink hover:border-muted-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-[9px] bg-primary py-2.5 text-[13.5px] font-semibold text-white hover:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
