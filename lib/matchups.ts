import type { Matchup } from "./types";

export interface Athlete {
  name: string;
  image: string;
}

export interface SportEntry {
  sport: string;
  athletes: Athlete[];
}

/** The curated database: each player here has a real photo and real stats. */
export const SPORTS: SportEntry[] = [
  {
    sport: "Basketball",
    athletes: [
      { name: "Michael Jordan", image: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Michael_Jordan_in_2014.jpg" },
      { name: "LeBron James", image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg" },
      { name: "Kobe Bryant", image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Kobe_Bryant_Dec_2014.jpg" },
      { name: "Magic Johnson", image: "https://upload.wikimedia.org/wikipedia/commons/2/29/Magic_Johnson_at_SXSW_2022_%2851958828669%29_%28cropped%29.jpg" },
      { name: "Larry Bird", image: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Larrybird.jpg" },
      { name: "Kareem Abdul-Jabbar", image: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Kareem_Abdul-Jabbar_May_2014.jpg" },
    ],
  },
  {
    sport: "Soccer",
    athletes: [
      { name: "Lionel Messi", image: "https://upload.wikimedia.org/wikipedia/commons/2/27/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178.jpg" },
      { name: "Cristiano Ronaldo", image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Cristiano_Ronaldo_2275_%28cropped%29.jpg" },
      { name: "Pelé", image: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Pele_con_brasil_%28cropped%29.jpg" },
      { name: "Diego Maradona", image: "https://upload.wikimedia.org/wikipedia/commons/4/48/Argentina_celebrando_copa_%28cropped%29.jpg" },
      { name: "Zinedine Zidane", image: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg" },
    ],
  },
  {
    sport: "Tennis",
    athletes: [
      { name: "Roger Federer", image: "https://upload.wikimedia.org/wikipedia/commons/1/11/Roger_Federer_2015_%28cropped%29.jpg" },
      { name: "Rafael Nadal", image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Rafael_Nadal_en_2024_%28cropped%29.jpg" },
      { name: "Novak Djokovic", image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Novak_Djokovic_Paris_2024_Olympic_Games_%28cropped%29.jpg" },
      { name: "Serena Williams", image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Guests_at_the_2026_Met_Gala_209_%28cropped%29.jpg" },
      { name: "Steffi Graf", image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Steffi_Graf_in_Hamburg_2010_%28cropped%29.jpg" },
    ],
  },
  {
    sport: "American Football",
    athletes: [
      { name: "Tom Brady", image: "https://upload.wikimedia.org/wikipedia/commons/7/73/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Tom_Brady_-_240422_191334_%28cropped%29_%28cropped%29.jpg" },
      { name: "Peyton Manning", image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Peyton_Manning_%2851665689271%29.jpg" },
      { name: "Patrick Mahomes", image: "https://upload.wikimedia.org/wikipedia/commons/9/92/Patrick_Mahomes_%2851615475056%29.jpg" },
      { name: "Jerry Rice", image: "https://upload.wikimedia.org/wikipedia/commons/0/01/Super_Bowl_44_Miami_Florida_NFL_Network_South_Beach_Set_Deon_Sanders_interviews_Jerry_Rice_%284331549867%29_%28cropped%29_-_Jerry_Rice.jpg" },
    ],
  },
  {
    sport: "Boxing",
    athletes: [
      { name: "Muhammad Ali", image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Muhammad_Ali_NYWTS.jpg" },
      { name: "Mike Tyson", image: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Mike_Tyson_Photo_Op_GalaxyCon_Austin_2023.jpg" },
      { name: "Floyd Mayweather", image: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Floyd_Mayweather_Jr_2011.jpg" },
      { name: "Manny Pacquiao", image: "https://upload.wikimedia.org/wikipedia/commons/6/69/Former_senator_Manny_Pacquiao_speaks_in_event_%2810-01-2025%29_%28cropped%29.jpg" },
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
