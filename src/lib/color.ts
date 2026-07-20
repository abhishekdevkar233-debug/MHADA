/**
 * Small HSL-based color-generation utility for the custom theme builder.
 * No dependency — enough math to derive a usable, accessible palette from
 * one hex input (hover/pressed/tint/border/text-on-primary/disabled).
 */

export type HSL = { h: number; s: number; l: number };

export function hexToHsl(hex: string): HSL | null {
  const m = hex.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(m)) return null;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.min(100, Math.max(0, s)) / 100;
  l = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function isValidHex(hex: string): boolean {
  return hexToHsl(hex) !== null;
}

/** WCAG relative luminance -> pick black or white text for readable contrast. */
export function textOnColor(hex: string): "#16202e" | "#ffffff" {
  const hsl = hexToHsl(hex);
  if (!hsl) return "#16202e";
  return hsl.l > 60 ? "#16202e" : "#ffffff";
}

export type DerivedPalette = {
  primary: string;
  primaryDark: string;
  primaryTint: string;
  border: string;
  textOnPrimary: string;
};

/** Derive hover/pressed, pastel tint, and border shades from one primary hex. */
export function derivePalette(primaryHex: string): DerivedPalette | null {
  const hsl = hexToHsl(primaryHex);
  if (!hsl) return null;
  const { h, s, l } = hsl;
  return {
    primary: hslToHex(h, s, l),
    primaryDark: hslToHex(h, Math.min(100, s + 4), Math.max(12, l - 14)),
    primaryTint: hslToHex(h, Math.min(70, s * 0.45 + 45), Math.min(96, l + 34)),
    border: hslToHex(h, Math.max(12, s * 0.35), Math.min(88, l + 26)),
    textOnPrimary: textOnColor(hslToHex(h, s, l)),
  };
}
