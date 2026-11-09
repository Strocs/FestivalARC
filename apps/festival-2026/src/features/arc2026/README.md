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

## Rendering and boundaries

- `FestivalGrid.astro` owns responsive geometry; `ArtistName.astro` only renders a name and its decoration. Names remain selectable HTML using the existing local Poppins 900 delivery.
- The title reuses the unchanged supplied `LOGO_HERO.png` through an SVG viewBox excluding the logo. Its visible dates are reference artwork, not confirmed artist bookings.
- `poster-motifs.svg` is a verbatim copy of the accepted design export. Do not reopen the closed motif-precision exercise when implementing this page.
- Root uses `layouts/Document.astro` for metadata/fonts without navigation/footer. Existing routes keep `layouts/Layout.astro` and its normal chrome.
- The demo program and direct demonstration artist route remain separate. No filters, expansion, client store, entrance motion or new dependencies are included.

Design authority and evidence: `odd/tasks/arc2026-static-grid.md`; accepted artboard: `design/arc2026-slot-grid/02-poster-grid.html`.
