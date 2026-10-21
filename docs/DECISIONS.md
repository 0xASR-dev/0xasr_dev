# Decisions

## Initial project decisions

- Framework: Astro static site generation (`output: static`), as required by doc 03.
- Package manager: pnpm, with a committed lockfile.
- Styling: hand-written CSS tokens and progressive enhancement; no new framework dependency added at this stage.
- Motion: CSS-driven, reduced-motion-aware, intentionally minimal.
- Content source of truth: repo-backed profile, experience, and project files under `src/content`.

## Version notes

- Exact pinning is tracked in `package.json` and the lockfile.
- Fresh dependency versions are not adopted without checking the current docs and the 14-day rule described in doc 03 §3.2.

## Open content questions

- Canonical domain is still unresolved and should be confirmed by the owner.
- ParkySpot live/demo status remains to be confirmed.
- SUNWAI and IESCP-V2 stack and disclosure details remain to be verified from the repository or owner.
