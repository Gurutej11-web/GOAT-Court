# ⚖️ GOAT Court

**Put greatness on trial.** Pick any sport and any two legends, take a side, and argue your athlete is the greatest of all time — against an AI opposing counsel that fires back with real career stats. After three rounds, an AI judge scores the trial and delivers a written verdict.

Built for United Hacks (Sports track).

## The trial

1. **File a case** — choose from a docket of 10 famous rivalries (Jordan v. LeBron, Messi v. Ronaldo, Federer v. Nadal…), let the court pick one, or enter any sport and any two athletes.
2. **Choose your side** — you represent one legend; the AI represents the other.
3. **Argue three rounds** — opening statements, rebuttal, closing arguments. The AI counsel streams its response live, citing real championships, records, and career numbers.
4. **The verdict** — the AI judge scores every round for both counsels (evidence, logic, persuasion), names a winner, writes a judicial opinion, and quotes the line of the trial. Argue well and you can beat the machine.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It works immediately in **demo mode** (scripted arguments, offline-safe for demos).

For live AI arguments, copy `.env.example` to `.env.local` and add your key:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript (strict)
- **Tailwind CSS v4** — courtroom design system (mahogany, parchment, brass; Libre Caslon Text / Public Sans / IBM Plex Mono)
- **Anthropic SDK** — `claude-opus-4-8` (override with `GOAT_MODEL`)
  - `/api/counsel` streams the opposing counsel's argument token-by-token
  - `/api/judge` uses structured outputs (JSON schema) for a typed, scored verdict

## Architecture

```
app/
  page.tsx            → detects live vs demo mode at request time
  GoatCourt.tsx       → client state machine: setup → 3 rounds → verdict
  api/counsel/route.ts→ streaming argument (demo fallback streams canned text)
  api/judge/route.ts  → structured verdict, retry-once, demo fallback
components/           → CaseSetup, Courtroom, VerdictScene
lib/                  → types, prompts + verdict schema, rivalry seed data, demo scripts
```

## Known limitations (V2 ideas)

- Stats come from the model's knowledge, not a live sports API — swap in a stats API for citable numbers.
- Demo mode has fully-written stat-backed scripts only for Jordan/LeBron; other athletes get rhetorical (stat-free) scripts by design, to avoid fabricating numbers.
- No persistence — verdicts aren't saved. A shareable verdict card is the obvious next feature.

---

*Research notes in [RESEARCH_NOTES.md](RESEARCH_NOTES.md) · build log in [BUILD_LOG.md](BUILD_LOG.md) · the reusable 2.5-hour build prompt in [BUILD_PROMPT.md](BUILD_PROMPT.md).*
