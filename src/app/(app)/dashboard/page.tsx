import Link from "next/link";
import { NAV } from "@/lib/nav";
import Icon from "@/components/Icon";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-border-soft px-3 py-1 text-[11.5px] font-medium text-muted-2">
          Home
        </div>
        <h1 className="disp mt-3 text-[22px] font-semibold text-ink">
          Welcome, Mumbai Division
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
          Choose a module to begin. The workspace mirrors the eight menus of the
          MHADA payroll system — user, setup, administration, operations, salary
          processing, reports and remuneration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NAV.map((menu) => {
          const href = menu.children[0]?.href ?? `/${menu.key}`;
          const count = menu.children.length;
          return (
            <Link
              key={menu.key}
              href={href}
              className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(22,35,28,0.18)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary-tint text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon name={menu.icon} className="h-5 w-5" />
              </span>
              <div className="mt-3 text-[14px] font-semibold text-ink">{menu.label}</div>
              <div className="mt-1 text-[11.5px] text-muted-2">
                {count > 0
                  ? `${count} ${count === 1 ? "screen" : "screens"}`
                  : "Coming soon"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
