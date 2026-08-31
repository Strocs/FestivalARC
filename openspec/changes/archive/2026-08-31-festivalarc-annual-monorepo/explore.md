# Exploration: FestivalARC Annual Monorepo

## Scope

Investigate the migration surface for a pnpm workspace/Turborepo containing independent Astro applications for final editions, a temporary 2026 call application, and one static Vercel distribution. This artifact records current evidence and migration seams only; it does not commit to irreversible implementation details.

## Executive summary

The repository is currently a single Astro 5 application and needs staged extraction into independently buildable annual-edition apps plus a deterministic static distribution layer. Recovered evidence confirms the historical source references and the 2026 lifecycle policy: the calls workspace is temporary, is removed and replaced when the final festival publishes, and calls are never permanently archived. Remaining uncertainty is implementation detail—not product or source availability.

## Current repository evidence

- The repository is a single Astro 5 static-site application, not a workspace. `package.json` has one `festivalarc` package and no `pnpm-workspace.yaml`, Turborepo configuration, or workspace scripts.
- The application uses TypeScript ESM, React integration, Tailwind CSS 4, Astro sitemap, and the Vercel adapter. `astro.config.mjs` sets `output: 'static'`, `site: 'https://festivalarc.com'`, and Vercel web analytics.
- The current route entry point is `src/pages/index.astro`, which directly renders `@/features/arc2025/pages/main/MainPage.astro`. Other route entry points exist under `src/pages` but the exact route inventory must be catalogued before migration.
- The code is feature-oriented under `src/features`, with edition-specific code under `src/features/arc2025` and reusable schedule/shared code under `src/features/schedule` and `src/features/shared`.
- Shared layout metadata is currently hard-coded for Festival ARC 2025. `Layout.astro` emits absolute festival URLs, `/sitemap-index.xml`, and a 2025 Open Graph site name; these values are migration-sensitive.
- Navigation contains absolute-root links such as `href='/'`, and at least one component derives the active path from `Astro.url.pathname`. These are direct base/path-prefix coupling points.
- The existing dependency set includes Zustand, so any future interactive island extraction should preserve the detected store rather than introduce a new state library. The repository follows static-first Astro plus React islands conventions.
- Existing testing is Vitest/Testing Library plus Playwright. `pnpm build` runs `astro check && astro build`; `pnpm test` runs Vitest; `pnpm run test:e2e` runs Playwright.

## Target shape to validate during proposal/design

- Workspace orchestration should make each final edition an independently buildable Astro app: 2023, 2024, 2025, and future annual editions. Confirmed source references are ARC2023 at `https://github.com/Strocs/ARC2023`, ARC2024 at `origin/2024`, and current ARC2025 at `origin/main`. The 2026 calls workspace is temporary: when the final festival publishes, it is removed and replaced by the final 2026 edition; calls are never permanently archived.
- Shared packages should be limited to stable domain/configuration/compositor contracts and other genuinely cross-edition infrastructure. Edition-specific content, visuals, routes, and behavior should remain independently owned. Shared UI is not assumed by the recovered architecture and should not be introduced without evidence.
- A deterministic typed distribution compositor should combine one selected active-edition output at the deployment root with archived edition outputs under `/ediciones/YYYY`. Determinism requires explicit edition selection, stable ordering, collision handling, and reproducible output manifests.
- The global neutral `404.html` must be owned by the distribution layer, not accidentally by whichever edition is active. Edition outputs must not overwrite global fallback behavior.
- Routing, asset URLs, canonical URLs, sitemap locations, and internal links must be base-aware for both root publication and archived prefixes. This includes Astro `base` configuration, generated HTML, navigation, metadata, sitemap generation, and static asset references.
- Current 2025 behavior is a compatibility baseline: root routes, visual/content output, static build behavior, schedule interactions, metadata, assets, and existing tests must remain equivalent at the root after migration unless an explicitly approved product change says otherwise.

## Migration seams and reviewable slices

1. **Inventory and baseline:** capture current route/output inventory, generated asset names, metadata, sitemap, 404 behavior, build/test evidence, and representative Playwright journeys before moving files.
2. **Workspace scaffolding:** introduce pnpm workspace and Turborepo configuration without changing the 2025 application’s source behavior; make the existing app buildable as one package.
3. **Application boundary:** relocate/adapt the 2025 app into its edition package, preserving aliases, assets, route behavior, React islands, Zustand usage, and tests. Keep the first slice mechanically attributable.
4. **Shared contract extraction:** extract only proven cross-edition types/configuration and compositor interfaces. Avoid moving 2025-specific presentation or data until ownership and compatibility are clear.
5. **Additional final editions:** add 2023 and 2024 as independent app packages, then establish the future-edition template/contract. Their archives should build independently and not require the active app at runtime.
6. **Temporary 2026 calls app:** add the calls application as a separate lifecycle package with an explicit replacement/removal path. Define how its deployment is excluded or selected so temporary routes cannot leak into the final annual archive.
7. **Typed compositor:** build and test the deterministic distribution operation against fixture app outputs, including root active edition, archived prefixes, duplicate/collision policy, global `404.html`, and manifest/report output.
8. **Base-aware publication:** validate each app in its eventual prefix and at root where applicable. Cover links, assets, canonical metadata, sitemap URLs, redirects/fallbacks, and trailing-slash behavior.
9. **Single deployment integration:** wire one Vercel static deployment to build packages and compose one final output. Verify no source app’s deployment adapter assumptions leak into the composed artifact.
10. **Compatibility cutover:** compare 2025 root output and journeys against the baseline, then remove legacy single-app wiring only after the composed deployment is proven.

Slices should remain independently reviewable and should not mix edition migration, compositor semantics, and broad UI refactors in one change.

## Risks and unresolved questions

- Astro/Vercel static output conventions may differ between independently built apps; output normalization and ownership of generated assets must be specified before compositor implementation.
- Root-relative links and assets are likely to work for the current root app but fail under `/ediciones/YYYY`; generated routes and metadata need automated prefix tests, not only manual browser checks.
- Sitemap integration may emit per-app URLs based on each app’s `site`/`base`; the compositor must define whether it rewrites, relocates, combines, or independently serves sitemap artifacts.
- Canonical and social metadata is currently hard-coded to the 2025 root domain and must become edition/publication-context aware without regressing 2025 values.
- Asset filename collisions, generated `_astro` paths, favicons, robots files, and other root-level artifacts can cause nondeterministic overwrites during composition.
- The active edition selection is a deployment/build concern; ambiguity around configuration precedence could publish the wrong edition or make builds irreproducible.
- The confirmed 2026 lifecycle policy creates an implementation risk: calls-only routes and data must be removed and replaced at final publication, without leaking temporary routes into the annual archive or losing the approved URL policy.
- Independent apps can drift in Astro, React, Tailwind, or shared package versions. Workspace dependency policy and compatibility ownership remain open.
- Existing application source, `.gitignore`, `refs/`, and `.pi/` are protected during exploration and migration planning; no changes were made to them.

## Recommended evidence before proposal/design

- Enumerate every current `src/pages` route and verify generated `dist` paths.
- Identify all root-relative URL construction, canonical/OG metadata, sitemap/robots/404 generation, and Vercel-specific output assumptions.
- Record representative 2025 HTML snapshots or structural assertions and Playwright journeys as the compatibility oracle.
- Catalog and import the confirmed historical sources—ARC2023 from `https://github.com/Strocs/ARC2023` and ARC2024 from `origin/2024`—and use current ARC2025 from `origin/main` as the compatibility baseline.
- Specify the implementation workflow and deployment guard that enforce the confirmed 2026 replacement/removal lifecycle; do not reopen the product policy.

## Non-goals for exploration

- No source migration, workspace files, Turborepo files, package installation, route rewrites, compositor implementation, or deployment changes.
- No optional web research; repository and recovered architecture evidence are sufficient for this phase.
- No irreversible decision about shared UI, package version strategy, or final compositor collision semantics.
