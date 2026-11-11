# Festival ARC 2026

The active edition serves a static festival poster at `/` and a demonstration artist page at `/artistas/javiera-mena/`. Astro builds the HTML; responsive CSS changes poster placement without duplicating artist labels or packing the grid in the browser.

## Run and verify

Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm --filter festival-2026 dev` | Develop this edition |
| `pnpm --filter festival-2026 test` | Run the edition's Vitest tests |
| `pnpm --filter festival-2026 type` | Check Astro and TypeScript |
| `pnpm build` | Build all editions and compose the published site |
| `pnpm exec playwright test tests/e2e/arc2026-document.spec.ts tests/e2e/arc2026-static-grid.spec.ts tests/e2e/arc2026-pattern-seams.spec.ts tests/e2e/arc2026-poster-title.spec.ts tests/e2e/arc2026-artist-sizing.spec.ts tests/e2e/arc2026-hybrid-sizing.spec.ts tests/e2e/festival-navbar.spec.ts --workers=2 --retries=0` | Check rendered output after the root build |

The publication configuration remains `kind: final` in the root `editions.config.ts`. Application forms and call deadlines are not published on the homepage.

## Find the owner

All paths below are relative to this app's `src/` directory.

| Location | Responsibility |
| --- | --- |
| `pages/index.astro` | Compose the homepage and assign responsive slots using the pure poster helpers |
| `pages/artistas/[slug].astro` | Generate direct demonstration artist routes and compose their content |
| `layouts/Layout.astro` | Own the document, metadata, local fonts, shared Header and Footer |
| `features/poster/` | Own poster components, lineup, presets, pure layout/motif/font-fit helpers, SVG artwork, font metrics and colocated `__tests__/` |
| `features/program/` | Own program schemas, validation, local content loading, artist detail presentation, reference image and colocated `__tests__/` |
| `content/` and `content.config.ts` | Supply demonstration artists, activities and venues through validated Astro collections |
| `components/` | Own app-wide chrome and edition navigation; Header consumes the workspace navbar |
| `assets/branding/` | Hold the app-level logo used by Header, independent of either feature |
| `styles/global.css` and `utils/publication.ts` | Supply theme tokens/shared styling and publication-aware URLs |

## Keep the boundaries

- Routes orchestrate their own page structure. Do not add a homepage wrapper component or a second document shell.
- Keep each feature flat and colocate its components, helpers, tests and dedicated assets. Import modules directly; no architecture barrels or extra layers are needed.
- Poster and program do not import each other. Shared chrome must not depend on either feature; genuinely shared concerns belong at the app's top level or in a shared workspace package.
- Preserve logical grid geometry, stable lineup identities, selectable HTML labels, route URLs, metadata and local fonts. Keep `calculatePosterLayout`, `selectPosterMotifs`, `getArtistCompositions`, `getArtistFitRanges` and `validateProgram` independently testable and pure.
- The program data is explicitly a demonstration, not a confirmed artist schedule. The removed overlay/store/motion chain is not part of the current page lifecycle; direct artist routes remain available.

For editing rules, sizing details and focused checks, see the [poster guide](src/features/poster/README.md). It also records the existing 320px/200% root-text limitation: rem-based insets can leave artist lettering with no available height. The architecture refactor does not resolve that accessibility limitation.
