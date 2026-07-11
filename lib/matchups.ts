import type { Matchup } from "./types";

/** Famous rivalries across sports — the quick-start docket. */
export const RIVALRIES: Matchup[] = [
  { sport: "Basketball", a: "Michael Jordan", b: "LeBron James" },
  { sport: "Soccer", a: "Lionel Messi", b: "Cristiano Ronaldo" },
  { sport: "American Football", a: "Tom Brady", b: "Peyton Manning" },
  { sport: "Tennis", a: "Roger Federer", b: "Rafael Nadal" },
  { sport: "Tennis", a: "Serena Williams", b: "Steffi Graf" },
  { sport: "Boxing", a: "Muhammad Ali", b: "Mike Tyson" },
  { sport: "Formula 1", a: "Lewis Hamilton", b: "Michael Schumacher" },
  { sport: "Ice Hockey", a: "Wayne Gretzky", b: "Alex Ovechkin" },
  { sport: "Cricket", a: "Sachin Tendulkar", b: "Virat Kohli" },
  { sport: "Swimming", a: "Michael Phelps", b: "Katie Ledecky" },
];

export function randomRivalry(): Matchup {
  return RIVALRIES[Math.floor(Math.random() * RIVALRIES.length)];
}
