# 02 · UX and Design System

Applies to: the portfolio described in doc 01.
Rule for the agent: **every visual value comes from a token in §3–§7. If a value is not a token, add the token first, with a reason, then use it.** Never hardcode a colour, size, duration or easing in a component.

---

## 1. Design thesis

The subject is an engineer whose work starts at a sensor or a dataset and ends at a decision someone can act on. His research internship was noise filtering and signal processing on sensor data. His ParkySpot project had the same problem on a breadboard.

So the one memorable thing is a **signal that settles**: a noisy trace on load, and a clean line that resolves over it. Everything else is deliberately quiet: one column of text, one typeface family, neutral paper and ink, one accent. The page borrows its restraint from emilkowal.ski (text lists, no cards) and its way of putting small notes in the margin and numbers from a real model from Anatomy. It does not borrow their fonts, colours or layouts.

Boldness is spent in exactly one place (the figure). The rest follows the Chanel rule: before shipping, remove one accessory.

## 2. Principles

1. **Content is the interface.** Words, links and a list. If a component does not carry information, remove it.
2. **Structure encodes meaning.** Rules, borders, dates, numbers and margin notes exist because they tell the reader something. No decorative dividers, no numbering unless the content is a sequence.
3. **Motion answers a person, or does one deliberate thing.** The first-load sequence is the one deliberate thing. Everything else moves only in response to an action, and anything seen many times a day does not move.
4. **True numbers only.** Every number on the page is computed, measured, or linked to its evidence.
5. **Specific beats clever.** Name things by what a reader understands. No slogans.
6. **Quality floor, not a feature.** Keyboard, focus, reduced motion, contrast, 320 px width, no-JS: always on, never announced.

## 3. Colour

One neutral pair and one accent. No gradients, no tints on surfaces, no translucent washes.

### 3.1 Tokens

```css
@layer tokens {
  :root {
    color-scheme: light dark;

    /* light */
    --paper:     #F9F9F8;  /* page background */
    --ink:       #1F2328;  /* body text, headings */
    --ink-muted: #5B6169;  /* secondary text, margin notes */
    --ink-faint: #8A9099;  /* non-text marks only: raw trace, hairlines that carry meaning */
    --rule:      #E4E4E1;  /* decorative separators only */
    --accent:    #2347D0;  /* the signal line, focus ring, link hover, selection */
  }

  :root[data-theme="dark"] {
    --paper:     #17191C;
    --ink:       #E8E9EA;
    --ink-muted: #9A9FA6;
    --ink-faint: #6F757C;
    --rule:      #2A2D31;
    --accent:    #8EA2FF;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --paper:     #17191C;
      --ink:       #E8E9EA;
      --ink-muted: #9A9FA6;
      --ink-faint: #6F757C;
      --rule:      #2A2D31;
      --accent:    #8EA2FF;
    }
  }
}
```

### 3.2 Contrast (computed with the WCAG 2.x formula, 21 Oct 2026)

| Pair | Light | Dark | Allowed use |
|---|---|---|---|
| `--ink` on `--paper` | 15.00 | 14.49 | All text |
| `--ink-muted` on `--paper` | 5.93 | 6.61 | All text, including small |
| `--accent` on `--paper` | 6.91 | 7.35 | Text and graphics |
| `--ink-faint` on `--paper` | 3.05 | 3.78 | **Graphics only** (never body text; large text ≥ 24 px only) |
| `--rule` on `--paper` | 1.21 | 1.27 | Decorative only; never the only cue |

`scripts/check-contrast.ts` recomputes these from the token file on every build and fails if any "text" pair drops under 4.5 or a "graphics" pair under 3.0. If the owner changes a colour, this script is the judge.

### 3.3 Accent budget

The accent appears in **four** places and nowhere else: the filtered signal line, the focus ring, link hover and active state, and text selection (`::selection` at 20% accent over paper). If a fifth use appears, it fails review.

## 4. Typography

Typography is the personality of the page, so the choices are deliberate.

**Family:** IBM Plex Sans Variable for everything. Why: it is an engineering typeface with a distinct character (not a default grotesk), it has a matching Devanagari companion (needed for *सुनवाई* and any Hindi text), and a monospace sibling for real code.
**Devanagari:** IBM Plex Sans Devanagari, loaded only on pages that contain Devanagari (via `unicode-range`).
**Monospace:** IBM Plex Mono, used **only** for code blocks and the figure's numeric readout. Never for decorative labels.

```css
@layer tokens {
  :root {
    --font-sans: "IBM Plex Sans Variable", "IBM Plex Sans", system-ui, sans-serif;
    --font-deva: "IBM Plex Sans Devanagari", "Noto Sans Devanagari", system-ui, sans-serif;
    --font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

    --step--1: 0.8125rem;                               /* 13px: margin notes */
    --step-0:  1.0625rem;                               /* 17px: body */
    --step-1:  1.25rem;                                 /* 20px: row titles, h3 */
    --step-2:  1.5rem;                                  /* 24px: h2 */
    --step-3:  clamp(2rem, 1.5rem + 2.2vw, 3rem);       /* name, h1 */

    --lh-body: 1.6;
    --lh-head: 1.2;
    --measure: 62ch;                                    /* hard maximum line length */
  }
}
```

Rules:
- Weights: 400 body, 500 headings and row titles, 600 only inside prose emphasis. Nothing heavier.
- h1 letter-spacing −0.02em; everything else 0. No tracking on any text.
- `text-wrap: balance` on headings; `text-wrap: pretty` on paragraphs.
- `font-variant-numeric: tabular-nums` on dates, years and the readout.
- Sentence case everywhere. **No all-caps, no small caps, no eyebrow labels.**
- Never accent one word of a heading with colour, italics or weight.
- `font-display: swap`, preload only the Latin regular variable file. Subset Latin; Devanagari separate.
- Hindi spans carry `lang="hi"`.

## 5. Layout and spacing

### 5.1 Spacing scale (4 px base)

```css
--space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
--space-5: 1.5rem;   --space-6: 2rem;    --space-7: 3rem;    --space-8: 4rem;
--space-9: 6rem;     --space-10: 8rem;
```

### 5.2 Grid

One content column and a margin for notes. The composition is centred in the viewport; text inside is **left-aligned** (never centred, never justified).

```css
--col:    40rem;   /* content column */
--gap:    2rem;
--margin: 13rem;   /* marginalia */
--bp-wide: 60rem;  /* margin notes sit beside rows at and above this width */
```

Below `--bp-wide` the margin notes move under their row in `--ink-muted` at `--step--1`. There is no hamburger menu at any width.

Vertical rhythm between home blocks: `--space-8` on narrow screens, `--space-9` on wide. Rows inside a list: `--space-5`.

### 5.3 Wireframes (desktop ≥ 60rem; years and stack notes are illustrative, real values come from content)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Avneesh Singh                                  Work  Resume  ⌘K     │
│                                                                      │
│  Avneesh Singh                                                       │
│  Software engineer working across IoT, data and the web.             │
│                                                                      │
│  ~~~~~/\/\~~~~\_/\/~~~~~~~~~/\~~~~~   (signal figure)    12.0 dB     │
│                                                                      │
│  I'm finishing a B.Tech in IoT at MITS Gwalior and a BS in           │
│  Data Science at IIT Madras. I build things that ...                 │
│                                                                      │
│  Work                                                                │
│  SUNWAI                                              2026   Python   │
│  Turns multilingual citizen requests into ...                FastAPI │
│                                                                      │
│  ParkySpot                                           2025   ESP32    │
│  ESP32 sensors report whether each bay is free ...           Flask   │
│  ...                                                                 │
│                                                                      │
│  Experience                                                          │
│  Freelance full-stack developer                  Jul 2026 –          │
│  Gaming café booking app for a client ...                present    │
│  ...                                                                 │
│                                                                      │
│  Contact                                                             │
│  avneeshsingh.job@gmail.com  [copy]                                  │
│  GitHub  LinkedIn  X  Resume                                         │
│                                                                      │
│  Light  Dark  System                          Colophon  Source       │
└──────────────────────────────────────────────────────────────────────┘
```

Mobile (< 60rem): same order, one column, margin notes under each row, header links wrap onto a second line if needed, figure height 72 px.

The header's left "Avneesh Singh" is a link home; the h1 on the home page is the visible name. On the home page the header name is visually hidden to avoid saying it twice.

Case study layout:

```
  ← Work                                        (text link)
  SUNWAI
  One-sentence summary.
  2026 · role · Live · Repository                (links, no arrows)
  Status: demo data is synthetic.                (always first)

  What it does
  The constraint that shaped it
  How it works          [inline SVG diagram + caption]
  What I built
  What I'd change
  Evidence              (labelled links)
```

(The "←" in the back link is allowed because it navigates *backwards*; the template-chrome rule only bans arrows appended to forward links.)

## 6. Surfaces and components

### 6.1 Radius, borders, shadow, images

```css
--radius-sm: 4px;    /* kbd, inline code */
--radius-md: 8px;    /* images, code blocks */
--radius-lg: 14px;   /* command palette (outer) */
```

- **Nested radius = outer − padding.** The palette has 14 px outer radius and 8 px padding, so its items use 6 px (`--radius-item: calc(var(--radius-lg) - var(--space-2))`).
- **Borders for structure, shadows for elevation.** Only the palette floats, so it is the only thing with a shadow, and it uses two layered transparent shadows (no single grey drop shadow). Everything else is flat with at most a 1 px `--rule` where a boundary carries meaning.
- **Images** get a 1 px outline inset by 1 px in pure black or white at 10%: `outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px;` light, `oklch(1 0 0 / 0.1)` dark. Never a tinted or accent outline.
- Where a border sits under a shadow ring, keep `border: 1px solid transparent` so forced-colors mode still draws an edge.

### 6.2 Component specs

| Component | Spec |
|---|---|
| **Link** | Inherits ink. Underline 1 px, `text-underline-offset: 0.2em`, `text-decoration-color: var(--ink-faint)`. Hover and `:active`: colour and underline colour to `--accent`, 120 ms. No arrow glyph, no icon on external links. Same-tab by default; if `target="_blank"` is unavoidable add `rel="noopener"` and a visually hidden "(opens in a new tab)". |
| **Row** (work, experience) | Title (`--step-1`, 500) link, one line of `--ink-muted` description, margin notes (`--step--1`, `--ink-muted`). The title link has a stretched `::after` so the whole row is the hit area, min height 44 px. Hover (hover-capable pointers only): title to `--accent` in 120 ms. No background, no lift, no border. |
| **Button** (copy email, theme options) | Text button, min 44 × 44 px target, underline like a link. `:active` scale 0.97 over 150 ms ease-out; a disabled button never scales. |
| **Copy email** | Icon crossfades copy → check on success (scale 0.25 → 1, opacity 0 → 1, blur 4 px → 0, 300 ms, `--ease-out`), reverts after 2 s. A visually hidden `role="status"` region says "Email copied." Failure says "Couldn't copy. Select the address instead." |
| **Theme control** | Three text options (Light, Dark, System) as a radio group in the footer. Current option is `aria-checked`, underlined, not coloured. |
| **kbd hint** | `⌘K` / `Ctrl K` in `--step--1`, 1 px `--rule` border, `--radius-sm`, shown only when a physical keyboard is likely (`@media (hover: hover) and (pointer: fine)`). |
| **Command palette** | See §6.3. |
| **Prose** (case studies) | `max-width: var(--measure)`. h2 `--step-2` weight 500, no h3 numbering. Lists use real bullets only for unordered sets; ordered lists only for real steps. Blockquote: left rule 1 px `--ink-faint`, no italics. |
| **Code block** | Shiki with CSS variables for both themes mapped onto the tokens. `--radius-md`, 1 px `--rule` border, padding `--space-4`, horizontal scroll with `tabindex="0"` and a visible focus ring. Mono at 0.9em. No copy button, no language badge, no line numbers unless referenced in the text. |
| **Diagram** | Inline SVG. Strokes `currentColor` at 1 px, fills `--paper` or none, one accent element for the thing the caption talks about. Max 8 boxes. Text is outside the drawing (caption below) except short names inside boxes at `--step--1`. |
| **Footer** | Theme control, Colophon, Source. Nothing else. |
| **Skip link** | First focusable element, visually hidden until focused, then shown top-left with the same link styling. |

**Focus:** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` on every interactive element. Never remove it, never rely on colour alone (the offset ring is the cue).

### 6.3 Command palette

- Trigger: `⌘K` / `Ctrl K` anywhere; also a "Search" text button in the header for touch and mouse.
- Element: native `<dialog>` opened with `showModal()` (gives focus trapping, Esc, inert background, top layer).
- Anatomy: a text input (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`), a `role="listbox"` of options, a visually hidden live region announcing "N results".
- Content: pages (Home, Work, Resume, Colophon) and projects (title plus one-line summary). Static index generated at build.
- Matching: case-insensitive, matches title first then summary and stack. No fuzzy library (the index is about 15 items).
- Keys: ↑ ↓ move, Enter opens, Esc closes and returns focus to the element that opened it. Typing never moves focus out of the input.
- Layout: width `min(34rem, calc(100vw - 2rem))`, top offset 12 vh, outer `--radius-lg`, padding `--space-2`, items `--radius-item`, item min height 44 px.
- Empty state: "No match for “query”. Try a project name." (Direction, not mood.)
- Motion: see §7.

## 7. Motion

### 7.1 Tokens

```css
@layer tokens {
  :root {
    --ease-out: cubic-bezier(0.2, 0, 0, 1);
    --dur-fast:  120ms;   /* colour changes on hover */
    --dur-press: 150ms;   /* press scale */
    --dur-base:  180ms;   /* palette enter */
    --dur-exit:  120ms;   /* palette exit; exits are shorter than enters */
    --dur-enter: 300ms;   /* hero sequence items, icon crossfade */
    --press-scale: 0.97;
    --stagger: 100ms;
  }
}
```

`--press-scale` is **0.97** site-wide (the value in Emil Kowalski's "7 Practical Animation Tips"). The `better-ui` skill prescribes 0.96 for the same detail. Pick one per site; this site picks 0.97. Do not mix.

### 7.2 Rules (each is testable)

1. **Frequency.** If an interaction can happen more than about 100 times a day (row hover, theme control, palette arrow keys, link clicks), it gets no animation, or a colour/opacity change of 150 ms or less.
2. **Easing.** `--ease-out` for anything entering or exiting. Never `ease-in`, never browser `ease-in-out` for UI.
3. **Duration.** UI motion stays at or under 300 ms. The only exception is the hero figure's settle (1200 ms, once).
4. **Start values.** Nothing scales from 0. The palette starts at `scale(0.97)`.
5. **Origin.** The palette scales from top centre (where it appears), not from the element centre.
6. **Properties.** Transition only named properties (`transition-property: color, opacity`), never `all`. Animate `transform`, `opacity` and `filter`, not layout properties. Add `will-change` only after seeing first-frame stutter, naming the property.
7. **Interruptible.** Interactive state uses CSS transitions (they retarget when reversed), not keyframes. Keyframes only for sequences that run once.
8. **Reduced motion.** Under `prefers-reduced-motion: reduce`, replace movement, scale and blur with an opacity crossfade (not an instant swap). The hero sequence does not run and the figure is already settled. Interaction still works.
9. **Hover.** All hover-only styles sit inside `@media (hover: hover)` so touch does not latch a hover state.
10. **Theme switch.** Disable all transitions for the switch, force a style flush, restore on the next frame.
11. **Static cue.** Every animated state change also has a static cue (colour, icon or label). Motion is never the only feedback.
12. **Scroll.** No scroll-linked effects, no reveal-on-scroll, no smooth-scroll library, no scroll hijacking. Native scrolling only.

### 7.3 What moves and what does not

| Element | Motion | Spec |
|---|---|---|
| Hero on first visit in a session | One sequence | Name, descriptor, figure box enter in that order, `--stagger` apart: opacity 0 → 1, `translateY(12px)` → 0, blur 4 px → 0, `--dur-enter`, `--ease-out`. Figure settle starts 300 ms after the box appears. Intro, Work, Experience, Contact do **not** animate. Skipped on later Home visits in the same session (guarded `sessionStorage`; if unavailable, it runs). |
| Signal figure | Settle once, then reacts to the pointer | §8 |
| Route change | Opacity crossfade, 150 ms | Cross-document view transition on `root`; no slide, no shared-element morph. |
| Palette open / close | Opacity and scale | In: opacity 0 → 1, scale 0.97 → 1, `--dur-base`. Out: `--dur-exit`, no translate. Uses `@starting-style` and `transition-behavior: allow-discrete` so the `<dialog>` can animate. |
| Copy icon | Crossfade | Spec in §6.2. |
| Link and row hover | Colour only | `--dur-fast`, hover-capable pointers only. |
| Button press | Scale | `--press-scale`, `--dur-press`. |
| Everything else | None | Case study prose, lists, images, footer, theme control, headings. |

## 8. Signal figure (hero)

### 8.1 Concept
A simulated sensor signal with noise added, and a filter that removes the noise. It is the one place the page performs.

### 8.2 Geometry
- Width: the content column. Height: 96 px (≥ 60rem) or 72 px.
- The box is reserved in HTML (`aspect-ratio` or fixed height) so nothing shifts when it initialises.
- Canvas for the animated version; device pixel ratio capped at 1.5 (the line is thin, extra resolution buys nothing).

### 8.3 Layers, back to front
1. Hairline baseline, `--rule`.
2. **Raw trace** (signal plus noise): 1 px, `--ink-faint`.
3. **Filtered line**: 1.5 px, `--accent`. This is the only accent-coloured graphic on the page.
4. **Probe** (only while the user is interacting): 4 px circle on the filtered line, `--accent`.

### 8.4 Behaviour
- **Settle:** at t = 0.3 s after the box appears, filter strength λ rises 0 → 1 over 1.2 s with `--ease-out`. After that the figure is still. There is no idle animation and no looping.
- **Pointer:** moving over the figure injects a noise burst centred at the pointer's x position; its amplitude grows with pointer speed (capped), and it decays exponentially (time constant 0.6 s) while the filter re-cleans it. On touch, drag does the same.
- **Keyboard:** the figure is focusable (`tabindex="0"`, `role="img"`, `aria-roledescription="interactive figure"`). ←/→ move the probe, Enter or Space injects a burst at the probe, Esc resets. Focus ring per §6.2.
- **Off-screen and hidden tab:** the animation loop stops (IntersectionObserver and `visibilitychange`).
- **Reduced motion:** no settle animation; the final frame is drawn once. Pointer and keyboard still change the state, applied in a single step with no easing.
- **No JS or failed init:** the build-time SVG of the settled frame (same model, same numbers) is the content.

### 8.5 Readout
In the margin beside the figure (below it on narrow screens): "Signal-to-noise 12.0 dB" in `--font-mono`, `--step--1`, `--ink-muted`, tabular numbers. The value is computed from the model that draws the lines (formula in doc 03 §8), updated at most 10 times per second on screen. For assistive tech: `aria-label` on the figure describes it once ("Simulated sensor signal. A noisy trace is filtered into a clean line. Signal-to-noise ratio 12.0 dB."), and a polite live region announces the new value only after an interaction ends (800 ms debounce), never during animation.

### 8.6 Figure quality bar (applies to this figure and to any future project figure)
A figure ships only if all are true:
1. The object does the idea; it does not stand for it.
2. Every number on or beside it is computed by the model that moves it.
3. Exactly one accent element.
4. Text lives outside the drawing, apart from short names.
5. Every line ends on a shape, a line, or a dot (no loose leaders).
6. It stops off-screen, goes still under reduced motion, and answers the keyboard.
7. At 4× zoom, every region still has something true in it.
8. It can be deleted without changing the layout of the page.

## 9. Writing rules

Words are design content. Each element does one job.

- **Voice:** first person, plain verbs, concrete nouns, sentence case.
- **Describe, don't sell.** "ESP32 sensors report whether each bay is free" beats "an intelligent IoT parking solution".
- **Specific over clever.** No slogans, no puns, no emoji.
- **Banned words and phrases:** passionate, enthusiastic, cutting-edge, seamless, robust, leveraging, "production-ready" (unless linked to a deployment), "intelligent" (unless it is a model you can name), "Transforming raw data and hardware into…".
- **Banned patterns:** "WORD — fragment" labels with a spaced em dash, meta strings joined with middle dots (`A · B · C`), "→" appended to forward links, "Hi, I'm … 👋".
- **Actions keep one name through the flow:** the button says "Copy email", the status says "Email copied."
- **Errors and empty states give direction.** What happened and what to do. No apologies, no cuteness.
- **Numbers:** show a number only with a unit, a time or scope, and a link to its evidence.
- **Honesty lines are part of the design.** "Demo data is synthetic." is a feature.

## 10. Anti-slop checklist (run before every release)

Mark each item pass or fail in `docs/BUILD-LOG.md`. Any fail blocks release.

| # | Check | Fail if |
|---|---|---|
| 1 | Palette | A cream background with serif display and clay accent; near-black with an acid accent; or any gradient wash |
| 2 | Cards | More than one list of identical rounded cards, or any bento grid |
| 3 | Radius | One radius applied to everything instead of the three tokens |
| 4 | Shadows | Any shadow other than the palette's layered one |
| 5 | Typography | All-caps labels, eyebrows above headings, one accented word in a heading, tracked-out text |
| 6 | Numbering | Numbered markers on content that is not a sequence |
| 7 | Chrome | Spaced-em-dash labels, middle-dot meta strings, arrows on forward links, mono face on decorative labels |
| 8 | Motion | Fade-up on sections, hover transitions on every card, any scroll-linked or looping motion |
| 9 | Accent | Accent colour in a fifth place (§3.3) |
| 10 | Widgets | Typing animation, snake graph, skill-icon grid, stat badges, visitor counter |
| 11 | Copy | Any banned word (§9), any claim without evidence |
| 12 | Imagery | Stock photos, AI-generated art, decorative icons |
| 13 | Layout | Centred body text, justified text, line length over 80 characters |
| 14 | Specificity | Swap in another person's name and the page still reads fine (it should not) |

## 11. Release checklist

- [ ] Keyboard only: every feature reachable, order logical, focus always visible, no traps (palette traps focus correctly and releases it).
- [ ] Screen reader pass (VoiceOver or NVDA): landmarks, heading order, figure label, live-region messages.
- [ ] 320 px wide, 200% zoom, 400% zoom on text: no horizontal scroll except inside code blocks.
- [ ] `prefers-reduced-motion: reduce`: no movement anywhere; figure static; interactions still work.
- [ ] JS disabled: every page readable, figure fallback shown, navigation works.
- [ ] Both themes: contrast script green, no flash on load, no smear on switch.
- [ ] Touch: no stuck hover states, targets ≥ 44 px, no accidental palette open.
- [ ] Print: `/resume` prints on one A4 page, ink only, no backgrounds.
- [ ] Real devices: one mid-range Android phone, one iPhone, one desktop browser of each engine.
- [ ] Budgets and Lighthouse gates from doc 01 §4 green.
- [ ] Anti-slop checklist (§10) all pass.
