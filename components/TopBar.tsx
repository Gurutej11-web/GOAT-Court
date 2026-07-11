"use client";

import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  onHome: () => void;
  action?: ReactNode;
}

export default function TopBar({ onHome, action }: Props) {
  return (
    <div className="border-b border-edge/60">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <button
          onClick={onHome}
          className="font-display text-sm font-bold text-text hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-accent">GOAT</span> Court
        </button>
        <div className="flex items-center gap-3">
          {action}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
