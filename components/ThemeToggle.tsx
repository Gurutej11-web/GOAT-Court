"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "goat-court-theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
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
      aria-label="Toggle light and dark mode"
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-edge text-text-dim transition-colors hover:text-text cursor-pointer ${className}`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
