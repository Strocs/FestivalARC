# Edit the static ARC 2026 poster

The homepage is built as Astro HTML with one copy of each artist name. TypeScript computes logical slots at build time; CSS selects the desktop, tablet or mobile placement without client JavaScript.

## Quick path

1. Edit `data/lineup.ts` for names, stable IDs and company associations. Do not invent activities, dates or venues.
2. Edit `data/poster.ts` for the module proportions, information footprints and decorative sequence. Coordinates start at zero.
3. Run `pnpm --filter festival-2026 test`, then `pnpm build`. Browser checks use `pnpm exec playwright test tests/e2e/arc2026-{document,static-grid,prototype}.spec.ts` after the root build.

## Layout rules

| Range | Columns | Artist starts |
| --- | --- | --- |
| Desktop, at least 1200px | 10 | Even rows: 0/4/8; odd rows: 2/6 |
| Tablet, 768–1199px | 6 | Even rows: 0/4; odd rows: 2 |
| Phone, below 768px | 2 | Column 0 on alternate rows, full width |

Each name uses two columns and one row. The two cells directly underneath are reserved for future expansion, but currently display decorative motifs. Information reserves its complete footprint first; a blocked start is skipped, never moved to another column or used to restart row parity. Rows grow to contain the names and their reservations.

`calculatePosterLayout` is a pure function. An optional fourth argument supplies explicit artist anchors such as `{ id: 'nino-cohete', column: 0, row: 6 }`; invalid cadence, collisions, duplicate or unknown identities are rejected before rendering. Do not modify positions with browser measurements.

The stepped desktop title uses two adjacent footprints. Phone/tablet information positions are authored separately. `slotSize` starts at 160×152 and defines the base module proportions; actual width follows available space.

## Poster styling

The seven poster components (`FestivalGrid`, `ArtistName`, `PosterIntro`, `PosterInformation`, `PosterPattern`, `PosterDefinitions`, and `PatternTile`) use statically detectable Tailwind 4.1 utilities, with no local style blocks. Shared slot/chevron strings and the motif color map contain complete utility names, not interpolated fragments. Semantic classes remain as styling-free hooks for tests and scripts.

`FestivalGrid` still assigns runtime CSS variables from `calculatePosterLayout` and the existing presets. Utilities consume those values for grid placement and container-relative sizing. Explicit 768px and 1200px variants preserve the poster breakpoints; Tailwind's default `xl` is not the desktop boundary. Arbitrary media variants retain the existing bounded mobile/tablet overrides. Colors and fonts reuse the installed theme tokens. Intrinsic SVG geometry stays in the artwork, not in styling utilities.

The structural regression check is `pnpm --filter festival-2026 test src/features/arc2026/__tests__/tailwind-poster.test.ts`. Existing geometry and raster checks remain in place; browser seam checks are available when server/browser execution is authorized. The shell and infrastructure utility boundary is described below.

## Shell and infrastructure styling

`Header` consumes `@festivalarc/ui/FestivalNavbar.astro` on the homepage and existing detail routes. Its minimum height follows ARC 2024 (72px); logo/date are required, location/links/CTA are optional, and Ediciones lists every other edition. The confirmed header copy is “28 y 29 de noviembre” (2026) and “Plaza de Armas de La Serena”. Header colors are inherited CSS tokens assigned using Tailwind utilities. See `packages/ui/README.md` for slots, tokens, public styling hooks and mobile dialog behavior. Historical apps are not migrated; the old `PreviousEditions` source is retained but no longer used by Header.

`ArtistDetail` and the dormant `ArtistOverlay` retain their existing Tailwind presentation and 768px cutoff. This navbar change does not integrate the artist overlay into the static homepage.

`styles/global.css` retains the Tailwind import and existing color/font theme tokens, and explicitly scans `packages/ui/src` with `@source`. Astro's `Document` still delivers both local fonts and all metadata. Document utilities now carry page sizing, body typography/color and low-specificity heading/link defaults. The `:where()` variants deliberately allow existing element utilities to override those defaults, including the edition links' outline-style override. Existing layout, footer and poster utilities are not rewritten.

Run `pnpm --filter festival-2026 test` and `pnpm build`, then `pnpm exec playwright test tests/e2e/festival-navbar.spec.ts tests/e2e/arc2026-{document,static-grid}.spec.ts`. Navbar tests cover the rendered Astro contract, desktop dimensions, mobile keyboard/focus/resize behavior, edition links and CSS-token/background overrides. The previous Tailwind-only migration recorded 47 unit tests and deferred its browser run; those historical results are not evidence for the new navbar. Dormant artist-overlay source checks are not runtime modal-lifecycle proof.

## Rendering and boundaries

- `FestivalGrid.astro` owns responsive geometry; `ArtistName.astro` only renders a name and its decoration. Names remain selectable HTML using the existing local Poppins 900 delivery.
- `PosterPattern.astro` bleeds decorative SVGs by 0.5 CSS pixels per side to cover subpixel seams. Grid cells keep their original dimensions; curves and diagonals retain normal antialiasing. Do not clip this bleed at each cell or combine it with global `crispEdges`. Regression check: `pnpm exec playwright test tests/e2e/arc2026-pattern-seams.spec.ts` after the root build.
- The title reuses the unchanged supplied `LOGO_HERO.png` through an SVG viewBox excluding the logo. Visible dates use the confirmed festival dates, 28–29 November 2026; they do not assign artists to days.
- `poster-motifs.svg` retains the accepted design export, except for `lightning`: its four cyan triangles use straight vector edges rather than the source JPEG's traced pixel steps. Preserve its magenta background, cyan fill and alternating arrangement.
- Root uses `layouts/Document.astro` for metadata/fonts plus the shared Header, without a footer. Existing routes keep `layouts/Layout.astro` and its normal chrome.
- The demo program and direct demonstration artist route remain separate. No filters, expansion, client store or entrance motion are included. The navbar adds only the local workspace UI dependency and its navigation script.

Design authority and evidence: `odd/tasks/arc2026-static-grid.md`; accepted artboard: `design/arc2026-slot-grid/02-poster-grid.html`.
