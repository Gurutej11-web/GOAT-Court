"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "goat-court-theme";

type Theme = "light" | "dark" | "contrast";

const NEXT: Record<Theme, Theme> = {
  light: "dark",
  dark: "contrast",
  contrast: "light",
};

const SHORT_LABEL: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  contrast: "Contrast",
};

const LABEL: Record<Theme, string> = {
  light: "Light mode active, switch to dark",
  dark: "Dark mode active, switch to high contrast",
  contrast: "High contrast active, switch to light",
};

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "dark" || current === "contrast" ? current : "light");
  }, []);

  function toggle() {
    const next = NEXT[theme];
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable, nothing to do
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={LABEL[theme]}
      title={LABEL[theme]}
      className={`flex h-8 items-center justify-center rounded-full border border-edge px-3 text-xs font-medium text-text-dim transition-colors hover:text-text cursor-pointer ${className}`}
    >
      {SHORT_LABEL[theme]}
    </button>
  );
}
