# 03 · System Architecture

Applies to: Approach A · The Index (doc 00 §5).
Principle: **boring where it can be, modern where it pays.** The platform (HTML, CSS, `<dialog>`, View Transitions, speculation rules) does the work that a framework would otherwise do. JavaScript is a small, optional layer on top of a site that is complete without it.

---

## 1. Context and constraints

| Constraint | Consequence |
|---|---|
| Owner is job-hunting; visitors arrive from links on phones | Static output on a CDN; ≤ 12 KB gzipped JS on `/`; no runtime server |
| Claims must be verifiable and consistent with the resume | Content is data (typed collections); resume page and PDF are generated from it; build checks block unevidenced claims |
| GitHub data is useful but the API rate-limits (the sandbox that prepared these docs was rate-limited on an unauthenticated call) | Build-time sync with a token, committed snapshot as fallback; never call GitHub from the browser |
| Site must work without JS and under reduced motion | Progressive enhancement; the figure has a build-time SVG fallback from the same model |
| Maintainer is one person | One content folder, one token file, no content in components, few dependencies |

## 2. Architecture decisions

| # | Decision | Chosen | Rejected, and why |
|---|---|---|---|
| D1 | Rendering | **Static site generation**, `output: static` | Next.js with server components: adds a runtime, cache semantics and a failure mode for zero visitor benefit. SPA: worse first paint, fails without JS. |
| D2 | Framework | **Astro** (islands, content collections, MDX) | Next.js (see D1), SvelteKit (fine, but Astro's content collections fit this data-first site better), hand-rolled HTML (loses typed content and the build checks). |
| D3 | Client framework | **None.** Vanilla TypeScript custom elements for the figure and palette | React islands: ~40 KB runtime to render about 200 lines of UI. Added only if a future figure truly needs it. |
| D4 | Styling | **Hand-written CSS**: cascade layers, custom properties, `color-scheme`, `light-dark()` where useful | Tailwind: fast to build, but utility soup makes token discipline harder to enforce and encourages template look. Acceptable only if the owner explicitly prefers it. |
| D5 | Motion | **CSS** (transitions, `@starting-style`, cross-document `@view-transition`) plus one small canvas module | Motion (animation library) and GSAP: no need; both add weight for effects CSS already does. |
| D6 | Search and navigation | **Native `<dialog>` palette over an inlined static index (~15 entries)** | Pagefind or Fuse: justified past ~30 pages, not before. |
| D7 | Content | **Typed content collections** (Zod) with MDX for case studies | A headless CMS: unnecessary with one author. |
| D8 | GitHub data | **Build-time sync script + committed JSON snapshot** | Client-side API calls (rate limits, CORS, privacy, layout shift). Live feed (doc 00, Approach C). |
| D9 | Resume | **Same data → `/resume` page → PDF printed at build** | Hand-maintained `.docx` (drifts, and has already drifted from GitHub). |
| D10 | Hosting | **Static host on a CDN with an India edge**: Cloudflare (Pages or static assets on Workers: check current docs, product naming changes) or Vercel. No framework adapter needed for static output. | A VPS: operations for no gain. |
| D11 | Package manager | **pnpm** with a committed lockfile and exact pins | npm (acceptable), Yarn (no reason). |
| D12 | Quality gates | Biome, `astro check`, Vitest, Playwright + axe, Lighthouse CI, custom content checks | Manual review only. |

Every deviation from this table is recorded in `docs/DECISIONS.md` with the reason and the date.

## 3. Stack, versions, and the verify-before-use protocol

### 3.1 What I found on 21 Oct 2026 (npm registry)

Several of these majors are **newer than the build agent's training data**. Treat any config snippet in these docs as intent, not as code to paste.

| Package | Latest on registry | Published | Role |
|---|---|---|---|
| `astro` | 7.4.1 | 19 Oct 2026 (1 day) | Framework. Requires Node ≥ 22.22.0 (`engines`). |
| `@astrojs/mdx` | 8.1.0 | 15 Oct (5 days) | Case studies. Peer: `astro ^7.2.10`. |
| `@astrojs/sitemap` | 3.7.4 | 31 Aug (50 days) | Sitemap |
| `typescript` | 7.0.2 | 8 Jul (104 days) | Language. Confirm `astro check` supports it; otherwise pin the highest version it supports and record why. |
| `vite` | 8.3.4 | 8 Oct (12 days) | Via Astro; do not install separately unless needed |
| `shiki` | 4.5.0 | 1 Oct (19 days) | Code highlighting (Astro ships its own; use the bundled one) |
| `zod` | 4.6.7 | 12 Oct (8 days) | Schemas |
| `astro-og-canvas` | 0.13.2 | 15 Sep (35 days) | OG images (verify it builds on the chosen Astro; `satori` + `resvg` is the fallback) |
| `@fontsource-variable/ibm-plex-sans` | 5.3.0 | 19 Jul (93 days) | Primary font |
| `@fontsource/ibm-plex-sans-devanagari` | 5.3.0 | 19 Jul | Hindi text |
| `@fontsource/ibm-plex-mono` | 5.3.0 | 19 Jul | Code and readout |
| `vitest` | 5.0.5 | 15 Oct (5 days) | Unit tests |
| `@playwright/test` | 1.64.1 | 14 Oct (6 days) | E2E, PDF, visual checks |
| `@axe-core/playwright` | 4.14.0 | 15 Oct (5 days) | Accessibility checks |
| `@lhci/cli` | 0.15.1 | 25 Jun 2025 (482 days) | Lighthouse CI budgets (old but it is a thin runner; confirm it still works with current Chrome) |
| `@biomejs/biome` | 2.5.15 | 30 Sep (20 days) | Lint and format |
| `pnpm` | 12.14.0 | 15 Oct (5 days) | Package manager |

### 3.2 Protocol (mandatory, in this order)

1. **Pick versions with the 14-day rule.** Do not install a release published in the last 14 days (a fresh release can carry a bad or malicious change before anyone notices). Run `scripts/pick-versions.mjs` (below); it prints the newest release at least 14 days old for each package. Several "latest" entries above fail this rule today.
2. **Read the current docs and migration guide** for each major before writing its config. Create the project with the framework's own generator and keep the generated config as the baseline.
3. **Pin exact versions** and commit the lockfile. No `^` or `latest` in `package.json`.
4. **Record** every chosen version and any deviation in `docs/DECISIONS.md`.
5. If something in these docs contradicts the current official docs, **the official docs win**, and the agent logs the difference.

```js
// scripts/pick-versions.mjs  (read-only: prints a recommendation, installs nothing)
import { execSync } from "node:child_process";
const DAYS = 14;
const cutoff = Date.now() - DAYS * 864e5;
const pkgs = process.argv.slice(2);
for (const p of pkgs) {
  const time = JSON.parse(execSync(`npm view ${p} time --json`, { encoding: "utf8" }));
  const best = Object.entries(time)
    .filter(([v]) => /^\d+\.\d+\.\d+$/.test(v))                  // stable releases only
    .filter(([, d]) => new Date(d).getTime() <= cutoff)
    .sort((a, b) => new Date(a[1]) - new Date(b[1]))
    .at(-1);
  console.log(`${p.padEnd(40)} ${best ? best[0] : "none old enough"}  ${best ? best[1].slice(0, 10) : ""}`);
}
// usage: node scripts/pick-versions.mjs astro @astrojs/mdx zod vitest
```

## 4. Repository layout

```
portfolio/
├─ AGENTS.md                      entry point for the build agent (rules + skill routing, see doc 04)
├─ docs/
│  ├─ 00-…04-*.md                 these documents
│  ├─ DECISIONS.md                version pins and deviations
│  ├─ CONTENT-DECISIONS.md        every content conflict and its resolution
│  └─ BUILD-LOG.md                per-phase notes, checklist results
├─ src/
│  ├─ content/
│  │  ├─ profile.yaml
│  │  ├─ experience/*.yaml
│  │  └─ projects/*.mdx           one file per project
│  ├─ data/github.snapshot.json   committed, written by sync script
│  ├─ components/                 Link, Row, Prose, Figure, CopyEmail, ThemeControl, Palette (all .astro)
│  ├─ elements/                   signal-figure.ts, palette.ts, copy-email.ts (custom elements)
│  ├─ lib/                        signal-model.ts, format.ts, palette-index.ts
│  ├─ layouts/Base.astro
│  ├─ pages/                      index, work/index, work/[slug], resume, colophon, 404, og/[...slug].png
│  └─ styles/                     tokens.css, base.css, prose.css, motion.css, print.css
├─ scripts/
│  ├─ sync-github.ts
│  ├─ check-claims.ts
│  ├─ check-contrast.ts
│  ├─ check-headers.ts
│  ├─ make-resume-pdf.ts
│  └─ pick-versions.mjs
├─ tests/
│  ├─ unit/                       signal-model, schemas, palette matcher
│  └─ e2e/                        routes, a11y, keyboard, no-js, reduced-motion, themes
├─ public/                        robots.txt, favicon, _headers (or host equivalent)
└─ .github/workflows/             ci.yml, sync.yml, links.yml
```

## 5. Runtime architecture

```
 Author edits                                   Build (CI)                         Runtime (CDN)
 ───────────                                    ──────────                         ─────────────
 content/*.mdx|yaml ─┐                      ┌─ sync-github.ts  ─▶ snapshot.json
 github.snapshot.json┼─▶ Astro content ─▶ check-claims.ts (fail on unevidenced      static HTML + CSS
 tokens.css, base.css┘   collections        claims / stack mismatch / phone numbers)  + ≤12 KB JS
                         (Zod-typed)   ─▶ astro build ─▶ dist/ ─▶ make-resume-pdf ─▶ + /resume.pdf
                                                           │                        + OG images
                                                           └─▶ palette index (inlined JSON)
 Browser: HTML renders complete ─▶ theme bootstrap (inline, hashed) ─▶ custom elements upgrade
          (figure, palette, copy) ─▶ View Transitions + speculation rules (if supported)
```

There is no server, no database and no API at runtime. The only network requests a visitor makes are for the site's own files.

## 6. Content and data pipeline

### 6.1 Schemas (Zod; adapt to the current Astro content-collection API)

```ts
const evidence = z.union([z.string().url(), z.string().regex(/^\/[\w./-]+$/)]); // URL or repo-relative path
const metric   = z.object({ label: z.string(), value: z.string(), evidence });

export const project = z.object({
  title: z.string(),
  summary: z.string().max(140),                       // the one line used in rows and OG
  year: z.number().int(),
  status: z.enum(["live", "demo", "archived"]),
  tier: z.enum(["case-study", "list"]),
  role: z.string(),
  authorship: z.enum(["own", "team", "fork"]),
  contribution: z.string().optional(),                // REQUIRED unless authorship === "own"
  stack: z.array(z.string()).min(1),
  links: z.object({ repo: z.string().url(), live: z.string().url().optional() }),
  disclosures: z.array(z.string()).default([]),       // rendered as the status line, e.g. "Demo data is synthetic."
  metrics: z.array(metric).default([]),
  order: z.number().int(),
}).refine(p => p.authorship === "own" || !!p.contribution, { message: "contribution required when authorship is not 'own'" });

export const experience = z.object({
  org: z.string(), role: z.string(), location: z.string().optional(),
  start: z.string().regex(/^\d{4}-\d{2}$/), end: z.union([z.literal("present"), z.string().regex(/^\d{4}-\d{2}$/)]),
  summary: z.string().max(160),                       // home page, two lines max
  bullets: z.array(z.string()).default([]),           // /resume only
});

export const profile = z.object({
  name: z.string(), descriptor: z.string(), intro: z.string(),
  email: z.string().email(), links: z.object({ github: z.string().url(), linkedin: z.string().url(), x: z.string().url().optional() }),
  education: z.array(z.object({ school: z.string(), program: z.string(), years: z.string(), cgpa: z.string().optional() })),
});
```

`profile` deliberately has **no phone field**. A phone number cannot be published by accident because the schema cannot hold one.

### 6.2 GitHub sync (`scripts/sync-github.ts`)

- Runs in CI and locally with `GITHUB_TOKEN` (read access to public data is enough; the workflow's built-in token works).
- Fetches the owner's repositories (paginated), and for each repo the fields `fork`, `parent` (fetched per fork), `language`, `topics`, `pushed_at`, `stargazers_count`, `homepage`, `default_branch`, `license`.
- For every repo referenced by a project, fetches dependency manifests from the default branch (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, `platformio.ini`, `Dockerfile`) and stores a normalised list of detected technologies.
- Writes `src/data/github.snapshot.json` (stable key order so diffs are reviewable) with `fetchedAt`.
- On API failure: keeps the existing snapshot, prints a warning, exits 0. If the snapshot is older than 60 days: build warning; older than 120 days: build error.
- `.github/workflows/sync.yml` runs weekly and opens a pull request when the snapshot changes. It never commits to `main` directly.

### 6.3 Claims ledger (`scripts/check-claims.ts`, runs in `prebuild` and CI)

Fails the build when any of these is true:

1. A `metrics[]` entry has no `evidence`, or its URL does not return 2xx (soft-fail with a warning when offline).
2. A project's `links.repo` is not in the snapshot.
3. The snapshot says `fork: true` and the project says `authorship: "own"`.
4. A `stack` item is neither detected in the repo manifests/languages nor listed in `stackAllowlist` with a written justification (for example "ESP32: firmware lives in `/firmware`, no manifest").
5. A banned word from doc 02 §9 appears in content.
6. A case-study MDX file is missing a required heading, in order: *What it does*, *The constraint that shaped it*, *How it works*, *What I built*, *What I'd change*, *Evidence*.
7. Built HTML contains a phone-like number (`(\+91[\s-]?)?[6-9]\d{9}`).
8. A Devanagari run in built HTML is not inside an element with `lang="hi"`.

Conflicts that the script cannot decide (for example the IESCP-V2 stack) are written to `docs/CONTENT-DECISIONS.md` by the agent and escalated to the owner, never resolved by guessing.

## 7. Front-end systems

### 7.1 CSS architecture
`@layer reset, tokens, base, components, utilities;` in `styles/index.css`, in that order, so specificity never needs `!important` (the single exception is the theme-switch override in §7.2). No inline `style` attributes (CSP blocks them); dynamic values go through class toggles or the CSSOM from script. Tokens are defined only in `tokens.css`.

### 7.2 Theme
- An inline `<script>` in `<head>` (its SHA-256 hash is in the CSP) reads `localStorage["theme"]` inside try/catch and sets `data-theme="light|dark"` on `<html>` if present; otherwise CSS follows `prefers-color-scheme`.
- Switching: add `.no-transitions` (`*{transition:none!important}`) to `<html>`, set the attribute, force a style flush with `getComputedStyle(document.documentElement).opacity`, remove the class on the next animation frame, then write to storage in try/catch.
- Storage unavailable: the choice applies for the page lifetime and the site still works.

### 7.3 Fonts
Self-hosted via Fontsource packages. Preload only the Latin regular variable file. Devanagari in its own `@font-face` with `unicode-range` so it downloads only on pages that contain it. Declare a fallback `@font-face` using `size-adjust`/`ascent-override` on a local system font so the swap does not move text (target CLS = 0). `font-display: swap`.

### 7.4 Page transitions and prefetch (progressive enhancement)
```css
@view-transition { navigation: auto; }
::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: 150ms;
  animation-timing-function: var(--ease-out);
}
```
Use the browser's native cross-document view transitions, **not** a JavaScript client router (keeps JS near zero). Speculation rules in `<head>`:
```html
<script type="speculationrules">
{"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}
</script>
```
Both are ignored by browsers that do not support them. Check current support before relying on either, and test with each disabled.

### 7.5 Command palette (`elements/palette.ts`)
- A `<dialog>` is in the base layout, empty until first open. The index (pages and projects: title, summary, stack, href) is inlined as `<script type="application/json" id="palette-index">`, generated at build.
- Custom element wires `keydown` for `⌘K` / `Ctrl K` (ignored while typing in another input or contenteditable), opens with `showModal()`, implements combobox/listbox ARIA per doc 02 §6.3, restores focus to the opener on close.
- Matcher: lowercased substring scoring (title > summary > stack), stable ordering. Unit-tested.
- Animation via CSS (`@starting-style`, `transition-behavior: allow-discrete`); no JS animation.

### 7.6 Copy email (`elements/copy-email.ts`)
`navigator.clipboard.writeText` when available; otherwise select the address text. Updates a `role="status"` region. Icon swap by toggling a class (CSS crossfade). Reverts after 2 s.

### 7.7 OG images
One per page at build, 1200 × 630. Paper background, the page title in Plex Sans 500, the settled signal line drawn from the same model as the only graphic. No gradient. Verify the chosen library builds on the current Astro; fall back to Satori + resvg if not.

### 7.8 Resume PDF (`scripts/make-resume-pdf.ts`)
After `astro build`, serve `dist/` locally and use Playwright to print `/resume` to `dist/resume.pdf` with A4, backgrounds off, `preferCSSPageSize`. CI then checks: file ≤ 200 KB; text extraction (`pdftotext`) contains the owner's name and email; no table-based layout in the print DOM.

## 8. Signal figure model

Pure, deterministic, framework-free. File: `src/lib/signal-model.ts`. The animated canvas, the build-time SVG fallback, the OG image and the unit tests all call this same module, so none of them can disagree.

### 8.1 Definition

Constants: `n = 320` samples, `sigma = 0.6`, `seed = 0xA5A5`, filter `window = 9`.

- Clean signal: `clean[i] = sin(2π·3·x) + 0.4·sin(2π·7·x + 0.8)`, with `x = i / (n − 1)`.
- Noise: seeded PRNG **mulberry32**; Gaussian samples by Box–Muller (`u` redrawn while `u === 0`). `raw[i] = clean[i] + sigma · g[i]`.
- Burst noise: a second stream from `seed ^ 0x9E3779B9`, one Gaussian per sample (`burstNoise[i]`).
- Disturbance for each burst `{x0, amp, age}`: `d[i] = raw[i] + Σ amp · exp(−age / 0.6) · exp(−0.5·((x − x0)/0.08)²) · burstNoise[i]`.
- Smoothing: centred moving average of `window` samples, with the window shrinking at the edges (no padding).
- Filtered line: `y[i] = (1 − λ)·d[i] + λ·smooth(d)[i]`, `λ ∈ [0, 1]`.
- Settle: `λ(t) = easeOut((t − 0.3) / 1.2)`, `easeOut(u) = 1 − (1 − clamp(u,0,1))³`, with `t` in seconds since the box appeared.
- Readout: `SNR_dB = 10·log10( Σ clean² / Σ (y − clean)² )`.
- Drawing: horizontal position `x·W`; vertical `H/2 − clamp(v, −1.8, 1.8) · (H/2 − 4) / 1.8`.

### 8.2 Golden values (computed on 21 Oct 2026 with exactly the definition above, Node)

| Case | SNR (dB) |
|---|---|
| λ = 0 (raw) | 1.75 |
| λ = 0.25 | 3.95 |
| λ = 0.5 | 6.71 |
| λ = 0.75 | 9.99 |
| λ = 1 (settled) | **12.00** |
| λ = 1, burst `{x0: 0.5, amp: 1.5, age: 0}` | 9.15 |
| λ = 1, same burst at `age: 1.8` s | 12.04 |

Across seeds 1, 2, 3, 12345: raw 1.7–2.5 dB and settled 10.5–12.5 dB.

If the agent's implementation does not reproduce the first seven rows to ±0.05 dB, it differs from the definition, and the discrepancy is fixed before anything else is built.

### 8.3 Unit tests (`tests/unit/signal-model.test.ts`)
- Reproduces the golden table (±0.05 dB).
- SNR is strictly increasing in λ for the default seed.
- Settled minus raw ≥ 8 dB for the default seed; for seeds 1, 2, 3, 12345, settled is within 10–13 dB and raw within 1–3 dB.
- A burst lowers SNR at `age = 0` and recovers to within 0.5 dB of the no-burst value by `age = 1.8`.
- Output length equals `n`; no `NaN` or `Infinity` for any λ in [0, 1] and any `x0` in [0, 1].
- The static SVG path string for the settled frame at `W = 640, H = 96` matches a committed snapshot (the snapshot changes only when the model changes, on purpose).

### 8.4 Runtime wrapper (`elements/signal-figure.ts`)
- `<signal-figure>` custom element; reserves its box in HTML; draws to a canvas capped at DPR 1.5.
- A single `requestAnimationFrame` loop that runs only while (a) the element intersects the viewport, (b) the document is visible, and (c) something is changing (settling, or a burst still decaying). When nothing changes the loop stops and the canvas keeps the last frame.
- Reduced motion: draw the settled frame once; handle pointer/keyboard in a single step with no easing.
- Pointer: burst amplitude `min(1.5, speed · k)`; ignore events faster than one burst per 50 ms.
- Keyboard and ARIA as specified in doc 02 §8.4–8.5.
- Never touches `localStorage`.

## 9. Security and privacy

Headers (set through the host's mechanism, such as a `_headers` file or `vercel.json`; verify which one your host uses):

```
Content-Security-Policy: default-src 'none'; script-src 'self' 'sha256-<theme-bootstrap-hash>' 'inline-speculation-rules'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Cache-Control (hashed assets): public, max-age=31536000, immutable
Cache-Control (HTML): public, max-age=0, must-revalidate
```

- `style-src 'self'` means no inline `<style>` and no `style=""` attributes. If the framework inlines critical CSS by default, either turn that off or add the hashes it produces. CSSOM changes from script (`el.style.x = …`) are allowed.
- No third-party scripts, fonts, analytics or embeds. No cookies.
- Email is shown as text (it is already public on the owner's GitHub). The phone number never enters the repository: not in content, not in fixtures, not in tests.
- `scripts/check-headers.ts` requests the deployed preview and asserts these headers are present. Preview deploys that fail it block the merge.
- Third-party skills and packages are untrusted input: read before installing, pin versions (doc 04 §6).

## 10. Build, CI/CD, environments

| Environment | Source | Purpose |
|---|---|---|
| Local | working tree | development |
| Preview | every pull request | review, e2e, Lighthouse, header check |
| Production | `main` | the live site |

Branch protection: `main` requires the CI workflow to pass and a pull request (even for a one-person repo, so the gates always run).

`ci.yml` jobs:
1. **verify**: frozen-lockfile install, Biome, `astro check`, Vitest, `check-contrast`, `check-claims`.
2. **build**: `astro build`, `make-resume-pdf`, built-output scans (phone regex, banned words, `lang="hi"`), upload artifact.
3. **e2e**: Playwright against the built output. Projects: default, **JS disabled**, **reduced motion**, **dark scheme**, mobile viewport. Axe on every route in every project.
4. **lighthouse**: Lighthouse CI against the preview with the budgets in §12.
5. **headers**: `check-headers` on the deployed preview.

`links.yml`: weekly external link check (not per-PR, because external sites make it flaky). `sync.yml`: weekly GitHub sync pull request. Dependency updates: grouped minor/patch weekly; majors by hand, after reading the changelog and re-running §3.2.

## 11. Testing strategy

| Layer | What | Tool |
|---|---|---|
| Unit | Signal model, schema validation (good and bad fixtures), palette matcher, date formatting | Vitest |
| Content | Claims ledger, contrast, banned words, phone scan | Custom scripts |
| E2E | Every route loads; header, footer and palette links work; palette: open, filter, arrow, Enter, Esc returns focus; copy email shows status; theme persists and does not flash; figure reacts to keyboard; 404 | Playwright |
| Accessibility | Axe on every route × {default, dark, reduced motion, JS off}; manual keyboard and screen reader pass per doc 02 §11 | `@axe-core/playwright` + manual |
| Visual | Screenshots of static states at 320, 768 and 1280 px, both themes, reduced motion (so the figure is deterministic) | Playwright |
| Performance | Budgets (§12) | Lighthouse CI |
| Real devices | One mid-range Android, one iPhone, desktop Chrome, Safari, Firefox | Manual, logged in `BUILD-LOG.md` |

## 12. Performance budgets (targets I set; enforced in CI)

| Metric | Budget |
|---|---|
| Lighthouse (mobile) | ≥ 98 for Performance, Accessibility, Best Practices, SEO |
| LCP | ≤ 1.2 s |
| CLS | 0 |
| Total blocking time | ≤ 100 ms (lab proxy for INP) |
| JavaScript on `/` | ≤ 12 KB gzipped |
| HTML + CSS on `/` | ≤ 20 KB gzipped |
| Fonts on `/` (Latin) | ≤ 90 KB |
| Images on `/` | none required; any image has explicit width/height and AVIF or WebP |
| Figure frame time while animating | ≤ 4 ms on a mid-range phone (manual Performance panel check) |

## 13. Failure modes

| Failure | Behaviour |
|---|---|
| GitHub API down or rate-limited at sync time | Keep snapshot, warn; build continues |
| `GITHUB_TOKEN` missing | Sync skipped with a clear message; build uses snapshot |
| JS fails or is disabled | Full content, static SVG figure, header links instead of palette |
| Canvas unavailable | Static SVG figure |
| Fonts fail to load | Metric-adjusted system fallback; no layout shift |
| `localStorage` blocked | Theme follows system for the session; hero sequence runs |
| Clipboard API unavailable | Address is selected; status text says to copy manually |
| View Transitions or speculation rules unsupported | Ordinary navigation |
| Host omits security headers | `check-headers` fails the preview |
| A newer major breaks the build | Pin stays at the last working version; deviation logged |

## 14. Maintenance and upgrades

- Quarterly: run `pick-versions`, read changelogs, update pins, re-run the full test suite and real-device pass.
- After any content change: `check-claims` must pass. A new project is a new MDX file; nothing else changes.
- Every six months: re-verify the live demos in each project's links, and update status lines.
- The site's data is the source of truth. If the resume changes, change the data and regenerate the PDF; do not edit the PDF.
