# 00 · Three approaches, one recommendation

Owner: Avneesh Singh (GitHub `0xASR-dev`)
Prepared: 21 Oct 2026
Read order for the build agent: **00 → 01 PRD → 02 Design system → 03 Architecture → 04 Skills**

---

## 1. What I read, and what I could not

**Read directly**
- `AVNEESH_SINGH_base_resume.docx` (full text)
- `github.com/0xASR-dev` profile and profile README
- READMEs of `SUNWAI`, `goboxd`, `IESCP-V2`, `FinScope`, `monastery360`, `parky_spot` (first ~1,800 characters each, via raw.githubusercontent.com)
- The three inspiration sites: `skills.wheresryan.sh/anatomy`, `ui-skills.com` (home, `improve-animations`, `better-ui` skill pages), `emilkowal.ski` (home and "7 Practical Animation Tips")
- Current stable package versions from the npm registry (recorded in doc 03)

**Could not read (the agent must close these gaps in Phase 0)**
- The full list of 31 repositories. The GitHub API rate-limited the sandbox and the web UI blocks automated access. Run `scripts/sync-github.ts` with a token.
- `0xasr.dev`, which your GitHub README links as "Portfolio". The site blocks automated access, so I don't know whether it exists, who owns it, or what it shows.
- Live demos (Parky_Spot, IESCP-V2, Monastery360, MNIST Space). Nothing in these docs claims they work.

---

## 2. Facts that contradict each other (resolve before anything is published)

Your preference is honest flagging, so this section is blunt. The site will become the single source of truth for your claims. Anything below that stays unresolved gets cut from the site, not smoothed over.

| # | Issue | Evidence | What to do |
|---|-------|----------|-----------|
| 1 | **IESCP-V2 has three different tech stacks.** | GitHub profile README: JavaScript, Node.js, Express, MongoDB. Repo README: Flask, SQLite. Resume: Flask, SQLAlchemy, PostgreSQL, Gunicorn. | Open the repo, read `requirements.txt` / `package.json`, and what the live app on Render actually uses. Fix the profile README and the resume to match. |
| 2 | **FinScope framework mismatch.** | Profile README table says React and TailwindCSS. The repo README says Vue 3, Pinia, Tailwind 3.4. | Trust the repo. Fix the profile README. |
| 3 | **goboxd authorship is unclear.** | Repo README clone URL and PR link point to `thesouldev/goboxd`, license is GPLv3. It is listed as a featured project on your profile and is not on your resume. | `sync-github.ts` reads the `fork` and `parent` fields. If it is a fork or a team repo, the case study states your actual contribution in one sentence. If you cannot name one, drop it. |
| 4 | **Monastery360 stack differs between resume and repo.** | Resume: TypeScript, React360/A-Frame, Node.js. Repo README (portion read): React Router v7, Vite, Tailwind, Vercel serverless functions, `@auth/core`; no TypeScript or A-Frame mentioned. | Check `package.json`. List only what ships. |
| 5 | **Resume wording that does not survive a technical reader.** | "Secure TCP/UDP-based RESTful APIs" (REST runs over HTTP on TCP). "Wireless communication protocols" on a web tourism app. "SNR optimization" on an MNIST classifier. | These read as keyword stuffing. Do not copy them to the site. Fix them on the resume too. |
| 6 | **Metrics with no evidence.** | "95%+ sensor accuracy" (Parky_Spot). | The site only shows a number if it links to a test log, notebook or script. Otherwise state it qualitatively or drop it. The schema in doc 03 enforces this at build time. |
| 7 | **Parky_Spot live demo may not match the README.** | The README promises Flask-SocketIO WebSocket updates. The live URL is on Vercel, whose serverless functions do not keep WebSocket connections open. | Open the live URL and watch for live updates. If it falls back to polling or shows static data, label it "demo mode" and add a short recording of the real ESP32 hardware. |
| 8 | **SUNWAI uses synthetic data.** | README: `seed.py --reset --n 40000` generates the demo data. It also refers to "the brief", so it was built against an external challenge. | The case study says "synthetic data" in the first screen, and names the event only if you confirm it. This is your strongest project; the honesty protects it. |
| 9 | **Public name.** | Resume: "Avneesh Singh". GitHub README: "Avneesh Singh Rajpoot". | Pick one for the site title, `<title>`, JSON-LD and the OG image. |
| 10 | **Phone number is on the resume.** | Plain text, top of the document. | It does not go on a public website (spam, scam calls). The email address is already public on your GitHub, so a mailto link is fine. |
| 11 | **Education status.** | Resume: B.Tech 2022–2026. GitHub: "Enrolled". | Update once graduation is confirmed. CGPA appears on the resume page only, not on the home page. |
| 12 | **Your GitHub profile README works against this design.** | Typing animation, snake graph, stats widgets from third-party Vercel apps (often rate-limited and broken), skill-icon grid, "profile views" counter, emoji headings. | After launch, cut the profile README down to three lines and a link to the site. Do not embed any of it on the site. |
| 13 | **MNIST digit recognition is the most common ML starter project.** | It is on the resume with a live Space. | One line under "Also built". No case study. Recruiters discount it, and a case study makes the rest of the page look thinner. |

---

## 3. Three approaches

All three share the same constraints: static-first, no AI-template look, one accent colour, motion only where it answers an action or does one deliberate thing, keyboard and reduced-motion support from day one. They differ in *what the site is*.

Versions below were read from the npm registry on 21 Oct 2026. Several majors (Astro 7, TypeScript 7, Vite 8, Vitest 5) are newer than my training data, so the agent must read current docs and not copy config from memory. See doc 03 §3.

### Approach A · "The Index" (text-first, one figure)

**What it is.** A single quiet column of text, in the spirit of emilkowal.ski: your name, one sentence, a list of work, a list of experience. The only visual object is a small live signal figure that starts as raw sensor noise and settles into a clean line, which is literally what your research internship and Parky_Spot were about.

**Why it is the strongest default.** It loads instantly on a phone from a link in an application, the content does the persuading, and there is almost nothing to maintain.

| Feature | Technology |
|---|---|
| Rendering | Astro 7 static output, zero client JS by default |
| Content | Astro content collections, Zod schemas, MDX for case studies |
| Styling | Hand-written CSS with cascade layers and custom properties (no utility framework) |
| Motion | CSS transitions, `@starting-style`, cross-document View Transitions; small vanilla TS only for the figure |
| Hero figure | `<signal-figure>` custom element on canvas; build-time inline SVG fallback from the same model |
| Navigation | Native `<dialog>` command palette (⌘K), tiny static index, no search library |
| GitHub data | Build-time sync script with a token, committed JSON snapshot as fallback |
| Resume | Same content collections feed `/resume` and a build-generated PDF |
| Images | Astro `<Image>`, AVIF/WebP, 1px neutral outline |
| Fonts | IBM Plex Sans Variable + Plex Sans Devanagari + Plex Mono (self-hosted) |
| SEO / sharing | Sitemap, JSON-LD `Person`, per-page OG image at build |
| Hosting | Static host on a CDN with an India edge (Cloudflare or Vercel) |
| Quality gates | Biome, `astro check`, Vitest (figure maths), Playwright + axe, Lighthouse CI budgets |

**Risk.** It can read as "just a text page" if the copy is generic. Mitigation: the case studies and the figure carry the personality.

### Approach B · "Anatomy" (one live machine per project)

**What it is.** Borrowed from Ryan's Anatomy: each project is explained by a small live object you can press and read, for example a parking bay with an ESP32 sensor and an indicator, or a sandbox cell that accepts untrusted code and returns a result. The object is the explanation.

| Feature | Technology |
|---|---|
| Rendering | Astro 7 with islands (React 19 only where a figure needs it) |
| Figures | Hand-built SVG, or the `anatomy-figures` package (0.1.0, React components and custom elements) and the `wheresryan22/anatomy` skill |
| Motion | Time-based model, idle tour, pause off-screen, still under reduced motion |
| Everything else | As Approach A |

**Risk.** High. Ryan reports 1 h 54 min for a simple figure and 10 h 33 min for a dense one, and says it is "slow when it is good". Four weak figures are worse than none. Not scoped for v1.

### Approach C · "The Ledger" (the site updates itself from GitHub)

**What it is.** A proof-of-work site: recent commits, repository activity and project status pulled from GitHub on a schedule, rendered as a plain typographic ledger, with a command-palette-first navigation model.

| Feature | Technology |
|---|---|
| Rendering | Next.js 16 with cached server components and revalidation, or Astro with a scheduled rebuild |
| Data | GitHub GraphQL API with a server-side token, edge cache |
| Navigation | `cmdk` command palette as the primary nav |
| OG images | Satori at the edge |
| Hosting | Vercel |

**Risk.** Activity feeds only help if the activity is dense. Five followers and a sparse graph would advertise the gap. This also adds a server runtime, a token to protect, and a failure mode (API down, rate-limited) for no recruiter benefit. Not recommended.

---

## 4. Comparison

| | A · Index | B · Anatomy | C · Ledger |
|---|---|---|---|
| Time to a shippable v1 | Lowest | Highest | Medium |
| Mobile load speed | Best | Good | Good |
| Signal for an entry-level application | Strong (content-led) | Very strong if figures are excellent, weak if not | Weak to neutral |
| Maintenance | Lowest | High | Medium |
| Runtime failure modes | None | None | API limits, token, cache |
| Risk of looking templated | Low | Low | Medium |
| Fit with "absolute minimal" | Highest | Medium | Medium |

---

## 5. Recommendation: A, staged

Build **A** as the chassis. Add exactly **one** idea from each of the others:

1. From **B**: the hero figure (done in A) and, only after launch, at most **one** project figure for Parky_Spot, because hardware plus software is your most distinctive combination. Gate: it must pass the figure quality bar in doc 02 §8.6, otherwise it does not ship.
2. From **C**: the command palette (⌘K) and the build-time GitHub sync. Not the live feed.

Owner decisions that change the build (defaults in brackets, the agent proceeds with the default if unanswered):
1. Public name: [Avneesh Singh].
2. Domain: [`0xasr.dev` if you own it, otherwise the host's subdomain until you decide].
3. Case studies at launch: [SUNWAI, ParkySpot, Monastery360; goboxd only if issue 3 resolves; IESCP-V2 as a list entry unless issue 1 resolves].
4. Theme: [follows system, with a toggle].

---

## 6. What "no AI slop" means here, concretely

These are testable rules, collected in doc 02 §10 as a checklist the agent runs before every release.

- No gradient washes, glow, glass, or bento grid.
- No row of identical rounded cards.
- No numbered section markers unless the content is a real sequence.
- No eyebrow labels above headings, no all-caps tracking, no spaced-em-dash labels, no middle-dot meta strings, no arrow glyphs appended to links.
- No fade-and-slide-up on every section. One orchestrated moment on first load.
- No typing animation, snake graph, skill-icon grid, or stat widgets.
- Accent colour appears in four places only (figure line, focus ring, link hover, text selection).
- Every number on the page links to its evidence.
