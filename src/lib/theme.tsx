"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "blue" | "purple" | "maroon" | "cold";

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
  { id: "maroon", label: "Theme 03 · Maroon", attr: "maroon", swatches: ["#7a2635", "#a8455a", "#f5e6e8"] },
  { id: "cold", label: "Theme 04 · Fresh Cold", attr: "cold", swatches: ["#3d6e78", "#5b8a9a", "#e3f1ef"] },
];

const STORAGE_KEY = "mhada-theme";

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (theme: ThemeId) => void }>({
  theme: "blue",
  setTheme: () => {},
});

function readStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "blue";
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.some((t) => t.id === saved) ? (saved as ThemeId) : "blue";
}

function applyTheme(theme: ThemeId) {
  const meta = THEMES.find((t) => t.id === theme);
  if (meta?.attr) document.documentElement.setAttribute("data-theme", meta.attr);
  else document.documentElement.removeAttribute("data-theme");
  // Some engines cache computed styles for elements whose only invalidation
  // signal is an ancestor attribute-selector match, so a var()-driven
  // background-color can lag behind. A no-op reflow read isn't always
  // enough to bust that cache — forcing the root out of the render tree
  // and back in guarantees every dependent element is fully restyled.
  const root = document.documentElement;
  const prevDisplay = root.style.display;
  root.style.display = "none";
  void root.offsetHeight;
  root.style.display = prevDisplay;
}

/**
 * Visual theme (color palette only — layout/typography/spacing untouched).
 * Persisted to localStorage so it survives across sessions, unlike the
 * session-only language preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function setTheme(next: ThemeId) {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
