# visual-review-scope

Status: in progress
Branch: dev
Created: 2026-09-26

## Goal

Give `tooling/visual-review` a capture scope that matches a manual, one-edition-at-a-time
review workflow, and remove its hand-duplicated copy of the publication table.

## Context

- `tooling/visual-review` is entirely uncommitted: 15 new files (752 lines) plus 4 modified
  root files (`.gitignore`, `docs/development.md`, `package.json`, `pnpm-lock.yaml`).
- It currently reviews all four publications by default: 107 discovered routes (calls-2026 = 1,
  festival-2023 = 97, festival-2024 = 7, festival-2025 = 2) = 963 PNGs per run. Unusable for
  manual review, and 106 of the 107 routes are historical.
- Its app table in `src/config.mjs` duplicates `id`, `packageName` and `base` from
  `editions.config.ts`, which is the real single source of truth (consumed by the distribution
  build, the four app navbars, and the publication e2e spec).
- Plain `node` cannot import `editions.config.ts`. Cause: `packages/editions/src/index.ts:17`
  uses a TypeScript parameter property, rejected by strip-only type stripping
  (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`). It is the only non-erasable construct in that file.
  Replacing it with an explicit `readonly` field was verified in a `/tmp` replica: plain `node`
  then imports the full chain and resolves `active = calls-2026`, digest `e7e32dd23bd02b56`.

## Decisions (user-approved)

1. Default scope = the active publication and its subroutes only.
2. `--app` selects exactly one publication; passing more than one is an error. `--app` replaces
   the default (already the behavior of `resolveApps`). `--browser` stays repeatable.
3. Every run wipes the whole screenshot folder (`output/playwright`) and nothing else; `dist`,
   `.output` and repository sources are untouched. The wipe runs after build + route discovery
   succeed so a failed build cannot destroy the previous review set.
4. Flat per-route directory naming stays. One directory per route holds every viewport/browser
   variant (`desktop-chromium.png`, `desktop-firefox.png`, ...) for side-by-side manual
   comparison. Nested route mirroring was proposed and explicitly rejected.
5. Publication facts (`id`, `packageName`, `base`) are derived from `editions.config.ts`.
   Tool mechanics (`directory`, `outputDirectory`, `buildCommand`, `previewCommand`) stay local,
   indexed by publication id. Normalize the archive `base` to a trailing slash; the active
   publication has no `base` and resolves to `/`.
6. `packages/editions` is made importable by plain Node rather than adding `vite-node`/`vitest`
   to the tool. Keeps the tool dependency-free and its `node --test` runner unchanged.

## Out of scope (recorded follow-ups)

- Per-route capture resilience: a single navigation failure currently aborts the remaining
  routes and browsers of the run (`src/capture.mjs` has no per-browser/per-route catch). With a
  97-route app this is the highest-value remaining defect.
- Silent overwrite guard for sanitized route names. Zero collisions exist in the real
  inventory (107 routes -> 107 distinct directories, verified), but 23 of festival-2023's 97
  routes carry accents and are deformed by `sanitizeRoute`.
- WebKit on Arch Linux: blocked by 22 missing host sonames. All obtainable via `yay`
  (8 repo packages + `icu74` + `playwright-webkit-flite-deps` from AUR), because Arch's `flite`
  package does not ship 6 of the 13 voice sonames the bundle requires.
- Port allocation race and the any-HTTP-status readiness check in `src/runner.mjs`.

## Tasks

- [x] **T1 — Commit the tool as it stands.**
  Acceptance: `pnpm --filter @festivalarc/visual-review test` is 12/12 green; the staged set is
  exactly the 15 tool files plus the 4 modified root files (no `node_modules`, verified ignored
  by `.gitignore:8`); one Conventional Commit on `dev`.
  Surfaces: `tooling/visual-review/**`, `.gitignore`, `docs/development.md`, `package.json`,
  `pnpm-lock.yaml`.

- [x] **T2 — Make `packages/editions` importable by plain Node.**
  Acceptance: the parameter property at `packages/editions/src/index.ts:17` becomes an explicit
  `readonly` field with identical behavior; `pnpm --filter @festivalarc/editions test` and
  `type` green; plain `node` imports `editions.config.ts` without any loader; full `pnpm build`
  green.
  Surfaces: `packages/editions/src/index.ts`.

- [ ] **T3 — Derive the app table and default to the active publication.**
  Acceptance, tests written first and failing before the change:
  (a) no `--app` resolves exactly one app, the active one from `editions.config.ts`;
  (b) two `--app` values throw;
  (c) the derived table matches the publication config for all four publications;
  (d) a run wipes `output/playwright` in full and leaves every other path untouched.
  Surfaces: `tooling/visual-review/src/**`, `tooling/visual-review/test/**`.

- [ ] **T4 — End-to-end verification of T3.**
  Acceptance: real `pnpm visual:capture -- --app calls-2026 --browser chromium` produces 3
  non-empty PNGs under `output/playwright/calls-2026/`, a prior run's images of another
  publication are gone, `git status` shows no tracked file changed besides the intended edits,
  and `pnpm build` is green.

## Commit plan (one work unit per task)

| Task | Intended message |
| --- | --- |
| T1 | `feat(tooling): add visual review screenshot tool` |
| T2 | `refactor(editions): make publication config importable by plain node` |
| T3 | `feat(visual-review): scope captures to the active publication` |

## Evidence

Commit identities are recorded here as each task closes.

| Task | Commit | Notes |
| --- | --- | --- |
| T1 | `b2ca6c4` | tool commit (16 files, 821 insertions); plan commit `85b436a` precedes it; 12/12 tests green at commit time |
| T2 | `b2ca6c4` + T2 | parameter property → readonly field; editions 12/12 tests pass; `pnpm build` green; plain node imports editions.config.ts with identical digest e7e32dd2; pre-existing `pnpm type` failure in festival-2024 (JSX namespace) is unrelated |
| T3 | pending | |
