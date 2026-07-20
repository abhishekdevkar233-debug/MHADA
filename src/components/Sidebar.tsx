"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import Icon from "@/components/Icon";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

function activeMenuKey(pathname: string): string | null {
  for (const menu of NAV) {
    if (menu.children.length === 0) {
      if (pathname === `/${menu.key}`) return menu.key;
    } else if (menu.children.some((c) => c.href === pathname)) {
      return menu.key;
    }
  }
  return null;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const activeKey = activeMenuKey(pathname);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeKey ? [activeKey] : []),
  );

  // Keep the menu that owns the current route expanded on navigation, without
  // an effect — adjust state during render when the active route changes.
  const [prevActive, setPrevActive] = useState(activeKey);
  if (activeKey !== prevActive) {
    setPrevActive(activeKey);
    if (activeKey && !expanded.has(activeKey)) {
      const next = new Set(expanded);
      next.add(activeKey);
      setExpanded(next);
    }
  }

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-ink/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col bg-primary-dark text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 border-b border-white/12 px-4 py-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-white p-0.5">
              <Image
                src="/mhada-emblem.png"
                alt="MHADA"
                width={476}
                height={498}
                className="h-full w-full object-contain"
                priority
              />
            </span>
            <span className="leading-tight">
              <span className="disp block text-[13.5px] font-semibold">MHADA Payroll</span>
              <span className="block text-[10.5px] text-white/60">Management System</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {/* Nav — 8 top-level menus */}
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Primary">
          {NAV.filter((menu) => !menu.hidden).map((menu) => {
            const isActiveMenu = menu.key === activeKey;

            // Childless top menu (e.g. Remuneration) renders as a direct link.
            if (menu.children.length === 0) {
              const active = pathname === `/${menu.key}`;
              return (
                <Link
                  key={menu.key}
                  href={`/${menu.key}`}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                    active
                      ? "bg-accent text-white"
                      : "text-white/85 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon
                    name={menu.icon}
                    className="h-[18px] w-[18px] flex-shrink-0 text-white/70"
                  />
                  <span className="min-w-0 flex-1 truncate">{menu.label}</span>
                </Link>
              );
            }

            const isOpen = expanded.has(menu.key);
            return (
              <div key={menu.key} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => toggle(menu.key)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2.5 text-left text-[13.5px] font-semibold transition-colors ${
                    isActiveMenu
                      ? "text-white"
                      : "text-white/85 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon
                    name={menu.icon}
                    className="h-[18px] w-[18px] flex-shrink-0 text-white/70"
                  />
                  <span className="min-w-0 flex-1 truncate">{menu.label}</span>
                  <Icon
                    name="chevron"
                    className={`h-3.5 w-3.5 flex-shrink-0 text-white/45 transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-0.5 mb-1 space-y-0.5 pl-3">
                    {menu.children.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-[7px] py-1.5 pr-2 pl-3 text-[12.5px] transition-colors ${
                            active
                              ? "bg-accent font-medium text-white"
                              : "text-white/70 hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                              active ? "bg-white" : "bg-white/30"
                            }`}
                          />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/12 px-4 py-3 text-[10.5px] text-white/45">
          v0.1 · Government of Maharashtra
        </div>
      </aside>
    </>
  );
}
