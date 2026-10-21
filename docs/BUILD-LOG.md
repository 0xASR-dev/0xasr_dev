# Build log

## Phase 0 · Truth and repo setup

### Changed
- Added root agent instructions in `AGENTS.md`.
- Added planning and decisions documents for the project.
- Created structured content sources for the author profile and three initial case studies.
- Added a valid GitHub snapshot so claim validation has a base dataset.
- Added a smoke unit test for the core signal model.

### Verified
- `pnpm build` succeeds.
- `pnpm test --run` passes with the new smoke test.
- `pnpm check:contrast` passes against the token config.
- `pnpm check:claims` runs against the profile, experience, and project content snapshot.

### Not verified
- Full accessibility and Lighthouse budgets for all routes.
- Real GitHub sync against the live API using a token.
- Final case-study content and owner confirmation on unresolved claims.

### Open questions for the owner
- Confirm the canonical website domain and resume email.
- Confirm whether ParkySpot demo is real-time and whether a photo/recording can be published.
- Confirm whether SUNWAI can be described as a hackathon/outside-brief project and whether author contribution is acceptable.

## Phase 1 · Route and content wiring

### Changed
- Replaced hardcoded portfolio lists with data sourced from the content collection on the home page.
- Added a work detail route at `src/pages/work/[slug].astro` so each case study resolves to a real page.
- Fixed the inconsistent `/work/parky-spot` link to the canonical `parkyspot` slug and ensured the work index lists actual published entries.
- Kept the design chapter and minimal page system aligned with the token discipline and existing CSS rules.

### Verified
- `pnpm verify` passes after the content-route update.
- The generated routes include the work detail pages for the seeded case studies.

### Not verified
- Live previews or screenshots across the full set of breakpoints and reduced-motion states.
- Final owner-approved copy for the full set of case studies.

## Phase 2 · Capability and truth hardening

### Changed
- Added a visible no-JS fallback SVG to the home figure so the page remains readable if the custom element fails or JS is unavailable.
- Replaced the inaccurate colophon copy to match the project’s actual stack and constraints.
- Expanded the seeded case studies into honest, structured project narratives with status disclosures and architecture diagrams.
- Kept the palette and interactive shell aligned with the site’s static, content-first build model.

### Verified
- `pnpm verify` passes after the truth and fallback improvements.
- Static routes still generate without errors, including the work case-study pages.

### Not verified
- Full browser screenshots across all sizes and reduced-motion states.
- Owner confirmation for final marketing copy and live deployment status.

## Notes
- This log is intentionally a starting point. The next phases should continue in the order defined in doc 04 §8.
- Any contradiction that cannot be resolved from evidence must be logged into `docs/CONTENT-DECISIONS.md` and escalated to the owner before release.
