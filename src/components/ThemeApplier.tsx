import { useEffect } from "react";
import { getPublicTheme } from "@/lib/theme.functions";

export const THEME_KEYS = [
  "background",
  "cyan",
  "magenta",
  "lime",
  "accent",
] as const;

export function applyTheme(theme: Record<string, string>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const k of THEME_KEYS) {
    if (theme[k]) root.style.setProperty(`--${k}`, theme[k]);
  }
  if (theme.accent) root.style.setProperty("--primary", theme.accent || theme.cyan);
}

// Applies the globally saved theme on first load (public + admin).
export function ThemeApplier() {
  useEffect(() => {
    let alive = true;
    getPublicTheme()
      .then((res) => {
        if (alive && res?.theme) applyTheme(res.theme);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return null;
}
