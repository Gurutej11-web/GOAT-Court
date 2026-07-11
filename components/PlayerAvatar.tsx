"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  name: string;
  image: string | null;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

export default function PlayerAvatar({ name, image, size = 64, className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(image) && !errored;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={image as string}
          alt={name}
          fill
          sizes={`${size}px`}
          loading="eager"
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="font-display font-bold text-accent-ink" style={{ fontSize: size * 0.34 }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}
