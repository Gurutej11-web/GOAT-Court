import type { CaseConfig, Phase, TranscriptEntry, Verdict } from "./types";

/**
 * Demo mode: used when no GROQ_API_KEY is configured, so the full debate
 * flow always works on stage. Jordan and LeBron get fully-written arguments
 * with real career stats; any other athlete gets a stat-free rhetorical script
 * (we never fabricate numbers).
 */

const JORDAN: Record<Phase, string> = {
  opening: `Let's start with the receipts: six trips to the Finals, six rings. Six for six, undefeated on the biggest stage in the sport. Five regular-season MVPs. Ten scoring titles. A career average of 30.1 points a game, still the highest in NBA history. Defensive Player of the Year in 1988, a scoring champion who was also the most feared defender on the floor. You want to talk greatness? Greatness is never blowing a Finals. Not once. My guy has zero to explain away.`,
  rebuttal: `Counsel's whole pitch is "he stuck around longer," like that's the point. Look at the era: ten scoring titles in the most physical, hand-checking basketball the league has ever played, no cushy spacing, no friendly whistles. And when it mattered most, he leveled up: 33.4 points a game in the playoffs, the highest postseason average ever recorded. Two three-peats, split by a baseball detour, and he still buried whole dynasties. Other guy needed a super-team assembled by committee. Mine turned one city into an empire, solo.`,
  closing: `Here's the whole case in one breath: six Finals, six rings, six Finals MVPs, 30.1 a night for a career, ten scoring crowns, a Defensive Player of the Year trophy. You want to reward whoever lasted longest, I'm asking who stood the highest. Every player who came after, including the guy on the other side of this debate, grew up trying to be Michael Jordan. Nobody grows up wanting to be second place. And unlike some people's Junes, mine finishes undefeated.`,
};

const LEBRON: Record<Phase, string> = {
  opening: `The case for LeBron James is written into the record book itself. All-time leading scorer in NBA history, over 40,000 points, a number nobody had ever touched. Four championships with three different franchises, each one a different mountain. Four MVPs, twenty All-Star selections, twenty straight seasons of excellence, and in year twenty-one, still playing All-NBA level ball. Top five all-time in scoring AND assists, a combo that exists nowhere else in this sport's history. Six perfect Junes is a nice story. Twenty-one years of sustained, undeniable dominance is unprecedented.`,
  rebuttal: `Calling it "accumulation"? I'd call it the biggest body of evidence basketball has ever produced. Ten Finals trips, eight of them back to back, a feat nobody's touched since the 1960s. 2016: down three games to one against a 73-win team, the greatest regular season ever played, and LeBron delivers a comeback no Finals had ever seen, leading BOTH teams in points, rebounds, assists, steals, and blocks. That's not padding a résumé, that's conquest. My guy never had to step away and come back; he just kept winning, every year, no breaks.`,
  closing: `Run the numbers one more time: 40,000-plus points, the all-time scoring record, four titles with three franchises, four MVPs, twenty All-Star seasons, top five ever in both points and assists. But the real story is scope: LeBron beat different dynasties across three different decades of basketball. He brought Cleveland its first title in 52 years against a 73-win juggernaut. Longevity isn't the opposite of greatness, it's greatness, renewed every single October for twenty-one years straight.`,
};

const GENERIC: Record<Phase, (athlete: string, rival: string, sport: string) => string> = {
  opening: (athlete, rival, sport) =>
    `Look, we can talk highlights all day, but the trophy case speaks first, and it speaks for ${athlete}. The titles, the records, the years of sustained dominance, those aren't opinions, they're entries in the official history of ${sport}. The other side is going to try to dazzle you with ${rival}'s highlight reel. I'm just going to point at the ledger. When the noise fades, what's left is what was actually won, and nobody in ${sport} has rewritten the record book like my pick has.`,
  rebuttal: (athlete, rival) =>
    `That whole argument for ${rival} is nostalgia dressed up as evidence. Ask one question: against who, and when it actually mattered? ${athlete}'s résumé was built against the toughest competition, on the biggest stages, with everything on the line. Notice what the other side didn't say: they didn't say their pick won more. Because they can't. So now it's "vibes over trophies." I'll take the trophies every time.`,
  closing: (athlete, rival, sport) =>
    `Strip away the nostalgia and this one settles itself. Greatness in ${sport} isn't about who was more fun to watch, it's who achieved the most, against the best, for the longest. On every one of those, ${athlete} is ahead of ${rival}. The other side brought passion. I brought proof. History doesn't remember the arguments, it remembers the results, and the results are on my side.`,
};

function cannedFor(athlete: string, rival: string, sport: string, phase: Phase): string {
  if (athlete === "Michael Jordan") return JORDAN[phase];
  if (athlete === "LeBron James") return LEBRON[phase];
  return GENERIC[phase](athlete, rival, sport);
}

export function demoCounselArgument(c: CaseConfig, phase: Phase): string {
  return cannedFor(c.aiAthlete, c.userAthlete, c.sport, phase);
}

/**
 * Demo verdict: scores the AI a consistent 8 per round and the human
 * by effort (word count), so an engaged demo user can genuinely win.
 */
export function demoVerdict(c: CaseConfig, transcript: TranscriptEntry[]): Verdict {
  const phases = ["Make Your Case", "Clap Back", "Bring It Home"];
  const userEntries = transcript.filter((t) => t.speaker === "user");
  const scores = phases.map((phase, i) => {
    const words = (userEntries[i]?.text ?? "").trim().split(/\s+/).length;
    const user = words >= 80 ? 9 : words >= 40 ? 8 : words >= 15 ? 6 : 4;
    return { phase, user, ai: 8, note: "" };
  });

  let userTotal = scores.reduce((s, r) => s + r.user, 0);
  const aiTotal = scores.reduce((s, r) => s + r.ai, 0);
  if (userTotal === aiTotal) {
    scores[2].user += 1;
    userTotal += 1;
  }
  for (const s of scores) {
    s.note =
      s.user > s.ai
        ? `The human out-argued the AI in "${s.phase}": sharp, specific, and relentless.`
        : s.user === s.ai
          ? `Dead even in "${s.phase}": neither side gave any ground.`
          : `The AI's stats carried "${s.phase}"; the human brought heart but light ammo.`;
  }
  const winner = userTotal > aiTotal ? "user" : "ai";
  const winnerAthlete = winner === "user" ? c.userAthlete : c.aiAthlete;
  const winnerSide = winner === "user" ? "the human" : "the AI";

  return {
    winner,
    scores,
    opinion: `That was a lot of noise for one debate, but ${c.sport} tends to do that to people. Both sides argued like the fate of the sport hung on it, and maybe it did. Weighing the stats, the comebacks, and no small amount of trash talk, ${winnerSide} takes it, and the verdict goes to ${winnerAthlete}. The losing side argued well and is welcome to run it back, the docket's never closed, and greatness is always up for debate. (This is demo mode: add a GROQ_API_KEY for a live AI judge.)`,
    bestLine:
      transcript.find((t) => t.speaker === "ai")?.text.split(". ").at(-1) ??
      "The results speak for themselves.",
  };
}

/** Demo odds: a stable pseudo-random split seeded by the two names, so it's consistent per matchup. */
export function demoOdds(a: string, b: string): { aPct: number; bPct: number; blurb: string } {
  let seed = 0;
  for (const ch of `${a}${b}`) seed = (seed * 31 + ch.charCodeAt(0)) % 1000;
  const aPct = 35 + (seed % 31); // keeps it in a believable 35-65 band
  return {
    aPct,
    bPct: 100 - aPct,
    blurb: `Public opinion usually leans toward whoever's got the hardware and the highlight reel to match. (Demo mode: add a GROQ_API_KEY for a live estimate.)`,
  };
}

export function demoCoachTip(): string {
  return "Looking solid. Try naming one specific stat or record instead of speaking in generalities, judges love a hard number. (Demo mode: add a GROQ_API_KEY for live coaching.)";
}

export function demoHint(athlete: string): string {
  return `Try leaning on ${athlete}'s best-known accolade, championships, MVPs, or a signature record, whichever is hardest to argue against. (Demo mode: add a GROQ_API_KEY for a live hint.)`;
}
