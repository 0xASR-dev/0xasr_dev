# Portfolio: agent instructions

Read in order: docs/00 → 01 → 02 → 03 → 04. They are the brief. Do not start coding before Phase 0 is complete.

## Hard rules
- Stack and decisions: doc 03 §2. No new dependency without an entry in docs/DECISIONS.md.
- Install versions using doc 03 §3.2 (14-day rule, read current docs, exact pins). Do not paste config from memory.
- Every visual value comes from a token (doc 02). Run the `token-discipline` skill on every CSS change.
- Motion: run the `motion-gate` skill first. No scroll effects, no looping, no new curves.
- Content: run the `portfolio-truth` skill. Never publish an unresolved contradiction, an unevidenced number, or a phone number.
- Never use third-party skills before vetting them (doc 04 §5).
- Report honestly: every phase ends with a Changed / Verified / Not verified list in docs/BUILD-LOG.md.

## Commands
- `pnpm dev`, `pnpm build`, `pnpm preview`
- `pnpm verify` → Biome + `astro check` + Vitest + `check:contrast` + `check:claims`
- `pnpm sync:github`, `pnpm check:claims`, `pnpm check:contrast`, `pnpm check:headers`
- `pnpm test:e2e`, `pnpm lhci`

## Definition of done
The acceptance criteria in doc 01 §11 for that phase, plus `release-gate` with no failing item and no unreported "Not verified".
