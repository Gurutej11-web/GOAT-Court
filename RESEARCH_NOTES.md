# RESEARCH_NOTES — GOAT Court

*Compiled 2026-07-10, pre-build research phase (~10 min).*

## Does "GOAT Court" already exist?

**No dedicated product matches this concept.** Closest neighbors found:

| Product | What it is | Gap vs GOAT Court |
|---|---|---|
| [SuperDebate — Jordan vs LeBron](https://superdebate.org/events/jordan-vs-lebron) | Recorded human debate you can score | Not interactive, not AI, one fixed matchup |
| [Cancel Court](https://www.youtube.com/watch?v=iU7VkeUPxaw) | Improv comedy courtroom show (did a GOAT trial episode) | Video entertainment, not an app |
| [ArguFight](https://www.argufight.com/) | AI-judged debate platform, ELO rankings, any topic | Generic debate chat — no courtroom framing, no sports focus, no matchup builder |
| [DebateIt](https://debateai.com/) | Timed format-accurate rounds vs AI opponent | Debate-club oriented, not sports, no trial theater |
| [GavelBot](https://gavelbot.com/debate.html) | AI debate judge for human-vs-human debates | Judge only — no AI opponent |
| [Argu AI (hackathon)](https://github.com/satti-hari-krishna-reddy/arguai) | AI-vs-AI debates, third AI judges | You watch; you don't argue |

## Differentiation (what we build)

1. **Courtroom theater, not chat** — trial phases (opening → rebuttal → closing), opposing counsel persona, judge's bench, verdict with scoring rubric. The framing IS the product.
2. **Any sport, any two athletes** — user picks the matchup (or hits "AI picks" for a famous rivalry), picks which athlete they represent; AI argues the other side.
3. **Stats as evidence** — opposing counsel must cite real career stats/records in every argument; the judge scores evidence quality, not just rhetoric.
4. **Hackathon-honest demo mode** — full trial flow works with canned arguments when no API key is present, so the demo never dies on stage.

## Technical decisions

- **Next.js 15 App Router + TypeScript + Tailwind** — Harihar's standard stack, fastest path.
- **Anthropic SDK, `claude-sonnet-5`** — fast + smart enough for stat-grounded arguments; streaming for counsel speeches (courtroom drama), single JSON call for the verdict.
- **Stats source: model knowledge** — no sports-stats API in a 2–3h budget. Claude's knowledge of career stats is demo-grade accurate. Noted as a V2 limitation (swap in balldontlie / Sports Reference scrape later).
- **No DB** — trial state is client-side; nothing needs persistence for the demo.
