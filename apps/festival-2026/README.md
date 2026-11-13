# Festival ARC 2026

The active edition serves a static festival poster at `/` and 46 artist detail pages at `/artistas/[id]/`. Astro builds the HTML; responsive CSS changes poster placement without duplicating artist labels or packing the grid in the browser.

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
| `pages/artistas/[slug].astro` | Generate artist routes from the same data as the grid |
| `layouts/Layout.astro` | Own the document, metadata, local fonts, shared Header and Footer |
| `features/poster/` | Own poster components, presets, pure layout/motif/font-fit helpers, SVG artwork, font metrics and colocated `__tests__/` |
| `features/artists/` | Own the general artist contract, ordering, validation and detail rendering |
| `content/` and `content.config.ts` | Own the real artist source of truth and discipline catalog; expose artists as a validated Astro collection |
| `components/` | Own app-wide chrome and edition navigation; Header consumes the workspace navbar |
| `assets/branding/` | Hold the app-level logo used by Header, independent of either feature |
| `styles/global.css` and `utils/publication.ts` | Supply theme tokens/shared styling and publication-aware URLs |

## Keep the boundaries

- Routes orchestrate their own page structure. Do not add a homepage wrapper component or a second document shell.
- Keep each feature flat and colocate its components, helpers, tests and dedicated assets. Import modules directly; no architecture barrels or extra layers are needed.
- Poster consumes the general artists feature; artists never imports poster. Shared chrome must not depend on either feature; genuinely shared concerns belong at the app's top level or in a shared workspace package.
- Preserve logical grid geometry, stable lineup identities, selectable HTML labels, route URLs, metadata and local fonts. Keep `calculatePosterLayout`, `selectPosterMotifs`, `getArtistCompositions`, `getArtistFitRanges` and `validateArtists` independently testable and pure.
- The artist JSON is real, progressively completed content, not demo data. Keep unknown descriptions empty and images/tickets null; do not invent activities or venues.

For editing rules, sizing details and focused checks, see the [poster guide](src/features/poster/README.md). It also records the existing 320px/200% root-text limitation: rem-based insets can leave artist lettering with no available height. The architecture refactor does not resolve that accessibility limitation.

## Edit artist data

Edit `src/content/artists.json`, the single source used by the grid, detail pages and Astro collection. `order` controls ascending editorial order independently of array position; IDs and orders must be unique. Preserve stable IDs when updating names.

Each entry has `id`, `name`, `group`, optional `company`, `order`, `disciplines` (one catalog ID), `description` (string), `ticketUrl` (string or null), `date: { day, time }` (editable strings), and `image: { url, alt } | null`. All current dates are `Sábado 28` / `23:00`; tickets and images are null, and descriptions are empty pending supplied content.

The discipline catalog is `src/content/disciplines.json`: national/regional entries reference `musica`, stage entries reference `artes-escenicas`. The poster's discipline list uses this same catalog.

### Local optimized images

Put a real artist image in `src/assets/artists/`, then set:

```json
"image": {
  "url": "/src/assets/artists/artist.jpg",
  "alt": "Describe the actual artist photograph"
}
```

The URL is an import lookup key, not a public browser URL. `ArtistDetail.astro` resolves local JPEG, PNG, WebP, AVIF and GIF assets through `import.meta.glob` and passes the import to Astro's native `Image` component. A missing path fails the build with a clear error; null renders no image. Do not store images in `public/` when optimization is required. No manual per-artist imports are needed.

References: [Astro dynamic image recipe](https://docs.astro.build/en/recipes/dynamically-importing-images/) and [image storage guidance](https://docs.astro.build/en/guides/images/#where-to-store-images).
