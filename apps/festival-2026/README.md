# Festival ARC 2026

The active edition serves the 46-work music/stage poster at `/`, four category posters, and 93 static participant detail fallbacks. Canonical details use `/<public-category-slug>/<participant-id>/`; the old `/artistas/` family is removed without redirects. Astro builds the HTML; responsive CSS changes poster placement without duplicating artist labels or packing the grid in the browser. Cards remain normal canonical fallback anchors. Successful enhancement opens one shared native dialog with reversible source-to-center GSAP motion; unavailable or failed enhancement follows the same anchor. T2 is implemented but not visually verified. Stage 2 (day filters and recomposition) remains planned.

S11–S13 source adjustments are implemented: homepage category links reuse the rotating poster arrow without underlines and fit whole labels from tablet upward; the navbar highlights the current page/parent category in `arc-yellow` and adds four distinct 16px canonical motif separators on desktop; category titles occupy a partial-width grid piece with artists/motifs alongside. Homepage placements, data, routes and the T2 modal are unchanged. Deterministic render/metric checks are not visual proof; no browser/server/visual checks are authorized for this unit. See the [poster guide](src/features/poster/README.md) and [shared navbar API](../../packages/ui/README.md).

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
| `pages/index.astro` and `features/poster/PosterGrid.astro` | Compose the shared poster; retain the original homepage slots using the pure poster helpers |
| `pages/[category]/index.astro` | Generate the four category posters |
| `pages/[category]/[slug].astro` | Generate all 93 canonical static detail fallbacks |
| `layouts/Layout.astro` | Own the document, metadata, local fonts, shared Header and Footer |
| `features/poster/` | Own poster components, presets, pure layout/motif/font-fit helpers, SVG artwork, font metrics and colocated `__tests__/` |
| `features/artists/` | Own the general artist contract, ordering, validation and detail rendering |
| `content/` and `content.config.ts` | Own the real artist source of truth and discipline catalog; expose artists as a validated Astro collection |
| `components/` | Own app-wide chrome and edition navigation; Header consumes the workspace navbar |
| `assets/branding/` | Hold the app-level logo used by Header, independent of either feature |
| `styles/global.css` and `utils/publication.ts` | Supply theme tokens/shared styling and publication-aware URLs |

## Keep the boundaries

- Routes orchestrate page scope and metadata. Homepage/category routes reuse `PosterGrid.astro`; keep one document shell.
- Keep each feature flat and colocate its components, helpers, tests and dedicated assets. Import modules directly; no architecture barrels or extra layers are needed.
- Poster consumes the general artists feature; artists never imports poster. The edition Header consumes the authoritative category navigation, while the shared navbar receives only generic links.
- Preserve logical grid geometry, stable lineup identities, selectable HTML labels, route URLs, metadata and local fonts. Keep `calculatePosterLayout`, `selectPosterMotifs`, `getArtistCompositions`, `getArtistFitRanges` and `validateArtists` independently testable and pure.
- The artist JSON is real, progressively completed content, not demo data. Keep unknown descriptions empty and images/tickets null; do not invent activities or venues.

For editing rules, sizing details and focused checks, see the [poster guide](src/features/poster/README.md). It also records the existing 320px/200% root-text limitation: rem-based insets can leave artist lettering with no available height. The architecture refactor does not resolve that accessibility limitation.

## Edit artist data

Edit `src/content/artists.json`, the single participant source. It contains four category objects, each with a display `name` and a `participants` array:

| Key | Category | Entries |
| --- | --- | --- |
| `music` | Música | 30 |
| `stage` | Artes Escénicas | 16 |
| `expo` | Expo Arte.Co | 8 |
| `market` | Mercado Creativo y DAZ | 39 |

These four names are already stored, not proposed labels. Categories are independent of the seven-entry discipline catalog. `participantCatalog` exports all four validated categories. Business rule: only music and stage works appear in the hero, all 46 in their existing mixed editorial order, regardless of national status. The `artists` export and Astro collection retain that same set. `categories.ts` projects all 93 validated participants into the shared rendering view; it does not add fields to stored data.

Expo and market entries require exactly `id`, `name`, `description` (string), `date: { day, time }` (nonempty editable strings, not a parsed datetime), and `image: { url, alt } | null` (nonempty URL and string alt). Descriptions start empty and images null. They have no invented disciplines, performer orders, ticket URLs or embedded category fields. Category grids and canonical detail fallbacks now render these common fields without fabricated performer metadata. The shared modal uses the same common fields and omits missing content.

Music and stage entries have `id`, `name`, optional `company`, `order`, `disciplines` (one catalog ID), `description` (string), `ticketUrl` (string or null), `date: { day, time }` (editable strings), and `image: { url, alt } | null`. Music alone requires boolean `national`: national entries are `true` (18), regional entries are `false` (12). The explicitly approved rename from `featured` preserves every value; neither flag controls hero inclusion. The old `featured` and `group` fields are rejected. Category is derived from the containing object when exporting performers.

`order` controls ascending editorial order independently of array position; performer orders and all participant IDs must be unique. Preserve stable IDs when updating names. Stage `name` remains the work title shown in the hero; `company` holds the participant's name. Store names in mixed case; uppercase presentation belongs in CSS.

For filter development, orders 1–23 currently use `Sábado 28` and orders 24–46 use `Domingo 29`, all at `23:00`. Expo uses its first four entries on Saturday and remaining four on Sunday; market uses its first 20 on Saturday and remaining 19 on Sunday, preserving array order, all at `23:00`. All these splits are provisional testing assignments, not a confirmed schedule; update them when actual assignments are available. Images are null and descriptions empty across the catalog; music/stage tickets remain null.

The discipline catalog is `src/content/disciplines.json`: current music entries reference `musica`, stage entries reference `artes-escenicas`. Disciplines are optional detail metadata, not category navigation. The homepage category box and desktop/mobile navbar share these routes:

| Category key | Listing |
| --- | --- |
| `music` | `/musica/` |
| `stage` | `/artes-escenicas/` |
| `expo` | `/expo-arte-co/` |
| `market` | `/mercado-creativo-y-daz/` |

Category posters use their stored category name as the large heading and only their own members in stored relative order, with normal motifs/envelopes but no homepage-only information blocks or their empty reservations. Direct details link back to that category. Ticket actions render only absolute HTTP(S) URLs; absent or unsafe strings produce no link.

`features/artists/categories.ts` is build-only: it exports `categories`, flattened `participants`, and editorially ordered `heroParticipants`. Each `ParticipantView` contains common detail fields, category/canonical path, optional `company`/`disciplineName`, and a safe nullable `ticketUrl`; it contains no invented performer order. Browser code may import the type only, never these catalog/schema-backed values. `safeTicketUrl` is the shared build/render ticket policy. `EventModal.astro` prerenders only the current page's participant templates through `ArtistDetail.astro`; no raw catalog is serialized. `event-modal.ts` owns the scoped native-dialog lifecycle and `event-modal-motion.ts` owns GSAP paint, with no client import of this build-only module. The controller uses `[data-event-scope]`, `[data-event-trigger]` and `[data-event-id]`, preserves modified-link navigation, and changes no URL/history state on successful enhancement. Close, Escape and deliberate backdrop gestures reverse while modality remains active; scroll styles/offset and source focus return after settlement. Resize, fonts/images, reduced motion and disconnect settle or release owned resources. The source grid and motifs are not recomputed. Deterministic mocked tests are not browser, visual or assistive-technology proof. See the [interaction specification](../../docs/specs/arc2026-artist-interactions.md); day filtering remains stage 2.

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
