"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { Label } from "@/components/form/Field";
import { EMPLOYEE_DIRECTORY, type DirectoryEmployee } from "@/lib/employee-directory";
import { useT } from "@/lib/i18n";

/**
 * Shared "search employee → summary card" pattern used by any screen that
 * starts with picking an employee (Leave Balance Correction, Employee Leave
 * Management, …).
 */
export default function EmployeeSearchCard({
  employee,
  onSelect,
  employees = EMPLOYEE_DIRECTORY,
  required,
}: {
  employee: DirectoryEmployee | null;
  onSelect: (e: DirectoryEmployee | null) => void;
  employees?: DirectoryEmployee[];
  required?: boolean;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches =
    query.trim() === ""
      ? employees.slice(0, 8)
      : employees.filter((e) => {
          const q = query.trim().toLowerCase();
          return e.name.toLowerCase().includes(q) || e.id.includes(q);
        });

  function handleBlur() {
    // Delay closing so a click on a dropdown row registers first.
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOpen(true);
  }

  if (employee) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-white">
              {employee.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div>
              <div className="text-[14.5px] font-semibold text-ink">{employee.name}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
                <span className="font-mono text-[12px] text-muted-2">ID {employee.id}</span>
                <span className="flex items-center gap-1">
                  <Icon name="shield" className="h-3.5 w-3.5" />
                  {t(employee.department)}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="employee" className="h-3.5 w-3.5" />
                  {employee.designation}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
            className="flex-shrink-0 rounded-[8px] border-[1.5px] border-border px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-muted-2"
          >
            {t("Change Employee")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Label required={required}>{t("Search Employee")}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-2">
          <Icon name="search" className="h-4 w-4" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t("Search by Employee Name or Employee ID")}
          className="w-full rounded-[9px] border-[1.5px] border-border bg-white py-2.5 pr-3 pl-9 text-[13.5px] text-ink outline-none transition-colors focus:border-primary"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-[9px] border border-border bg-surface shadow-[0_12px_30px_-10px_rgba(22,35,28,0.25)]">
          {matches.length === 0 ? (
            <div className="px-3.5 py-4 text-center text-[13px] text-muted">{t("No employees found.")}</div>
          ) : (
            matches.map((e) => (
              <button
                key={e.id}
                type="button"
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => {
                  onSelect(e);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-primary-tint/60"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{e.name}</span>
                  <span className="block text-[11.5px] text-muted">
                    {t(e.department)} · {e.designation}
                  </span>
                </span>
                <span className="flex-shrink-0 font-mono text-[11.5px] text-muted-2">{e.id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
