"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { derivePalette } from "@/lib/color";

export type ThemeId = "blue" | "purple" | "multicolor" | "cold" | "custom";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  /** data-theme value; the default theme omits the attribute entirely. */
  attr: string | null;
  swatches: [string, string, string];
};

export const THEMES: ThemeMeta[] = [
  { id: "blue", label: "Theme 01 · Blue (Default)", attr: null, swatches: ["#14487a", "#2e6da4", "#e6edf6"] },
  { id: "purple", label: "Theme 02 · Purple", attr: "purple", swatches: ["#6b4fa0", "#8a6fc2", "#efe9f8"] },
  { id: "multicolor", label: "Theme 03 · Multi-Color", attr: "multicolor", swatches: ["#5b4bdb", "#14b8a6", "#f97316"] },
  { id: "cold", label: "Theme 04 · Fresh Cold", attr: "cold", swatches: ["#3d6e78", "#5b8a9a", "#e3f1ef"] },
];

export type CustomColors = {
  primary: string;
  secondary: string;
  accent1: string;
  accent2: string;
  accent3: string;
};

export const DEFAULT_CUSTOM_COLORS: CustomColors = {
  primary: "#2563eb",
  secondary: "#0f766e",
  accent1: "#7c3aed",
  accent2: "#f97316",
  accent3: "#c85a5a",
};

export const CUSTOM_PRESETS: { name: string; colors: CustomColors }[] = [
  { name: "Default Blue", colors: { primary: "#14487a", secondary: "#2e6da4", accent1: "#1f6e43", accent2: "#a66a1e", accent3: "#8992a0" } },
  { name: "Government Purple", colors: { primary: "#6b4fa0", secondary: "#8a6fc2", accent1: "#3a7bd5", accent2: "#f97316", accent3: "#c85a5a" } },
  { name: "Emerald", colors: { primary: "#0f766e", secondary: "#14b8a6", accent1: "#2563eb", accent2: "#f59e0b", accent3: "#c85a5a" } },
  { name: "Royal Blue", colors: { primary: "#1d4ed8", secondary: "#3b82f6", accent1: "#7c3aed", accent2: "#f97316", accent3: "#0f766e" } },
  { name: "Teal", colors: { primary: "#0d7a76", secondary: "#14b8a6", accent1: "#2563eb", accent2: "#f97316", accent3: "#7c3aed" } },
  { name: "Slate", colors: { primary: "#334155", secondary: "#64748b", accent1: "#2563eb", accent2: "#c85a5a", accent3: "#0f766e" } },
  { name: "Forest Green", colors: { primary: "#1f6e43", secondary: "#3d8a5f", accent1: "#2563eb", accent2: "#a66a1e", accent3: "#7c3aed" } },
  { name: "Executive Dark", colors: { primary: "#1f2937", secondary: "#374151", accent1: "#2563eb", accent2: "#f97316", accent3: "#0f766e" } },
];

const STORAGE_KEY = "mhada-theme";
const CUSTOM_STORAGE_KEY = "mhada-custom-colors";

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  customColors: CustomColors;
  setCustomColors: (colors: CustomColors) => void;
  /** Apply colors to the live DOM without persisting — pass null to revert to the committed theme. */
  previewColors: (colors: CustomColors | null) => void;
}>({
  theme: "blue",
  setTheme: () => {},
  customColors: DEFAULT_CUSTOM_COLORS,
  setCustomColors: () => {},
  previewColors: () => {},
});

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "blue";
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "custom" || THEMES.some((t) => t.id === saved) ? (saved as ThemeId) : "blue";
}

function readStoredCustomColors(): CustomColors {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_COLORS;
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return DEFAULT_CUSTOM_COLORS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CUSTOM_COLORS, ...parsed };
  } catch {
    return DEFAULT_CUSTOM_COLORS;
  }
}

function forceRepaint() {
  // Some engines cache computed styles for elements whose only invalidation
  // signal is an ancestor attribute/inline-style change, so a var()-driven
  // background-color can lag behind. Forcing the root out of the render
  // tree and back in guarantees every dependent element repaints.
  const root = document.documentElement;
  const prevDisplay = root.style.display;
  root.style.display = "none";
  void root.offsetHeight;
  root.style.display = prevDisplay;
}

function clearCustomProperties() {
  const root = document.documentElement.style;
  for (const prop of ["--primary", "--primary-dark", "--primary-tint", "--border", "--border-soft", "--accent", "--accent-tint", "--accent-dark", "--chip-1", "--chip-1-tint", "--chip-2", "--chip-2-tint", "--chip-3", "--chip-3-tint", "--chip-4", "--chip-4-tint"]) {
    root.removeProperty(prop);
  }
}

function applyCustomColors(colors: CustomColors) {
  const root = document.documentElement.style;
  const primary = derivePalette(colors.primary);
  const secondary = derivePalette(colors.secondary);
  const a1 = derivePalette(colors.accent1);
  const a2 = derivePalette(colors.accent2);
  const a3 = derivePalette(colors.accent3);
  if (primary) {
    root.setProperty("--primary", primary.primary);
    root.setProperty("--primary-dark", primary.primaryDark);
    root.setProperty("--primary-tint", primary.primaryTint);
    root.setProperty("--border", primary.border);
    root.setProperty("--border-soft", primary.primaryTint);
  }
  if (secondary) {
    root.setProperty("--accent", secondary.primary);
    root.setProperty("--accent-tint", secondary.primaryTint);
    root.setProperty("--accent-dark", secondary.primaryDark);
    root.setProperty("--chip-1", secondary.primary);
    root.setProperty("--chip-1-tint", secondary.primaryTint);
  }
  if (a1) {
    root.setProperty("--chip-2", a1.primary);
    root.setProperty("--chip-2-tint", a1.primaryTint);
  }
  if (a2) {
    root.setProperty("--chip-3", a2.primary);
    root.setProperty("--chip-3-tint", a2.primaryTint);
  }
  if (a3) {
    root.setProperty("--chip-4", a3.primary);
    root.setProperty("--chip-4-tint", a3.primaryTint);
  }
}

function applyTheme(theme: ThemeId, customColors: CustomColors) {
  clearCustomProperties();
  if (theme === "custom") {
    document.documentElement.removeAttribute("data-theme");
    applyCustomColors(customColors);
  } else {
    const meta = THEMES.find((t) => t.id === theme);
    if (meta?.attr) document.documentElement.setAttribute("data-theme", meta.attr);
    else document.documentElement.removeAttribute("data-theme");
  }
  forceRepaint();
}

/**
 * Visual theme (color palette only — layout/typography/spacing untouched).
 * Persisted to localStorage so it survives across sessions, unlike the
 * session-only language preference. "custom" applies live-derived colors
 * from the Theme Customizer instead of a fixed `data-theme` palette.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);
  const [customColors, setCustomColorsState] = useState<CustomColors>(readStoredCustomColors);

  useEffect(() => {
    applyTheme(theme, customColors);
  }, [theme, customColors]);

  function setTheme(next: ThemeId) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  function setCustomColors(next: CustomColors) {
    setCustomColorsState(next);
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
  }

  function previewColors(colors: CustomColors | null) {
    if (colors) {
      clearCustomProperties();
      document.documentElement.removeAttribute("data-theme");
      applyCustomColors(colors);
      forceRepaint();
    } else {
      applyTheme(theme, customColors);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors, previewColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
