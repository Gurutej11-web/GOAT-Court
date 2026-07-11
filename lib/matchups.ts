import type { Matchup } from "./types";

export interface SportEntry {
  sport: string;
  athletes: string[];
}

/**
 * The full database. Only these sports and these athletes can be picked —
 * there's no free-text entry, so every matchup is guaranteed to make sense.
 */
export const SPORTS: SportEntry[] = [
  {
    sport: "Basketball",
    athletes: [
      "Michael Jordan",
      "LeBron James",
      "Kobe Bryant",
      "Magic Johnson",
      "Larry Bird",
      "Kareem Abdul-Jabbar",
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      "Lionel Messi",
      "Cristiano Ronaldo",
      "Pelé",
      "Diego Maradona",
      "Zinedine Zidane",
    ],
  },
  {
    sport: "Tennis",
    athletes: [
      "Roger Federer",
      "Rafael Nadal",
      "Novak Djokovic",
      "Serena Williams",
      "Steffi Graf",
    ],
  },
  {
    sport: "American Football",
    athletes: ["Tom Brady", "Peyton Manning", "Patrick Mahomes", "Jerry Rice"],
  },
  {
    sport: "Boxing",
    athletes: ["Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao"],
  },
];

/** Quick-start picks shown as chips on the home screen. */
export const FEATURED: Matchup[] = [
  { sport: "Basketball", a: "Michael Jordan", b: "LeBron James" },
  { sport: "Soccer", a: "Lionel Messi", b: "Cristiano Ronaldo" },
  { sport: "Tennis", a: "Roger Federer", b: "Rafael Nadal" },
  { sport: "American Football", a: "Tom Brady", b: "Peyton Manning" },
  { sport: "Boxing", a: "Muhammad Ali", b: "Mike Tyson" },
  { sport: "Basketball", a: "Kobe Bryant", b: "LeBron James" },
  { sport: "Soccer", a: "Pelé", b: "Diego Maradona" },
  { sport: "Tennis", a: "Serena Williams", b: "Steffi Graf" },
];

export function athletesFor(sport: string): string[] {
  return SPORTS.find((s) => s.sport === sport)?.athletes ?? [];
}

export function isKnownAthlete(sport: string, athlete: string): boolean {
  return athletesFor(sport).includes(athlete);
}

export function randomMatchup(): Matchup {
  return FEATURED[Math.floor(Math.random() * FEATURED.length)];
}
