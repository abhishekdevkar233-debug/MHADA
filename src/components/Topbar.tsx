"use client";

import { usePathname, useRouter } from "next/navigation";
import { findRoute } from "@/lib/nav";
import Icon from "@/components/Icon";

type TopbarProps = {
  onMenuOpen: () => void;
};

function currentCrumb(pathname: string) {
  const key = pathname.replace(/^\//, "").split("/")[0] || "dashboard";
  const found = findRoute(key);
  if (found) return { group: found.group, title: found.title };
  return { group: "Home", title: "Dashboard" };
}

export default function Topbar({ onMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const crumb = currentCrumb(pathname);

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

        <div className="min-w-0 flex-1">
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
          <button
            type="button"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink md:hidden"
          >
            <Icon name="search" className="h-[18px] w-[18px]" />
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
    </header>
  );
}
