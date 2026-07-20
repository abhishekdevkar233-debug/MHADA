"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseISO(v?: string): Date | null {
  if (!v) return null;
  const parts = v.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(v?: string) {
  const d = parseISO(v);
  if (!d) return "";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Compact popover calendar replacing the native `<input type="date">` —
 * click anywhere on the field (not just an icon) to open it. Value/onChange
 * stay ISO ("YYYY-MM-DD") strings so it's a drop-in for DateField callers.
 */
export default function DatePicker({
  value,
  onChange,
  min,
  disabled,
  error,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const minDate = parseISO(min);
  const [viewDate, setViewDate] = useState(() => selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);

  function openPicker() {
    setViewDate(selected ?? new Date());
    setOpen(true);
  }

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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function isDisabledDay(day: number) {
    if (!minDate) return false;
    const d = new Date(year, month, day);
    const flooredMin = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return d < flooredMin;
  }

  function pick(day: number) {
    onChange(toISO(new Date(year, month, day)));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-[9px] border-[1.5px] bg-white px-3 py-2.5 text-left text-[13.5px] outline-none transition-colors focus:border-primary disabled:bg-border-soft disabled:text-muted ${
          error ? "border-danger" : "border-border"
        }`}
      >
        <span className={selected ? "text-ink" : "text-muted-2"}>{selected ? formatDisplay(value) : placeholder}</span>
        <Icon name="leave-balance" className="h-4 w-4 flex-shrink-0 text-muted-2" />
      </button>

      <div
        className={`absolute z-30 mt-1.5 w-[280px] origin-top-left rounded-xl border border-border bg-surface p-3 shadow-[0_20px_45px_-15px_rgba(22,35,28,0.35)] transition-all duration-150 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
          </button>
          <span className="text-[13px] font-semibold text-ink">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-canvas hover:text-ink"
          >
            <Icon name="chevron" className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="flex h-7 items-center justify-center text-[10.5px] font-semibold text-muted-2">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateObj = new Date(year, month, day);
            const isSelected = selected !== null && isSameDay(dateObj, selected);
            const isToday = isSameDay(dateObj, new Date());
            const dayDisabled = isDisabledDay(day);
            return (
              <button
                key={day}
                type="button"
                disabled={dayDisabled}
                onClick={() => pick(day)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] transition-colors ${
                  isSelected
                    ? "bg-primary font-semibold text-white"
                    : dayDisabled
                      ? "cursor-not-allowed text-muted-2/40"
                      : isToday
                        ? "font-semibold text-primary hover:bg-primary-tint"
                        : "text-ink hover:bg-primary-tint"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const today = new Date();
            if (minDate && today < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return;
            onChange(toISO(today));
            setOpen(false);
          }}
          className="mt-2 w-full rounded-[7px] py-1.5 text-[12px] font-semibold text-primary transition-colors hover:bg-primary-tint"
        >
          Today
        </button>
      </div>
    </div>
  );
}
