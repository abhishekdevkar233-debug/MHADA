"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

function EyeIcon({ off }: { off: boolean }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.6a2.5 2.5 0 003.4 3.4M9.4 5.4A10.9 10.9 0 0112 5c5.5 0 9.5 4 11 7-.6 1.2-1.6 2.6-3 3.9M6.5 6.7C4.5 8 3 9.9 2 11c1.5 3 5.5 7 10 7 1.2 0 2.4-.3 3.5-.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.3"
      />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type FieldErrors = { username?: string; password?: string };

export default function LoginPage() {
  const router = useRouter();
  const usernameId = useId();
  const passwordId = useId();
  const usernameErrId = useId();
  const passwordErrId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function announce(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!username.trim()) next.username = "Enter your user name to continue.";
    if (!password) next.password = "Enter your password to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary-dark p-4 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(46,109,164,0.16), transparent 40%), radial-gradient(circle at 85% 80%, rgba(13,49,87,0.30), transparent 45%)",
        }}
      />

      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[24px] bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative flex flex-col justify-between gap-10 overflow-hidden bg-primary px-8 py-10 text-white sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="inline-flex items-center rounded-xl bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
              <Image
                src="/mhada-logo.png"
                alt="MHADA — Maharashtra Housing and Area Development Authority"
                width={962}
                height={486}
                priority
                className="h-9 w-auto sm:h-10"
              />
            </div>
            <div className="mt-3 max-w-[220px] text-[11px] leading-snug opacity-80">
              Maharashtra Housing &amp; Area Development Authority
            </div>
            <h1 className="disp mt-7 text-2xl leading-snug font-semibold sm:text-[26px]">
              Payroll Management
              <br />
              System
            </h1>
          </div>
          <div className="relative text-[12.5px] leading-relaxed opacity-75">
            A unified workspace for employee records, leave, salary
            adjustments, bill processing and statutory reporting across all
            MHADA divisions.
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-11 sm:py-12">
          <h2 className="text-xl font-semibold text-ink">Sign in to continue</h2>
          <p className="mt-1 mb-7 text-[13.5px] text-muted">
            Enter your MHADA credentials to access the payroll workspace.
          </p>

          <form noValidate onSubmit={handleSubmit}>
            <div className="mb-[18px]">
              <label
                htmlFor={usernameId}
                className="mb-1.5 block text-[12.5px] font-semibold text-ink"
              >
                User Name
              </label>
              <input
                id={usernameId}
                type="text"
                autoComplete="username"
                placeholder="e.g. mumbai_payroll"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? usernameErrId : undefined}
                className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-[13px] py-[11px] text-[14.5px] text-ink outline-none transition-colors focus:border-primary"
              />
              {errors.username && (
                <p id={usernameErrId} className="mt-1.5 text-[12px] font-medium text-danger">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="mb-[18px]">
              <label
                htmlFor={passwordId}
                className="mb-1.5 block text-[12.5px] font-semibold text-ink"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? passwordErrId : undefined}
                  className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-[13px] py-[11px] pr-11 text-[14.5px] text-ink outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-2 transition-colors hover:text-ink"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {errors.password && (
                <p id={passwordErrId} className="mt-1.5 text-[12px] font-medium text-danger">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-[9px] bg-primary px-5 py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-80"
            >
              {submitting && <Spinner />}
              {submitting ? "Signing in…" : "Log In"}
            </button>
          </form>

          <button
            type="button"
            onClick={() =>
              announce("Password reset link sent to your registered email.")
            }
            className="mt-4 block w-full text-center text-[13px] font-semibold text-primary hover:text-primary-dark"
          >
            Forgot Password?
          </button>

          <div className="mt-[26px] text-center text-[11.5px] text-muted">
            For support, contact payroll.erp@mhada.gov.in
          </div>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-ink px-[22px] py-[13px] text-[13.5px] font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition-all duration-300 ${
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-5 opacity-0"
        }`}
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
