"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  name: string;
  image: string | null;
  size?: number;
  className?: string;
}

const MAX_RETRIES = 2;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

export default function PlayerAvatar({ name, image, size = 64, className = "" }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);
  const showImage = Boolean(image) && !gaveUp;

  function handleError() {
    // Wikimedia occasionally 429s a burst of simultaneous requests; a short
    // retry clears it up almost every time before we fall back to initials.
    if (attempt < MAX_RETRIES) {
      setTimeout(() => setAttempt((a) => a + 1), 500 * (attempt + 1));
    } else {
      setGaveUp(true);
    }
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet to-cyan ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          key={attempt}
          src={image as string}
          alt={name}
          fill
          sizes={`${size}px`}
          loading="eager"
          className="object-cover"
          onError={handleError}
        />
      ) : (
        <span className="font-display font-bold text-ink" style={{ fontSize: size * 0.34 }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}
