# 🐐 GOAT Court

**Pick two legends, argue your case, settle the debate.** Choose a matchup from basketball, soccer, tennis, football, boxing, cricket, or ice hockey, take a side, and argue your pick is the greatest of all time against an AI (or a friend) that fires back with real career stats. After three rounds, an AI judge scores it and hands down a verdict.

## How it works

1. **Pick a matchup**: grab one of the popular picks (Jordan vs LeBron, Messi vs Ronaldo, Federer vs Nadal), hit surprise me, or type any sport and any two players (with live suggestions from the roster as you type). Filter the picks by sport if you know what you're after.
2. **Pick your opponent**: debate the AI, or pass the device to a friend and debate them instead.
3. **Pick your side**: argue for one legend, your opponent argues for the other.
4. **Go three rounds**: make your case, clap back, bring it home. The AI streams its response live (or your friend types theirs), citing real championships, records, and career numbers.
5. **Get the verdict**: the AI judge scores every round for both sides (evidence, logic, persuasion), picks a winner, writes up why, and calls out the best line of the debate. Argue well and you can beat the machine.

## Features

- **Player photos** for every athlete in the database (self-hosted, not hotlinked), with a generated initials avatar for anyone typed in by hand.
- **One unified search**: type any sport or player and get live autocomplete suggestions from a roster of 40+ athletes across 7 sports; nothing is locked behind a picker. Filter popular matchups by sport.
- **Light and dark mode**, toggleable, saved per-device (light by default).
- **AI style picker**: Balanced, Chill, Ruthless, or Stats Nerd — changes how the AI argues.
- **Debate a friend**: local pass-and-play mode — you and a friend take turns arguing on the same device, with the AI still judging at the end.
- **Challenge links**: share a matchup as a URL; whoever opens it gets the same matchup pre-filled (defaulted to the opposite side) to debate themselves.
- **Save & resume**: your in-progress debate is saved to the browser automatically; leave and come back anytime.
- **Debate history**: every finished debate is logged locally, with a win/loss/streak record shown on the home screen.
- **Tournament mode**: pick a champion and two opponents, then fight through a semifinal and final to be crowned bracket GOAT.
- **Copy result** or **share a verdict image**: a generated shareable graphic, not just plain text.
- **Voice input**: dictate your argument instead of typing, where the browser supports it.
- **Per-round timer**, onboarding tips for first-time visitors, and smooth transitions/animations throughout.

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
- **Tailwind CSS v4**: light/dark theme with a single gold accent (no gradients), Space Grotesk (display), Inter (body), IBM Plex Mono (stats)
- **Groq SDK**: `llama-3.3-70b-versatile` by default (override with `GOAT_MODEL`)
  - `/api/counsel` streams the AI debater's argument token-by-token
  - `/api/judge` returns a structured, scored verdict as JSON

## Architecture

```
app/
  page.tsx            → detects live vs demo mode at request time
  GoatCourt.tsx       → client state machine: setup → 3 rounds → verdict
  api/counsel/route.ts→ streaming argument (demo fallback streams canned text)
  api/judge/route.ts  → structured verdict, retry-once, demo fallback
components/           → CaseSetup, Courtroom, VerdictScene, TournamentMode,
                         AutocompleteInput, ThemeToggle, HistoryPanel
lib/                  → types, prompts, sports/player database, demo scripts,
                         stats/history persistence, shareable-image generation
public/players/        → self-hosted athlete photos
```

## The database

The roster covers basketball, soccer, tennis, American football, boxing, cricket, and ice hockey, each with several legends and a real photo, so those debates are guaranteed to have real, citable stats behind them. You can also type in any sport and any two players; the AI still won't invent stats for names it doesn't know well.

## Known limitations

- Stats come from the model's knowledge, not a live sports API.
- Demo mode has fully-written stat-backed scripts only for Jordan/LeBron; other matchups get rhetorical (stat-free) scripts by design, to avoid fabricating numbers.
- Save/resume, stats, and history use browser localStorage, so they're per-device: there's no account system or cross-device sync.
- "Debate a friend" is local pass-and-play on one device, not real-time remote multiplayer (that would need a backend this project doesn't have).
- Voice input depends on the browser's Web Speech API support (widely available in Chrome-based browsers, not in all browsers).
