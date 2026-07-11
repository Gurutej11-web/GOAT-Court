"use client";

import type { ReactNode } from "react";

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
          <span className="bg-gradient-to-r from-violet-bright to-cyan bg-clip-text text-transparent">
            GOAT
          </span>{" "}
          Court
        </button>
        {action}
      </div>
    </div>
  );
}
