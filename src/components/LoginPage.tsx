"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import Icon from "@/components/Icon";

/**
 * UI prototype only — no real authentication. Any email/password (or none
 * at all) navigates straight to the dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
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
                htmlFor={emailId}
                className="mb-1.5 block text-[12.5px] font-semibold text-ink"
              >
                Email
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                placeholder="you@mhada.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-[13px] py-[11px] text-[14.5px] text-ink outline-none transition-colors focus:border-primary"
              />
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
                  className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-[13px] py-[11px] pr-11 text-[14.5px] text-ink outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-2 transition-colors hover:text-ink"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-[9px] bg-primary px-5 py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Log In
            </button>
          </form>

          <button
            type="button"
            className="mt-4 block w-full text-center text-[13px] font-semibold text-primary hover:text-primary-dark"
          >
            Forgot Password?
          </button>

          <div className="mt-[26px] text-center text-[11.5px] text-muted">
            For support, contact payroll.erp@mhada.gov.in
          </div>
        </div>
      </div>
    </div>
  );
}
