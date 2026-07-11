# BUILD_LOG — GOAT Court

## Phase 1: Research + scaffold — 2026-07-10 20:05
- Competitive scan: no "GOAT Court" product exists; closest are generic AI debate platforms (ArguFight, DebateIt, GavelBot) — none courtroom-themed or sports-native. Details in RESEARCH_NOTES.md.
- Wrote the 2.5-hour compressed master prompt → BUILD_PROMPT.md.
- Scaffolded Next.js 16 + React 19 + Tailwind v4 + TypeScript, installed @anthropic-ai/sdk.
- Created public repo hariharv/goat-court, first push.
- Decision: model `claude-opus-4-8` (current default per Claude API reference), overridable via GOAT_MODEL env.
- Pivot check: no reusable ANTHROPIC_API_KEY found on this machine → demo mode is first-class, `.env.example` documents the key.

## Phase 2–4: Design system + trial engine + judge — 2026-07-10 20:25
- Courtroom design system in Tailwind v4 @theme: mahogany/parchment/brass/crimson, Libre Caslon Text (display), Public Sans (body), IBM Plex Mono (stats). No Inter, no purple gradients.
- Case setup: 10-rivalry docket chips, custom sport + two athletes, "Let the court pick", side selection cards.
- Trial engine: 3 rounds (opening/rebuttal/closing), user argues via textarea, AI counsel streams back via /api/counsel (plain-text streaming from the Anthropic SDK), OBJECTION! interstitial, court-transcript UI, phase tracker.
- Judge: /api/judge uses structured outputs (output_config.format json_schema) for a typed verdict — per-round 1–10 scores for both counsels, judicial opinion, best line. One retry on malformed JSON, then demo-judge fallback.
- Error states: friendly courtroom-voiced errors with a Retry that re-runs the failed stage only.
- Demo mode: no API key → canned Jordan/LeBron arguments with real stats (word-by-word streamed), generic stat-free scripts for other athletes, effort-based demo verdict the user can genuinely win.
- Typecheck + production build clean.

## Phase 5–6: Testing & QA — 2026-07-10 20:45
- Full trial driven end-to-end in the browser (demo mode): Jordan v. LeBron, 3 rounds, streaming, verdict scene — user won 25–24 (effort-based demo scoring works).
- Custom-case path verified (Chess: Carlsen v. Kasparov) — generic stat-free demo script correct, phase tracker advances.
- Console: zero warnings/errors across the whole flow. No horizontal overflow at 375px; verdict scorecard, chips, and masthead verified at mobile + desktop.
- Fixes: demo tie-break note now computed after score adjustment; verdict claw-hammer emoji → brass SVG gavel; Formula 1 chip tag no longer wraps; page marked force-dynamic so the demo badge reflects .env.local at request time.
- Replaced scaffold README with project README; removed scaffold assets.

## Phase 7: Ship — 2026-07-10 21:00
- Deployed to Vercel (production): https://goat-court.vercel.app — serving 200, runs in demo mode (no ANTHROPIC_API_KEY set in Vercel; add it in Project Settings → Environment Variables to go live).
- GitHub: https://github.com/hariharv/goat-court — pushed after every phase.
