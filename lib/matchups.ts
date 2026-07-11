import type { Matchup } from "./types";

export interface Athlete {
  name: string;
  image: string;
}

export interface SportEntry {
  sport: string;
  athletes: Athlete[];
}

/**
 * The curated database: each player here has a real photo and real stats.
 * Photos are self-hosted in public/players/ (originally sourced from
 * Wikipedia) rather than hotlinked, since Wikimedia rate-limits high-frequency
 * external requests to the same images.
 */
export const SPORTS: SportEntry[] = [
  {
    sport: "Basketball",
    athletes: [
      { name: "Michael Jordan", image: "/players/michael-jordan.jpg" },
      { name: "LeBron James", image: "/players/lebron-james.jpg" },
      { name: "Kobe Bryant", image: "/players/kobe-bryant.jpg" },
      { name: "Magic Johnson", image: "/players/magic-johnson.jpg" },
      { name: "Larry Bird", image: "/players/larry-bird.jpg" },
      { name: "Kareem Abdul-Jabbar", image: "/players/kareem-abdul-jabbar.jpg" },
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      { name: "Lionel Messi", image: "/players/lionel-messi.jpg" },
      { name: "Cristiano Ronaldo", image: "/players/cristiano-ronaldo.jpg" },
      { name: "Pelé", image: "/players/pele.jpg" },
      { name: "Diego Maradona", image: "/players/diego-maradona.jpg" },
      { name: "Zinedine Zidane", image: "/players/zinedine-zidane.jpg" },
    ],
  },
  {
    sport: "Tennis",
    athletes: [
      { name: "Roger Federer", image: "/players/roger-federer.jpg" },
      { name: "Rafael Nadal", image: "/players/rafael-nadal.jpg" },
      { name: "Novak Djokovic", image: "/players/novak-djokovic.jpg" },
      { name: "Serena Williams", image: "/players/serena-williams.jpg" },
      { name: "Steffi Graf", image: "/players/steffi-graf.jpg" },
    ],
  },
  {
    sport: "American Football",
    athletes: [
      { name: "Tom Brady", image: "/players/tom-brady.jpg" },
      { name: "Peyton Manning", image: "/players/peyton-manning.jpg" },
      { name: "Patrick Mahomes", image: "/players/patrick-mahomes.jpg" },
      { name: "Jerry Rice", image: "/players/jerry-rice.jpg" },
    ],
  },
  {
    sport: "Boxing",
    athletes: [
      { name: "Muhammad Ali", image: "/players/muhammad-ali.jpg" },
      { name: "Mike Tyson", image: "/players/mike-tyson.jpg" },
      { name: "Floyd Mayweather", image: "/players/floyd-mayweather.jpg" },
      { name: "Manny Pacquiao", image: "/players/manny-pacquiao.jpg" },
    ],
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

export function athletesFor(sport: string): Athlete[] {
  return SPORTS.find((s) => s.sport === sport)?.athletes ?? [];
}

export function athleteNamesFor(sport: string): string[] {
  return athletesFor(sport).map((a) => a.name);
}

/** Looks up a known player's photo. Returns null for custom/typed-in players. */
export function imageFor(sport: string, name: string): string | null {
  return athletesFor(sport).find((a) => a.name === name)?.image ?? null;
}

export function randomMatchup(): Matchup {
  return FEATURED[Math.floor(Math.random() * FEATURED.length)];
}
