"use client";

import { useRef, useState } from "react";
import Icon from "@/components/Icon";
import { Label } from "@/components/form/Field";

/**
 * Generic searchable dropdown: type to filter a flat list of string options,
 * click a row to select. Used anywhere a plain <select> isn't enough
 * (allowance/deduction type pickers, etc).
 */
export default function SearchableSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = "Search…",
}: {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));

  function handleFocus() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setQuery("");
    setOpen(true);
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div className="relative">
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        <input
          type="text"
          value={open ? query : value}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full rounded-[9px] border-[1.5px] border-border bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors focus:border-primary"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-2">
          <Icon name="chevron" className="h-3.5 w-3.5 rotate-90" />
        </span>
      </div>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-[9px] border border-border bg-surface shadow-[0_12px_30px_-10px_rgba(22,35,28,0.25)]">
          {matches.length === 0 ? (
            <div className="px-3.5 py-4 text-center text-[13px] text-muted">No matches.</div>
          ) : (
            matches.map((o) => (
              <button
                key={o}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o);
                  setQuery("");
                  setOpen(false);
                }}
                className={`block w-full px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-primary-tint/60 ${
                  o === value ? "bg-primary-tint font-medium text-primary" : "text-ink"
                }`}
              >
                {o}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
