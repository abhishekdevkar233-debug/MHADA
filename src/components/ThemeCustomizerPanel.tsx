"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { derivePalette, isValidHex } from "@/lib/color";
import { CUSTOM_PRESETS, DEFAULT_CUSTOM_COLORS, useTheme, type CustomColors } from "@/lib/theme";

const FIELDS: { key: keyof CustomColors; label: string }[] = [
  { key: "primary", label: "Primary Color" },
  { key: "secondary", label: "Secondary Color" },
  { key: "accent1", label: "Accent 1" },
  { key: "accent2", label: "Accent 2" },
  { key: "accent3", label: "Accent 3" },
];

export default function ThemeCustomizerPanel({ onClose }: { onClose: () => void }) {
  const { theme, customColors, setTheme, setCustomColors, previewColors } = useTheme();
  const [draft, setDraft] = useState<CustomColors>(theme === "custom" ? customColors : DEFAULT_CUSTOM_COLORS);

  // Live preview: re-apply on every draft change, revert on unmount/close.
  useEffect(() => {
    previewColors(draft);
    return () => previewColors(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only draft should retrigger the preview; previewColors is stable enough for this
  }, [draft]);

  function update(key: keyof CustomColors, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(colors: CustomColors) {
    setDraft(colors);
  }

  function handleReset() {
    setDraft(DEFAULT_CUSTOM_COLORS);
  }

  function handleSave() {
    setCustomColors(draft);
    setTheme("custom");
    onClose();
  }

  function handleCancel() {
    previewColors(null);
    onClose();
  }

  const primaryPalette = derivePalette(draft.primary);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={handleCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in-up flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_30px_70px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-4">
          <div>
            <h2 className="disp text-[16px] font-semibold text-ink">Theme Customizer</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              Pick a primary color — hover, tint, and border shades are generated automatically. Changes preview instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Presets */}
          <div className="mb-6">
            <h3 className="mb-2.5 text-[11px] font-semibold tracking-[0.04em] text-muted-2 uppercase">Presets</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CUSTOM_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p.colors)}
                  className="flex items-center gap-2 rounded-[9px] border-[1.5px] border-border px-2.5 py-2 text-left transition-colors hover:border-muted-2"
                >
                  <span className="flex flex-shrink-0 -space-x-1.5">
                    {[p.colors.primary, p.colors.secondary, p.colors.accent1].map((c, i) => (
                      <span key={i} className="h-3.5 w-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </span>
                  <span className="truncate text-[11.5px] font-medium text-ink">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color fields */}
          <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {FIELDS.map((f) => {
              const value = draft[f.key];
              const valid = isValidHex(value);
              return (
                <div key={f.key}>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={valid ? value : "#000000"}
                      onChange={(e) => update(f.key, e.target.value)}
                      className="h-9 w-9 flex-shrink-0 cursor-pointer rounded-[8px] border-[1.5px] border-border bg-white p-0.5"
                      aria-label={`${f.label} color picker`}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => update(f.key, e.target.value)}
                      placeholder="#2563EB"
                      className={`w-full rounded-[9px] border-[1.5px] bg-white px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors focus:border-primary ${
                        valid ? "border-border" : "border-danger"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generated palette preview */}
          {primaryPalette && (
            <div>
              <h3 className="mb-2.5 text-[11px] font-semibold tracking-[0.04em] text-muted-2 uppercase">
                Auto-Generated From Primary
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                <PaletteSwatch label="Primary" color={primaryPalette.primary} />
                <PaletteSwatch label="Hover" color={primaryPalette.primaryDark} />
                <PaletteSwatch label="Light" color={primaryPalette.primaryTint} />
                <PaletteSwatch label="Border" color={primaryPalette.border} />
                <PaletteSwatch label="On Primary" color={primaryPalette.textOnPrimary} swatchBg={primaryPalette.primary} />
              </div>
            </div>
          )}

          {/* Component preview */}
          <div className="mt-6 rounded-xl border border-border bg-canvas p-4">
            <h3 className="mb-2.5 text-[11px] font-semibold tracking-[0.04em] text-muted-2 uppercase">Live Preview</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" className="rounded-[8px] bg-primary px-4 py-2 text-[12.5px] font-semibold text-white">
                Primary Button
              </button>
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[11.5px] font-semibold text-primary">Badge</span>
              <span className="rounded-full bg-chip-1-tint px-3 py-1 text-[11.5px] font-semibold text-chip-1">Secondary</span>
              <span className="rounded-full bg-chip-2-tint px-3 py-1 text-[11.5px] font-semibold text-chip-2">Accent 1</span>
              <span className="rounded-full bg-chip-3-tint px-3 py-1 text-[11.5px] font-semibold text-chip-3">Accent 2</span>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[12.5px] font-semibold text-primary underline">
                Link text
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border-soft px-6 py-4">
          <button type="button" onClick={handleReset} className="text-[12.5px] font-semibold text-muted hover:text-ink">
            Reset to Default
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[9px] border-[1.5px] border-border px-4 py-2 text-[13px] font-semibold text-ink hover:border-muted-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-[9px] bg-primary px-5 py-2 text-[13px] font-semibold text-white hover:bg-primary-dark"
            >
              Save &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaletteSwatch({ label, color, swatchBg }: { label: string; color: string; swatchBg?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="h-9 w-full rounded-[8px] border border-border shadow-sm"
        style={{ backgroundColor: swatchBg ?? color }}
      >
        {swatchBg && (
          <span className="flex h-full items-center justify-center text-[10px] font-bold" style={{ color }}>
            Aa
          </span>
        )}
      </span>
      <span className="text-[10px] text-muted-2">{label}</span>
    </div>
  );
}
