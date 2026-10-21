# 01 · Product Requirements Document

Product: personal portfolio for Avneesh Singh (`github.com/0xASR-dev`)
Approach: **A · The Index**, staged (see doc 00 §5)
Status: ready to build once Phase 0 is complete
Normative language: **MUST**, **SHOULD**, **MAY** are used as in RFC 2119.

---

## 1. Summary

A fast, quiet, text-led personal site that shows what Avneesh builds and lets a stranger verify it in under a minute. It has one memorable element (a live signal figure in the hero), a short list of real projects with honest case studies, a compact experience list, and a resume page whose content comes from the same data as the site.

**Primary job of the site:** when a recruiter, hiring manager or engineer opens a link from a resume or application, they should understand what he builds, believe it, and know how to contact him.

## 2. Goals and non-goals

### Goals
1. A first-time visitor can say what Avneesh builds after reading the first screen (15-second test).
2. Every factual claim on the site is traceable to a repository, a live URL, or a document.
3. The site loads instantly on a mid-range phone on a mobile network.
4. The design is minimal and specific to him, not a template. Doc 02 §10 is the pass/fail checklist.
5. The site is the single source of truth for projects and experience. The resume PDF is generated from it, so the two cannot drift apart.

### Non-goals (v1)
- A blog, newsletter, comments or CMS.
- A contact form, authentication, or any backend.
- 3D, WebGL, particle effects, custom cursors, smooth-scroll libraries.
- Analytics dashboards. (Optional privacy-respecting page counts are P2, off by default.)
- Multi-language UI. Hindi appears only as proper nouns (for example *सुनवाई*).

## 3. Audience

| Persona | Arrives from | Wants | Design implication |
|---|---|---|---|
| **Recruiter or hiring manager (primary)**, entry-level software, data and IoT roles in India | Link in a resume, LinkedIn or an application form, usually on a phone | Role fit, proof it is real, contact, resume | Home answers all four without scrolling past three screens. Resume one tap away. |
| **Engineer or interviewer** | Same, or GitHub | Depth: what he built, why, what broke | Case studies with architecture, trade-offs and "what I'd change" |
| **Peer or maintainer** | GitHub, community events | Links, a way to reach him | Plain links and a mailto, no gate |

Context that shapes priorities: Avneesh is actively searching for entry-level roles and internships. The resume page and the case studies are therefore more important than anything decorative.

## 4. Success criteria

These are targets I set, not measured benchmarks. They are checked in CI or by the owner.

| Area | Target | How it is checked |
|---|---|---|
| Performance | Lighthouse (mobile) ≥ 98 in all four categories; LCP ≤ 1.2 s; CLS = 0; INP ≤ 100 ms | Lighthouse CI on every PR |
| Weight | ≤ 12 KB gzipped JavaScript on `/`; ≤ 20 KB gzipped HTML+CSS; fonts ≤ 90 KB for the Latin subset used on `/` | Budget file in CI |
| Accessibility | 0 serious or critical axe violations on every route; full keyboard path through every feature; works at 200% zoom and 320 px width | Playwright + axe, manual keyboard run |
| Integrity | 0 numbers without evidence; 0 stack claims that disagree with the repo; 0 dead links | Build-time checks (doc 03 §6) |
| Comprehension | 3 of 3 people shown the home page for 15 seconds can state what he builds | Owner runs the test before launch |
| Contact | A first-time visitor finds the email address in ≤ 5 seconds | Same test |

## 5. Content inventory and sources

**Sources of truth, in order:** (1) the repository itself (`package.json`, `requirements.txt`, README), (2) the live URL, (3) the base resume, (4) the GitHub profile README. If sources disagree, the higher one wins and the lower one is fixed by the owner. The agent MUST NOT silently pick a side. It records the conflict in `docs/CONTENT-DECISIONS.md` and asks.

**Blocking issues:** doc 00 §2 lists 13 contradictions and unverifiable claims. Phase 0 MUST close issues 1–4, 6–9 and 10 before any production deploy. Issues 5, 11, 12 and 13 are owner-side edits that do not block the build.

### Projects (content collection `projects`)

| Slug | Tier at launch | Source of the one-line description | Must disclose |
|---|---|---|---|
| `sunwai` | Case study | Repo README | Demo runs on synthetic data. Built against an external brief (name the event only if the owner confirms). |
| `parkyspot` | Case study | Repo README | State whether the live demo shows real-time updates (doc 00 issue 7). Show hardware photo or recording if available. |
| `monastery360` | Case study | Repo README | Stack taken from `package.json` only. |
| `goboxd` | Case study **only if** authorship is confirmed | Repo README | The owner's actual contribution, in one sentence. |
| `iescp-v2` | List entry (case study if issue 1 is resolved and the owner wants one) | Repo README | Real stack. |
| `finscope`, `mnist-digit-recognition`, `terminal-error-sound`, `imdb-top-series-tracker` | "Also built" list entries, no pages | Repo README | — |

Candidates the owner may add: the freelance gaming café booking app (needs the client's written permission and must not expose client data), room-rental finder for MITS students, GuideSync (academic project; low priority).

### Experience (content collection `experience`)

Taken from the resume. Maximum two lines each on the site; full bullets on `/resume`.

| Role | Organisation | Dates (per resume) |
|---|---|---|
| Freelance full-stack developer and open-source contributor | Self-employed, remote | Jul 2026 – present |
| Data analytics and management intern | Codec Technologies | Mar – Jun 2026 |
| Technical Head (led a 500+ member technical community) | Sundarbans House, IIT Madras BS programme | Sep 2025 – Sep 2026 (ended: use past tense) |
| Research intern, renewable energy analytics | MITS Gwalior | Jun – Oct 2025 |
| Assistant Head Coordinator, NPTEL (100+ students) | IoT department, MITS Gwalior | Jul 2023 – Jun 2025 |

### Education

B.Tech in IoT, MITS Gwalior (2022–2026). BS in Data Science and Applications, IIT Madras (ongoing). Senior secondary, Jawahar Navodaya Vidyalaya, Bhind. CGPA appears only on `/resume`.

### Do not publish
Phone number. Any client data. Any metric without evidence. Any technology you cannot point to in a repository.

## 6. Information architecture

```
/                    Home
/work                All projects (case studies + "Also built")
/work/[slug]         Case study (3–4 at launch)
/resume              HTML resume; /resume.pdf generated at build
/colophon            How the site is built, honestly
/404
```

No other routes at launch. Global navigation is a single line of text links in the header: **Work**, **Resume**, and a ⌘K hint on devices with a keyboard. On narrow screens the same links wrap and no hamburger menu is used.

## 7. Page specifications

### 7.1 Home `/`
Purpose: answer "what does he build, is it real, how do I reach him".

Content, in order:
1. Name (h1) and one-line descriptor.
2. The signal figure (F2), full column width.
3. Introduction: three sentences maximum.
4. Selected work: 4–5 rows (title, one line, year; stack and status in the margin on wide screens, below the row on narrow). Each row links to its case study or, for list entries, to the repository.
5. Experience: 5 rows, two lines each, dates in the margin.
6. Contact: email address as text, a copy button (F8), GitHub, LinkedIn, X. Resume link.

States and acceptance:
- **No JS:** all content readable, the figure is a static inline SVG, no console errors.
- **Reduced motion:** no entrance sequence, the figure is already settled.
- **First paint** shows the name and descriptor without any layout shift when the figure initialises (its box is reserved).

### 7.2 Work index `/work`
All projects as rows, grouped by tier with plain headings: no heading above the case-study group, then "Also built" (sentence case). No filters, no tags UI, no search box (the palette covers it).

### 7.3 Case study `/work/[slug]`
Template (headings are prose, not numbered, because the content is not a sequence):
1. Title, one-sentence summary, year, role, links (live, repository).
2. **Status line** stating plainly what is real and what is not (for example "Demo data is synthetic").
3. *What it does* (≤ 80 words).
4. *The constraint that shaped it* (≤ 120 words): the one decision a reader could disagree with, and why.
5. *How it works*: an inline SVG architecture diagram (hand-drawn in the site's own style, max 8 boxes) with a caption.
6. *What I built* (what is his work, not the team's, not the framework's).
7. *What I'd change* (at least one real shortcoming).
8. Evidence: every metric is a labelled link (test log, notebook, script, screenshot).

Acceptance: an engineer can finish reading in under three minutes; every claim links to evidence or is qualitative.

### 7.4 Resume `/resume`
Rendered from the `experience`, `projects` and `profile` collections. Print stylesheet produces a clean A4 single page. `/resume.pdf` is generated at build by printing this page. Acceptance: PDF text is selectable, passes an ATS-style text extraction (no tables for layout, no text in images), and file size ≤ 200 KB.

### 7.5 Colophon `/colophon`
Short, honest: stack, fonts, the figure's one-paragraph explanation (including that it is a simulation, with the formula), hosting, source link. No self-congratulation.

### 7.6 404
One sentence saying the page does not exist, links to Home and Work. The signal figure is not repeated.

## 8. Features

Priority: **P0** blocks launch, **P1** should ship, **P2** after launch.

| ID | Feature | Pri | Acceptance criteria |
|---|---|---|---|
| F1 | Home | P0 | §7.1 |
| F2 | Signal figure | P0 | See below |
| F3 | Work index and case studies | P0 | §7.2, §7.3 |
| F4 | Resume page and PDF | P0 | §7.4 |
| F5 | Command palette | P1 | See below |
| F6 | Theme (system default plus toggle) | P0 | See below |
| F7 | Page transitions and prefetch | P1 | See below |
| F8 | Contact and copy email | P0 | See below |
| F9 | SEO, social previews, structured data | P0 | See below |
| F10 | GitHub sync and claims ledger | P0 | Doc 03 §6 |
| F11 | Colophon | P2 | §7.5 |
| F12 | 404 | P1 | §7.6 |
| F13 | Privacy-respecting page counts | P2 | Off by default; no cookies; owner opt-in |

**F2 Signal figure.** Detailed spec in doc 02 §8 and model in doc 03 §8. Acceptance:
- On load the raw noisy trace is visible and a filtered line settles over it in about 1.2 s, once.
- Pointer movement over the figure injects local noise that decays and is re-filtered. Keyboard: arrow keys move a probe, Enter injects a burst, Esc resets.
- The SNR readout (dB) is computed from the same model that draws the lines.
- It pauses when off-screen or when the tab is hidden, and is fully static under reduced motion.
- Without JS, or when rendering fails, a build-time SVG of the settled state is shown.
- Frame time stays under 4 ms on a mid-range phone while animating (measured in the Performance panel).

**F5 Command palette.** `⌘K` / `Ctrl K` opens a native `<dialog>`. Lists pages and projects, filters as you type, arrow keys and Enter work, Esc closes and returns focus to the previous element. Opens in ≤ 150 ms with no layout shift. If JS is unavailable, the header and footer links cover the same destinations.

**F6 Theme.** Follows `prefers-color-scheme`. A toggle in the footer sets light, dark or system and persists the choice. No flash of the wrong theme on load. Transitions are suppressed during the switch. Storage access is wrapped in try/catch and the page works when storage is unavailable.

**F7 Transitions and prefetch.** Cross-document View Transitions: a short opacity crossfade between routes. Speculation rules prefetch same-site links on hover or intent. Both are progressive enhancement and the site works identically without them.

**F8 Contact and copy email.** The address is shown as text (so it can be read and selected). A button copies it, and the icon crossfades from copy to check for the confirmation, with an accessible live-region message. No toast, no form.

**F9 SEO.** Unique `<title>` and meta description per page, canonical URLs, sitemap, `robots.txt`, JSON-LD `Person` with `sameAs` links (GitHub, LinkedIn, X), 1200×630 OG image generated per page at build.

## 9. Non-functional requirements

| Area | Requirement |
|---|---|
| Browsers | Last two versions of Chrome, Safari, Firefox and Edge. Features without universal support (View Transitions, speculation rules) are progressive enhancement. |
| Devices | 320 px to 2560 px wide. Tested on a real mid-range Android phone and an iPhone. |
| Accessibility | WCAG 2.2 AA. Visible focus on every interactive element. Touch targets ≥ 44 × 44 px. Skip link. Landmarks. Reduced motion respected. Colour contrast verified by script (doc 02 §3). |
| Privacy | No third-party requests at runtime. Fonts self-hosted. No cookies. No tracking by default. |
| Security | Strict Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. No secrets in the client bundle. |
| Language | `lang="en-IN"` on the document. Hindi strings wrapped in `lang="hi"` and set in Plex Sans Devanagari. |
| Resilience | Every page works with JS disabled. The build does not depend on the GitHub API being up (committed snapshot fallback). |
| Maintainability | One token file, one content folder, no content in components. A new project is a new MDX file and nothing else. |

## 10. Copy deck (draft, owner to confirm)

Voice: plain, specific, first person, sentence case. Every sentence below is supported by the resume or a repository. Items marked ⚑ need the owner's confirmation.

- **Descriptor:** Software engineer working across IoT, data and the web.
- **Intro:** I'm finishing a B.Tech in IoT at MITS Gwalior ⚑ and a BS in Data Science at IIT Madras. I build things that take readings from the physical world or from public data and turn them into something people can act on. I freelance as a full-stack developer and previously led a 500-member technical community.
- **SUNWAI:** Turns multilingual citizen requests into evidence-backed investment decisions. The demo runs on synthetic data.
- **ParkySpot:** ESP32 sensors report whether each parking bay is free, and a live map handles booking. ⚑ confirm real-time behaviour of the live demo.
- **Monastery360:** Virtual tours, audio guides and a map for Buddhist monasteries.
- **IESCP-V2:** A platform where sponsors and influencers coordinate campaigns and ad requests.
- **Contact line:** avneeshsingh.job@gmail.com, then GitHub, LinkedIn, X.
- **404:** That page doesn't exist.

Writing rules are in doc 02 §9.

## 11. Delivery phases and definition of done

| Phase | Scope | Done when |
|---|---|---|
| **0 · Truth** | Run GitHub sync, resolve doc 00 issues, fill `profile`, `experience`, `projects` data, decide name and domain | `check-claims` passes; `docs/CONTENT-DECISIONS.md` lists every conflict and its resolution |
| **1 · Chassis** | Scaffold, tokens, fonts, base layout, theme, CI gates, preview deploys | Empty pages deploy; all gates run green; contrast script passes |
| **2 · Pages** | Home, work index, resume, 404 from real content | Pages meet §7 with no JS |
| **3 · Figure** | F2 end to end including tests | All F2 acceptance items pass on a real phone |
| **4 · Navigation** | Palette, transitions, prefetch, OG images, JSON-LD | F5, F7, F9 acceptance |
| **5 · Case studies** | 3–4 case studies with diagrams | Each passes the §7.3 read-time and evidence tests |
| **6 · Hardening** | Accessibility, budgets, headers, cross-browser and real-device pass, anti-slop checklist | Doc 02 §10 and §11 fully ticked |
| **7 · Launch** | Domain, redirects, GitHub profile README cut down, resume PDF swapped for the generated one | Live site passes the comprehension and contact tests |

Each phase ends with a short written note in `docs/BUILD-LOG.md`: what changed, what was verified and how, what was not verified.

## 12. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Content conflicts stay unresolved and get published | Medium | Build fails on unevidenced numbers; Phase 0 gate |
| Case study copy sounds generic | Medium | Template forces "constraint" and "what I'd change"; owner reviews |
| Signal figure becomes a gimmick | Low | One orchestrated moment only; static after settle; removable without touching the layout |
| Third-party skills push the agent toward a "bold" look that breaks the brief | Medium | Precedence rule in doc 04 §2 |
| Newer majors (Astro 7, TypeScript 7, Vite 8) differ from the agent's training | High | Doc 03 §3 requires reading current docs and pinning what actually builds |

## 13. Open questions for the owner

1. Public name: "Avneesh Singh" or "Avneesh Singh Rajpoot"?
2. Do you own `0xasr.dev`, and what is on it now?
3. Which project is the lead: SUNWAI, or something else?
4. Is goboxd yours, a fork, or a team repo?
5. Do you have a client's permission to show the café booking app?
6. Do you have a photo or short recording of the ParkySpot hardware?
7. Which email do you want public?
