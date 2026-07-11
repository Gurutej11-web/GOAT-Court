# MASTER PROMPT — GOAT Court, 2.5-Hour Autonomous Build

*This is the filled-in, time-compressed version of the overnight master prompt template, scoped from 8 hours down to ~2.5–3 hours. Reusable: paste into a fresh Claude Code session to rebuild or extend.*

---

## SYSTEM DIRECTIVE — READ FIRST

You are operating in full autonomy mode. You have **2.5–3 hours** to complete this entire project. These rules are absolute:

**Rule 1 — Never ask for permission.** Make every decision yourself: tech, design, naming, copy, structure. I am not monitoring this session.

**Rule 2 — Never stop until finished.** No partial updates, no questions, no progress pings. One final message when done.

**Rule 3 — If blocked, pivot in under 3 minutes** (compressed from 5 — the budget is tight):
- AI API key missing/invalid → build **demo mode** with realistic canned arguments; keep real integration behind `.env.local`.
- npm package broken → alternative or hand-roll.
- Deployment blocked → GitHub push is the hard requirement; a live URL is a bonus. Try `vercel --yes` once, then move on.
- Anything else → the 80% version, shipped, with the gap noted.

**Rule 4 — Commit and push after EVERY phase.** (Modified for usage insurance: if the session dies or usage runs out, the last completed phase is already on GitHub.) Append each phase to `BUILD_LOG.md` before committing.

**Rule 5 — Time allocation for 2.5h:** research 10 min · architecture 10 min · implementation 90 min · testing 25 min · polish + ship 20 min. Cut scope, never cut testing.

**Rule 6 — Test before declaring done.** Every flow clicked end-to-end; 375px / 768px / 1440px; zero console errors.

**Rule 7 — One final message only**: status, repo/live URL, what was built, stack + why, architecture, testing summary, known limitations, setup instructions, V2 recommendations.

---

## PROJECT SPECIFICATION

### What to build
**GOAT Court** — a fake courtroom where you argue that your athlete is the greatest, against an AI opposing counsel who fires back with real career stats, and an AI judge who delivers a scored verdict.

Generalized beyond LeBron vs Jordan: the user picks **any sport and any two athletes** (or taps "AI picks the case" for a famous rivalry), chooses which athlete they represent, and the AI represents the other.

Core loop: **Case setup → 3 trial rounds (opening, rebuttal, closing; user writes, AI counsel responds with stats) → Judge's verdict (per-round scores, winner, written opinion).**

### Who it's for
Hackathon judges (United Hacks, Sports theme) + sports-debate lovers. Must demo flawlessly in under 3 minutes on stage.

### Design requirements
- **Courtroom drama, dark:** deep mahogany/near-black wood tones, parchment/cream text, brass-gold accents. Gavel iconography.
- **Typography:** legal-document serif for display (NOT Inter, no purple gradients, no generic AI aesthetic), clean sans/mono for stats.
- **Trial transcript styled as a court record**, counsel speeches stream in for drama. Verdict gets a theatrical reveal.
- Mobile-first responsive; every async action has a loading state; empty and error states designed.

### Technical requirements
- Next.js (App Router) + TypeScript strict + Tailwind — no DB, no auth.
- Anthropic SDK, current model ids, key in `.env.local` (never committed).
- **Demo mode:** with no key, the full trial runs on curated canned arguments (LeBron/Jordan fully written, generic-but-plausible for others) with a visible "Demo mode" badge.

### Features (priority order)
**Must have:** case setup (sport → two athletes → pick your side) · AI-picks-the-case rivalry generator · 3-round argue loop with streaming AI counsel citing real stats · AI judge verdict with rubric scores (evidence, logic, persuasion) + written opinion · demo mode fallback.
**Should have:** courtroom bench/table visual layout, verdict gavel moment, famous-rivalry quick-start chips.
**Nice to have:** "OBJECTION!" interjections, share-verdict card, rematch button.

### Seed data
8–10 famous rivalries across sports (Jordan/LeBron, Messi/Ronaldo, Brady/Manning, Federer/Nadal, Serena/Graf, Ali/Tyson, Hamilton/Schumacher, Gretzky/Ovechkin…) with sport labels; full canned trial script for Jordan/LeBron demo mode.

### Deployment
**Hard requirement:** public GitHub repo (`hariharv/goat-court`), pushed after every phase. **Bonus:** any public URL.

### Success criteria
A stranger can clone, `npm i && npm run dev`, and complete a full trial in demo mode with zero console errors; with a key, real AI arguments stream and the judge returns a valid scored verdict; responsive at 375/768/1440.

---

## IMPLEMENTATION PHASES (2.5h)

1. **Research + scaffold** (15 min) — competitive scan → `RESEARCH_NOTES.md`; create-next-app; git init + first push.
2. **Design system + case setup** (30 min) — palette/fonts/tokens; setup flow: sport picker, athlete inputs, rivalry chips, side selection.
3. **Trial engine** (45 min) — trial state machine; `/api/counsel` (streaming argument, stats-mandatory prompt); transcript UI with user argument input; round progression.
4. **Judge + verdict** (25 min) — `/api/judge` returns structured JSON scores + opinion; verdict scene with reveal.
5. **Demo mode + seed data** (20 min) — no-key detection, canned trial content, demo badge.
6. **Testing** (25 min) — full flow × demo mode × real mode, three breakpoints, console clean, error/loading/empty states.
7. **Polish + ship** (20 min) — favicon/meta/OG, README, final push; attempt one-shot deploy if time remains.

## PIVOT PLAYBOOK (project-specific)
| Blocker | Pivot |
|---|---|
| No/invalid Anthropic key | Demo mode is first-class; ship it |
| Judge returns malformed JSON | Retry once with stricter prompt → fall back to parsing scores via regex → canned verdict |
| Streaming flaky | Non-streamed response + typewriter CSS animation |
| Stats API temptation | Resist. Model knowledge only; note as V2 |

## QUALITY BARS (unchanged from template)
TypeScript strict, no `any` · consistent spacing grid · 3–5 intentional colors · hover/focus/disabled states · dark courtroom aesthetic, never generic-AI · every screen has one clear primary action · helpful error states · <3s initial load.
