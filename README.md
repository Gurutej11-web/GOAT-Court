# 🐐 GOAT Court

**Pick two legends, argue your case, settle the debate.** Choose a matchup from basketball, soccer, tennis, football, or boxing, take a side, and argue your pick is the greatest of all time — against an AI that fires back with real career stats. After three rounds, an AI judge scores it and hands down a verdict.

## How it works

1. **Pick a matchup** — grab one of the popular picks (Jordan vs LeBron, Messi vs Ronaldo, Federer vs Nadal…), hit surprise me, choose from the player database, or type in any sport and any two players.
2. **Pick your side** — you argue for one legend, the AI argues for the other.
3. **Go three rounds** — make your case, clap back, bring it home. The AI streams its response live, citing real championships, records, and career numbers.
4. **Get the verdict** — the AI judge scores every round for both sides (evidence, logic, persuasion), picks a winner, writes up why, and calls out the best line of the debate. Argue well and you can beat the machine.

## Features

- **Player photos** for every database athlete, with a generated initials avatar for anyone typed in by hand.
- **Two ways to build a matchup**: pick from the curated database, or type any sport/players freehand.
- **Save & resume** — your in-progress debate is saved to the browser automatically; leave and come back anytime.
- Smooth screen transitions and micro-animations throughout.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It works immediately in **demo mode** (scripted arguments, no API key needed).

For live AI arguments, copy `.env.example` to `.env.local` and add your key:

```bash
GROQ_API_KEY=gsk_...
```

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript (strict)
- **Tailwind CSS v4** — purple/cyan design system, Space Grotesk (display), Inter (body), IBM Plex Mono (stats)
- **Groq SDK** — `llama-3.3-70b-versatile` by default (override with `GOAT_MODEL`)
  - `/api/counsel` streams the AI debater's argument token-by-token
  - `/api/judge` returns a structured, scored verdict as JSON

## Architecture

```
app/
  page.tsx            → detects live vs demo mode at request time
  GoatCourt.tsx       → client state machine: setup → 3 rounds → verdict
  api/counsel/route.ts→ streaming argument (demo fallback streams canned text)
  api/judge/route.ts  → structured verdict, retry-once, demo fallback
components/           → CaseSetup, Courtroom, VerdictScene
lib/                  → types, prompts, sports/player database, demo scripts
```

## The database

The curated roster covers basketball, soccer, tennis, American football, and boxing, each with a handful of legends and a real photo — so those debates are guaranteed to have real, citable stats behind them. You can also type in any sport and any two players; the AI still won't invent stats for names it doesn't know well.

## Known limitations

- Stats come from the model's knowledge, not a live sports API.
- Demo mode has fully-written stat-backed scripts only for Jordan/LeBron; other matchups get rhetorical (stat-free) scripts by design, to avoid fabricating numbers.
- Save/resume uses browser localStorage, so it's per-device — there's no account system or cross-device sync.
