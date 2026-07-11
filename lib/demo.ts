import type { CaseConfig, Phase, TranscriptEntry, Verdict } from "./types";

/**
 * Demo mode — used when no ANTHROPIC_API_KEY is configured, so the full trial
 * flow always works on stage. Jordan and LeBron get fully-written arguments
 * with real career stats; any other athlete gets a stat-free rhetorical script
 * (we never fabricate numbers).
 */

const JORDAN: Record<Phase, string> = {
  opening: `Your Honor, the defense will speak of longevity and totals. The prosecution deals in perfection. Michael Jordan went to six NBA Finals and won six — six for six, six Finals MVPs, undefeated on the game's greatest stage. Five regular-season MVPs. Ten scoring titles. A career average of 30.1 points per game, the highest in the history of the sport. Defensive Player of the Year in 1988 — a scoring champion who was also the most feared defender on the floor. The court is asked to define greatness. Greatness is never, not once, letting a Finals slip away. The other side must explain away lost Finals; my client has none to explain.`,
  rebuttal: `Counsel gestures at accumulation, Your Honor, as if greatness were a savings account. Strip the era down: Jordan won ten scoring titles in the most physical, hand-checking era the league has known — no zone-friendly spacing, no friendly whistles. When it mattered most, he elevated: 33.4 points per game in the playoffs, the highest postseason average ever recorded. Two three-peats, separated by a baseball sabbatical, dismantling entire dynasties-in-waiting. My opponent's client needed super-teams assembled by committee; Jordan turned one franchise into an empire and never once required a rescue. Volume is what you compile when perfection is out of reach.`,
  closing: `Your Honor, when this trial began I promised the court perfection, and the record has delivered it: six Finals, six rings, six Finals MVPs, 30.1 a game for a career, ten scoring crowns, a Defensive Player of the Year trophy. The defense asks you to reward endurance. But the question before this court is not who lasted longest — it is who stood highest. Every player who followed, including the gentleman at the opposing table, grew up imitating Michael Jordan. Nobody imitates second place. The prosecution rests, Your Honor — and unlike the opposition's client in June, it rests undefeated.`,
};

const LEBRON: Record<Phase, string> = {
  opening: `Your Honor, the case for LeBron James is written in the record book itself. The all-time leading scorer in NBA history — more than 40,000 points, a summit no one had ever reached. Four championships won with three different franchises, each one a different mountain climbed. Four MVPs, twenty All-Star selections, twenty consecutive seasons of excellence — and in year twenty-one, still an All-NBA player. He is top five all-time in scoring AND assists, a combination that exists nowhere else in the sport's history. Opposing counsel will speak of a perfect June record. I will speak of two decades of sustained, undeniable dominance. Perfection over six Finals is impressive; excellence over twenty-one seasons is unprecedented.`,
  rebuttal: `Your Honor, counsel calls it a savings account — I call it the largest body of evidence in basketball history. Ten Finals appearances, including eight consecutive — a feat untouched since the 1960s. The 2016 championship: down three games to one against a 73-win team, the greatest regular season ever assembled, and LeBron James delivered a comeback no Finals had ever seen, leading BOTH teams in points, rebounds, assists, steals, and blocks. That is not accumulation; that is conquest. My opponent's client retired twice while my client simply kept winning. The court should ask why "perfection" required stepping away from the arena while greatness stayed and answered every bell.`,
  closing: `Your Honor, this court has heard the numbers: 40,000-plus points, the all-time scoring record, four titles with three franchises, four MVPs, twenty All-Star seasons, top five in both points and assists forever. But the decisive evidence is scope. LeBron James beat dynasties in three different decades of basketball. He carried Cleveland to its first championship in 52 years against a 73-win juggernaut. Longevity is not the absence of perfection — it is perfection, renewed every October for twenty-one years. The defense rests, Your Honor, atop the largest mountain of evidence this sport has ever produced.`,
};

const GENERIC: Record<Phase, (athlete: string, rival: string, sport: string) => string> = {
  opening: (athlete, rival, sport) =>
    `Your Honor, the court will hear many words today, but the trophy cabinet speaks first, and it speaks for ${athlete}. The titles, the records, the seasons of sustained dominance — these are not opinions, they are entries in the official register of ${sport}. Opposing counsel will ask this court to be dazzled by ${rival}'s highlights. I ask the court to be persuaded by the ledger. When the noise of fandom fades, what remains is what was won, and no one in ${sport} has bent the record book to their will like my client. The prosecution's case is simple: the results are already in evidence.`,
  rebuttal: (athlete, rival) =>
    `Counsel's argument, Your Honor, mistakes affection for evidence. Every point just made about ${rival} collapses under one question: against whom, and when it mattered most? ${athlete}'s résumé was built in the crucible — against the strongest rivals, on the biggest stages, with the outcome in doubt. The court should note what opposing counsel did not say: they did not say their client won more. They cannot. So they ask the court to weigh style over silverware and memory over the record. This bench deals in evidence, and the evidence wears my client's name.`,
  closing: (athlete, rival, sport) =>
    `Your Honor, strip away the nostalgia and the narrative, and this case decides itself. The standard for greatness in ${sport} is not who was most beloved — it is who achieved the most, against the best, for the longest. On every one of those measures, ${athlete} stands above ${rival}. The defense has offered passion; the prosecution has offered proof. History does not remember the arguments, Your Honor. It remembers the results — and the results rest with my client.`,
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
 * Demo verdict: scores the AI counsel a consistent 8 per round and the human
 * counsel by effort (word count), so an engaged demo user can genuinely win.
 */
export function demoVerdict(c: CaseConfig, transcript: TranscriptEntry[]): Verdict {
  const phases = ["Opening Statements", "Rebuttal", "Closing Arguments"];
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
        ? `Human counsel out-argued the machine in the ${s.phase.toLowerCase()} — thorough, specific, and relentless.`
        : s.user === s.ai
          ? `An even exchange of fire in the ${s.phase.toLowerCase()}; neither counsel yielded ground.`
          : `AI counsel's evidence carried the ${s.phase.toLowerCase()}; human counsel argued with heart but light artillery.`;
  }
  const winner = userTotal > aiTotal ? "user" : "ai";
  const winnerAthlete = winner === "user" ? c.userAthlete : c.aiAthlete;
  const winnerCounsel = winner === "user" ? "human counsel" : "AI counsel";

  return {
    winner,
    scores,
    opinion: `This court has endured lengthier trials, but few louder. Both counsels argued as though ${c.sport} itself hung in the balance — and perhaps it did. Having weighed the evidence, the rebuttals, and no small amount of theatrics, the bench finds that ${winnerCounsel} carried the day, and judgment is entered for ${winnerAthlete}. Let the record show the losing side argued honorably and is welcome to appeal — the docket of GOAT Court is never closed, and greatness is always subject to retrial. (Rendered in demo mode: add an ANTHROPIC_API_KEY for a live AI judge.)`,
    bestLine:
      transcript.find((t) => t.speaker === "ai")?.text.split(". ").at(-1) ??
      "The results are already in evidence.",
  };
}
