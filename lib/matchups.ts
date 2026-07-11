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
      { name: "Stephen Curry", image: "/players/stephen-curry.jpg" },
      { name: "Shaquille O'Neal", image: "/players/shaquille-oneal.jpg" },
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
      { name: "Neymar", image: "/players/neymar.jpg" },
      { name: "Ronaldinho", image: "/players/ronaldinho.jpg" },
      { name: "Kylian Mbappé", image: "/players/kylian-mbappe.jpg" },
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
      { name: "Andy Murray", image: "/players/andy-murray.jpg" },
      { name: "Venus Williams", image: "/players/venus-williams.jpg" },
    ],
  },
  {
    sport: "American Football",
    athletes: [
      { name: "Tom Brady", image: "/players/tom-brady.jpg" },
      { name: "Peyton Manning", image: "/players/peyton-manning.jpg" },
      { name: "Patrick Mahomes", image: "/players/patrick-mahomes.jpg" },
      { name: "Jerry Rice", image: "/players/jerry-rice.jpg" },
      { name: "Aaron Rodgers", image: "/players/aaron-rodgers.jpg" },
      { name: "Joe Montana", image: "/players/joe-montana.jpg" },
    ],
  },
  {
    sport: "Boxing",
    athletes: [
      { name: "Muhammad Ali", image: "/players/muhammad-ali.jpg" },
      { name: "Mike Tyson", image: "/players/mike-tyson.jpg" },
      { name: "Floyd Mayweather", image: "/players/floyd-mayweather.jpg" },
      { name: "Manny Pacquiao", image: "/players/manny-pacquiao.jpg" },
      { name: "Sugar Ray Robinson", image: "/players/sugar-ray-robinson.jpg" },
      { name: "George Foreman", image: "/players/george-foreman.jpg" },
    ],
  },
  {
    sport: "Cricket",
    athletes: [
      { name: "Sachin Tendulkar", image: "/players/sachin-tendulkar.jpg" },
      { name: "Virat Kohli", image: "/players/virat-kohli.jpg" },
      { name: "Don Bradman", image: "/players/don-bradman.jpg" },
      { name: "Viv Richards", image: "/players/viv-richards.jpg" },
    ],
  },
  {
    sport: "Ice Hockey",
    athletes: [
      { name: "Wayne Gretzky", image: "/players/wayne-gretzky.jpg" },
      { name: "Alex Ovechkin", image: "/players/alex-ovechkin.jpg" },
      { name: "Mario Lemieux", image: "/players/mario-lemieux.jpg" },
      { name: "Bobby Orr", image: "/players/bobby-orr.jpg" },
    ],
  },
];

/** Every known player, flattened, for search/autocomplete across all sports. */
export const ALL_ATHLETES: { sport: string; athlete: Athlete }[] = SPORTS.flatMap((s) =>
  s.athletes.map((athlete) => ({ sport: s.sport, athlete })),
);

/** Quick-start picks shown as chips on the home screen. */
export const FEATURED: Matchup[] = [
  { sport: "Basketball", a: "Michael Jordan", b: "LeBron James" },
  { sport: "Soccer", a: "Lionel Messi", b: "Cristiano Ronaldo" },
  { sport: "Tennis", a: "Roger Federer", b: "Rafael Nadal" },
  { sport: "American Football", a: "Tom Brady", b: "Peyton Manning" },
  { sport: "Boxing", a: "Muhammad Ali", b: "Mike Tyson" },
  { sport: "Basketball", a: "Kobe Bryant", b: "LeBron James" },
  { sport: "Soccer", a: "Pelé", b: "Diego Maradona" },
  { sport: "Cricket", a: "Sachin Tendulkar", b: "Virat Kohli" },
  { sport: "Ice Hockey", a: "Wayne Gretzky", b: "Alex Ovechkin" },
];

export function athletesFor(sport: string): Athlete[] {
  return SPORTS.find((s) => s.sport.toLowerCase() === sport.toLowerCase())?.athletes ?? [];
}

export function athleteNamesFor(sport: string): string[] {
  return athletesFor(sport).map((a) => a.name);
}

/** Looks up a known player's photo, matched loosely by name (any sport if none given). */
export function imageFor(sport: string, name: string): string | null {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return null;
  const inSport = athletesFor(sport).find((a) => a.name.toLowerCase() === trimmed);
  if (inSport) return inSport.image;
  const anywhere = ALL_ATHLETES.find((e) => e.athlete.name.toLowerCase() === trimmed);
  return anywhere?.athlete.image ?? null;
}

/** Sport name suggestions for the sport field, matched by prefix/substring. */
export function suggestSports(query: string): string[] {
  const q = query.trim().toLowerCase();
  const names = SPORTS.map((s) => s.sport);
  if (!q) return names;
  return names.filter((s) => s.toLowerCase().includes(q));
}

/** Player suggestions, preferring the current sport's roster, matched by substring. */
export function suggestAthletes(query: string, sport: string, exclude: string): string[] {
  const q = query.trim().toLowerCase();
  const excludeLower = exclude.trim().toLowerCase();
  const inSport = athleteNamesFor(sport);
  const pool = inSport.length > 0 ? inSport : ALL_ATHLETES.map((e) => e.athlete.name);
  const unique = Array.from(new Set(pool)).filter((n) => n.toLowerCase() !== excludeLower);
  if (!q) return unique.slice(0, 8);
  return unique.filter((n) => n.toLowerCase().includes(q)).slice(0, 8);
}

export function randomMatchup(): Matchup {
  return FEATURED[Math.floor(Math.random() * FEATURED.length)];
}
