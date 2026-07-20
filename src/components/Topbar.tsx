"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { findRoute } from "@/lib/nav";
import Icon from "@/components/Icon";
import { Label, Toast } from "@/components/form/Field";
import { useLang } from "@/lib/i18n";

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
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
          >
            <Icon name="bell" className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
              3
            </span>
          </button>

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
