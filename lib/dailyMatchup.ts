import { FEATURED } from "./matchups";
import type { Matchup } from "./types";

/** Same matchup for everyone on a given calendar day, deterministic from the date. */
export function debateOfTheDay(date: Date = new Date()): Matchup {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  return FEATURED[seed % FEATURED.length];
}
