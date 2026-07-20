"use client";

import { createContext, useContext, useState } from "react";
import { MR } from "@/lib/translations";

export type Lang = "en" | "mr";

const STORAGE_KEY = "mhada-lang";

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved === "mr" ? "mr" : "en";
}

/**
 * Session-only language preference (English default). Persisted to
 * sessionStorage so it survives client-side navigation within the tab but
 * resets on a fresh session, per the bilingual toggle spec.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  function setLang(next: Lang) {
    setLangState(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Pick the English or Marathi string for the current language. */
export function pick(lang: Lang, en: string, mr: string) {
  return lang === "mr" ? mr : en;
}

/**
 * Dictionary-backed translator: `t("Save")` returns the Marathi string when
 * the current language is Marathi, falling back to the English input
 * unchanged if no translation is registered yet. Safe to call with dynamic
 * strings (e.g. user data) — untranslated text just passes through.
 */
export function useT() {
  const { lang } = useLang();
  return (en: string) => (lang === "mr" ? (MR[en] ?? en) : en);
}
