# Edit the static ARC 2026 poster

Homepage and category posters share `PosterGrid.astro`, built as Astro HTML with one copy of each participant name. TypeScript computes logical slots at build time; CSS selects the desktop, tablet or mobile placement without client JavaScript. Cards retain canonical static-detail anchors, enhanced by a shared native dialog. The modal is implemented but not visually verified. Stage 2 precomputes finite day endpoints and enhances both-day scopes with native radios and GSAP recomposition beneath the existing modal lifecycle. These changes have no visual/browser verification.

## Quick path

1. Edit `src/content/artists.json` (relative to the app) for artist data. Explicit `order` controls the grid sequence; `src/content/disciplines.json` owns discipline IDs and labels. Do not invent missing content.
2. Edit `PosterGrid.astro` for shared rendering and `poster-layout.ts` for the preserved homepage information positions/dimensions; edit `poster.ts` for module proportions and the decorative sequence. Coordinates start at zero.
3. Run `pnpm --filter festival-2026 test`, then `pnpm build`. Browser checks use `pnpm exec playwright test tests/e2e/arc2026-document.spec.ts tests/e2e/arc2026-static-grid.spec.ts tests/e2e/arc2026-pattern-seams.spec.ts tests/e2e/festival-navbar.spec.ts` after the root build.

## Layout rules

| Range | Columns | Artist starts |
| --- | --- | --- |
| Desktop, `xl` / at least 1280px | 10 | Even rows: 0/4/8; odd rows: 2/6 |
| Tablet, `md` / 768–1279px | 6 | Even rows: 0/4; odd rows: 2 |
| Phone, below 768px | 8 | Column 0 every third row; artists span eight columns and two rows, separated by one row of eight tiles (8×1) |

Each name uses one row and two columns on tablet/desktop or all eight columns and two half-size rows on mobile. The cells directly underneath remain protected logical envelopes for packing and collisions; they display decorative motifs only inside the visible grid. Modal details do not occupy or repack them. Information reserves its complete footprint first; a blocked start is skipped, never moved to another column or used to restart row parity. The visible row count ends at the last actual artist or information edge in every range and day plan. Only trailing purely decorative rows are omitted; interior spacing, artist positions and information footprints remain unchanged, and a final logical reserve may extend below the visible grid. Rendered row height follows the hybrid sizing rules below.

`calculatePosterLayout` is a pure function. An optional fourth argument supplies explicit artist anchors such as `{ id: 'nino-cohete', column: 0, row: 6 }`; invalid cadence, collisions, duplicate or unknown identities are rejected before rendering. The optional fifth argument, `artistStartRow`, sets the earliest artist row (zero by default). The homepage sets it to 8; its information coordinates are doubled on mobile to retain their physical proportions with eight narrower columns. Only the mobile opening between the intro (rows 0–3) and first artist (row 8) is coalesced into four columns by two rows of larger tiles: each spans 2×2 logical cells at columns 0/2/4/6 and rows 4/6. `poster-filter-layout.ts` applies this after packing and before shared artwork selection, for Todos and both day endpoints; movable information cannot consume that opening. All later separators stay 8×1, and category/tablet/desktop packing is unchanged. Category posters use `category-title.ts` to measure uppercase Poppins 900 text at build time. Each title line reserves one desktop/tablet row and only its measured, rounded-up module width, within a four-column lane on desktop, three on tablet and eight on mobile. Mobile line footprints span two half-size rows to preserve the text scale. Short adjacent words share a line when they fit within the longest word's measure. A single accessible heading names the page; visible line pieces are semantics-hidden. Motifs and artists fill cells outside these stepped footprints, and every day-filter endpoint uses the same line reservations. Empty categories retain only these actual footprints, not a fixed heading rectangle. Typography and line height scale together with module width. Do not modify positions with browser measurements.

The stepped desktop title uses two adjacent footprints. Phone/tablet information positions are authored separately. `slotSize` starts at 160×152 and defines the base module proportions; actual width follows available space.

## Information blocks and independent content

`PosterInformation.astro` is a content-agnostic grid footprint with a default Astro slot. It accepts `mobile`, `tablet` and `desktop` props, each containing zero-based `{ column, row, width, height }` values in modules. An omitted range hides the block in that range. It does not select content through a `kind` prop.

`PosterDisciplines.astro` independently owns its markup and text. `PosterIntro.astro` composes the heading/date footprint and the adjacent empty title extension internally. The shared grid composes these components only for the homepage; `PosterDisciplines` now renders four category anchors from the authoritative category map, not seven discipline labels. The homepage no longer renders or reserves the Programación information block in any range or day plan; existing packing fills its released cells. `/programacion` remains available, and `PosterProgram.astro` and its exported placement are retained but unused by the grid. Category scopes use only `CategoryTitle` and their members, without internal intro reservations.

Control homepage positions in `poster-layout.ts`: `posterIntroPlacement`, `posterTitleExtensionPlacement` and `posterDisciplinesPlacement` are passed as props to the content wrappers. `PosterIntro` receives its auxiliary footprint through `titleExtension`. The same values feed `homeInformation` before artist/motif placement, so changing the shared baseline changes both rendering and reservations. No ID lookup or `information-placement.ts` utility is needed. The presets in `poster.ts` remain layout-test data, not implicit component defaults. Content wrappers read geometry directly from `Astro.props`; omitted ranges stay hidden, and the intro only renders its auxiliary reservation when `titleExtension` is supplied.

For example, inside a custom wrapper:

```astro
---
import PosterInformation from './PosterInformation.astro'
---
<PosterInformation
  mobile={{ column: 0, row: 12, width: 3, height: 1 }}
  tablet={{ column: 3, row: 7, width: 3, height: 2 }}
  desktop={{ column: 6, row: 5, width: 3, height: 2 }}>
  <aside aria-label='Custom information'><p>Your independent content</p></aside>
</PosterInformation>
```

For new homepage content, create a wrapper using the base slot, define its responsive props in `poster-layout.ts`, register that same geometry and a unique ID in `homeInformation`, and render the wrapper with those props. Do not add content branches to the base component. Standalone base blocks do not automatically register themselves with an ancestor grid.

## Finite day plans and client filtering

`createPosterFilterPlans(input): PosterFilterPlans` in `poster-filter-layout.ts` takes only `scope: 'home' | 'category'`, ordered `participants: { id, day }[]`, and `information: PosterInformationBlock[]`. Each information entry has a unique `id`, responsive `positions`, and optional `fixed`. `poster-layout.ts` is the authoritative original baseline; the similarly named presets in `poster.ts` are unchanged. Callers select authoritative `heroParticipants` or `category.participants` before projecting IDs/day strings. Neither the adapter nor a browser consumer imports the build-only catalog/schema.

The client may **type-import** `DayKey`, `PosterFilterPlans` and `PosterFilterPlan`; no runtime packing is needed. `getPosterFilterPlan(plans, key)` rejects anything except `all`, `saturday`, `sunday`. The DTO has:

| Field | Meaning |
| --- | --- |
| `scope: 'home' \| 'category'` | Explicit endpoint scope; only home mobile permits aligned 2×2 opening motifs. |
| `version: 1`, `available` | Availability from the full scope containing both exact known day strings, never from the selected endpoint. |
| `participants` | Ordered `{ id, day }` projection only. |
| `plans[key].ids` | Canonical scoped subset; unknown day strings remain only in Todos. |
| `plans[key].layouts[range]` | Existing engine output: columns, visible-content rows, artists, visible motif cells. |
| `plans[key].information[range][id]` | Actual box rectangles; absent range means hidden (including mobile title extension). |
| `plans[key].motifs` | Shared `index`, canonical `variant`, and optional `positions[range]`; index is an endpoint slot, **not permanent moving identity**. |
| `transitions?` | Additive prepared data: six directed day-pair tables, each with three active-range motif correspondences (18 total). Legacy v1 without this field remains legal. |

### Prepared transitions, client admission and sparse writes (T1–T3)

Current builds always emit `transitions`, without changing version 1, availability,
participants or endpoint values. The client validates and indexes these tables once
at mount, then looks up the selected-to-target pair and uses `motifs[activeRange]`
directly, without invoking the compiler or matcher. Legacy v1 payloads **without**
`transitions` retain the existing runtime matcher path. Present but malformed tables
fail closed before controls, counts, endpoints or owned styles change.

Admission is linear in the bounded endpoints and supplied pairs: six unique directed
pairs, exact sparse stable-ID masks (including required entries), changed row ranges,
and three one-to-one motif correspondences with valid indices, present positions,
same variant/dimensions, at most four modules of travel and exact all-range masks.
It validates references and consistency, not optimal greedy matching; producer tests
protect exact matcher order. `poster-filter-transition-validation.ts` exports
`validatePosterFilterTransitions`, `PosterFilterIndex` and `PosterPlanIndex`. A valid
index contains per-day ID Sets and artist/information position Maps, plus optional
nested `transitions.get(from).get(to)` Maps; `undefined` means invalid metadata.
Call it only after the existing complete endpoint/DOM validation.

Reconciliation reserves all previous endpoint nodes and matched assignments, then
consumes per-variant FIFO queues in pool insertion order. Clones are created only
when a queue is exhausted, using the existing safe SVG wrapper strategy; original
artist nodes are retained. Stable artist/information patches are indexed by ID once
per selection; matched motif patches are indexed by destination slot. Prepared
transitions write only changed endpoint variables across all three ranges and changed
grid row variables. Transient visibility/accessibility normalization still runs,
including interrupted exits; masks never suppress hidden/display or motion cleanup.

Sparse writes require a known initialized canonical source. On first use, the controller
checks only inline variable values and priorities against the source endpoint: at most
15 value reads and 15 priority reads per first-used stable/matched node, plus three of
each for the grid (checks short-circuit on mismatch). No computed-style or rectangle
reads are added. There are no unconditional mount endpoint writes. Valid SSR therefore
benefits on its first optimized click; missing, partial, different or important inline
values trigger full destination normalization before subsequent sparse use. Unmatched
new/recycled motifs always receive all 15 destination variables, regardless of pool
history. Legacy payloads keep full writes. Bookkeeping stores only controller-owned
endpoint initialization, never pixels. Functional fixtures compare exact all-range
endpoints and node choices against legacy while counting declaration work, including
JSDOM clone style-copy overhead; these counts are not browser latency measurements.

`poster-filter-transitions.ts` exports `PosterFilterTransition`, `PosterStablePatch`,
`PosterMotifPatch` and `PosterPositionMasks`. Each table identifies `from`/`to` day
keys. `artists` and `information` contain only changed `{ id, masks }` entries,
independent of the active range; resolve their IDs in the destination endpoint
(absent artists/information ranges use the canonical absent defaults). `rows` lists
only ranges with changed row counts; read their values from destination layouts.
No rectangles or CSS strings are copied into patches.

`motifs[activeRange]` retains **all matched pairs in exact matcher output order**,
including zero-mask pairs. Each `{ from, to, masks }` references source/destination
motif array indices, not DOM identities. Build invokes `matchPosterMotifs` for each
of the 18 correspondences independently, never reversing a mapping. Each matched
pair's masks compare its source and destination slots across **all three ranges**,
not just the active matching range. Unmatched slots have no patch: new/recycled
nodes receive full initialization because build cannot know pool history.

The client-safe helpers `canonicalPosterPosition`, `diffPosterPosition` and
`diffPosterPositions` share the comparison rules used by linear client validation.
`posterPositionFields` and `posterPositionMask` name the five numeric bits:
`present=1`, `column=2`, `row=4`, `width=8`, `height=16` (all fields: 31; no-op: 0).
`present` selects the node's normal display (`grid`/`block`) versus `none`.
Canonical absent coordinates are column/row 0 and width/height 1, matching the
existing `position()` writer. A mask permits skipping only unchanged endpoint
variables, not transient visibility/accessibility cleanup. `compilePosterFilterTransitions`
accepts validated finite endpoints; it is invoked only at build. The module's
layout contracts are type imports, with no catalog, Astro or packing runtime imports.
Existing 512-artist, 32-information, 4096-row and 40960-motif envelopes remain intact.

Exact mapping is `Sábado 28` / `Domingo 29`; no localized date parsing. Todos reproduces original packing and shared motif selection exactly, including original home gaps. Filtered home plans keep intro/title extension fixed. Other boxes follow their baseline row-major order: count retained predecessor IDs at each baseline boundary, commit that artist prefix through the existing engine's validated anchors, then scan forward for the preferred lane (other in-bounds lanes break ties). Previously committed prefixes never move backward. The engine validates each candidate against full artist envelopes (three rows on mobile, two elsewhere) and prior information. Dimensions/content stay unchanged. All three layouts finish before one shared motif selection. Category endpoints reserve only the actual existing title footprint.

Inputs are not mutated. Duplicate/empty artist IDs, invalid day keys, invalid scope, duplicate information IDs, invalid range/geometry and overlapping footprints reject atomically. Resource bounds are 512 participants, 32 information boxes, 128-row box heights and a 4096-row endpoint/search ceiling; impossible compaction rejects instead of looping. These are engineering safety limits, not catalog business rules.

### SSR handoff to the controller

Scope queries to the existing `[data-event-scope]` root:

- `[data-poster-grid]`: real grid; existing `--mobile-rows`, `--tablet-rows`, `--desktop-rows` define its heights.
- `[data-poster-artist="id"]`: actual artist grid wrapper, separate from untouched modal trigger/link attributes.
- `[data-poster-information="id"]`: actual information grid box. Optional `informationId` props forward through wrappers without changing defaults. Intro has separate `informationId` / `titleExtensionId`; socials accept `informationIds: { instagram, facebook, twitter }` for their three separate boxes.
- `[data-poster-motif]`: actual decorative wrapper, attribute value is the canonical SVG variant; `data-poster-motif-index` identifies the shared endpoint slot. Match by same variant, never morph artwork by index.
- `script[data-poster-plans]`: inert `application/json`; read `textContent` and parse. Every `<` is escaped as `\\u003c`. Payload contains geometry, availability and ordered IDs/day only, not descriptions/tickets/raw catalog.

The initial SSR endpoint is always Todos, with unchanged placement variables, markup content, motifs and styling. `DayFilter.astro` emits a hidden native radio fieldset only for a full both-day scope. `mountEventModal` is the sole connection owner; its `mountDayFilter` adapter validates the complete finite handoff and actual DOM before revealing controls. Broken setup keeps static Todos and fallback anchors. Day state never changes URLs/history/storage and controls remain available during motion.

`poster-day-filter.ts` applies all three endpoint ranges, including each actual information box, using initialization-aware sparse writes when prepared data is available, and disables excluded source links immediately. Scroll stays independent of artists: preserve the document position, clamping only to the new bottom when content shrinks. For motion, capture current paint before interruption, commit the full endpoint, then batch final rectangles. Animate only changed tiles intersecting the viewport at either endpoint; offscreen and unchanged tiles take their final positions immediately. Reduced motion skips animation geometry entirely.

`poster-filter-motion.ts` coordinates at most three labelled numeric GSAP tracks (exit, move, enter), writing transform/opacity without per-node CSSPlugin transform reads or cleanup. Outgoing nodes remain noninteractive absolute paint during row shrink. Resize and modal opening settle the latest endpoint immediately. Idle settlement still invalidates completion tokens but skips grid visibility writes when no transition, motion or scroll cleanup remains. Actual completion uses Sets for artist and motif membership lookups. Tokens reject stale removal/count callbacks. One polite settled count (or `No hay artistas para este filtro.`) is emitted; focus stays on native radios.

`poster-motif-match.ts` reserves exact same-cell/variant/size nodes, then stable nearest same-variant, same-size matches within four module cells (omitted dimensions mean 1×1). Artwork never morphs by index. The controller reuses/pools SVG wrappers with canonical `use` references, updates shared per-range endpoints and retains original artist nodes/templates. Todos restores exact plan geometry/variants. Teardown kills timelines, removes owned pooled nodes/listeners/observers, restores server Todos and only owned styles/tab indices. Live toolbar height plus safe-area clearance adds to existing body bottom padding without touching modal overflow/right padding. `createFilterMotion` in the public `mountEventModal` options injects motion for deterministic integration tests; `ownStyles` is reused from the owner. No browser/visual checks are authorized for this unit.

## Social links

`PosterSocials.astro` renders three separate information footprints for Instagram, Facebook and Twitter, without a grouping wrapper that would merge their grid positions. Its `instagram`, `facebook` and `twitter` props each accept independent `mobile`, `tablet` and `desktop` rectangles. The homepage defines them in `posterSocialsPlacement` and includes all three in `informationBlocks(range)` so artists and motifs respect their reservations. Their alternating columns and separated rows leave decorative/artist space between links.

The official destinations are Instagram `https://www.instagram.com/festival_arc`, Facebook `https://www.facebook.com/FestivalARC` and X `https://x.com/FestivalARC`. All three links retain `target='_blank'` and `rel='noopener noreferrer'`. `PosterArrow.astro` owns the decorative arrow shared with `PosterProgram` and homepage category links; rotation remains controlled by each link. Category links alternate `arc-rose` and foreground at rest. The parent link's `group/category` coordinates arrow rotation with the inherited magenta `accent` color on hover and keyboard focus; both transitions use 300ms ease-out. Reduced motion removes transitions. Links retain a visible focus outline and no underline. The four exact stored category names stay on one line from `md`. Each label uses `0.96 / measureArtistName(name)` times the available width after subtracting the arrow and gap; the padded list establishes the inline-size container so `cqw` excludes its padding. This naturally makes Música larger and Mercado Creativo y DAZ smaller. Mobile permits wrapping. No per-frame fitting, truncation or new dependency is used; render tests/math express fit intent, not pixel containment proof.

## Decorative distribution

`selectPosterMotifs` chooses one shared sequence at Astro build time, considering desktop, tablet and mobile placements together. CSS only changes positions: each tile keeps the same SVG/use, without extra markup or client JavaScript. Geometry and roster ordering remain owned by `calculatePosterLayout`.

- **Shape families:** seven groups; opposite chevrons share a family, as do all three rosettes and both orbits. Matching families cannot share an edge in any layout, including borders of mixed 1×1 and 2×2 rectangles. Corner-only repetitions receive a soft penalty.
- **Accent weights:** the eleven variants contain six magenta/rose-only, three cyan (lightning, cyan rosette/orbits) and two yellow (yellow rosette, sparks). Cumulative deficits favor that approximate 6:3:2 mix, not equal colored pixel areas or a rigid repeating sequence. Magenta remains predominant.
- **Soft balance:** recent and neighboring accent repetitions receive penalties; per-variant deficits keep individual designs in rotation. These preferences never override the edge rule. Catalog order breaks ties deterministically.

Run `pnpm --filter festival-2026 test src/features/poster/__tests__/poster-motif-distribution.test.ts` for responsive edge checks, prefix balance, color-gap bounds and unchanged shared-input behavior. Soft balance bounds describe the current roster/presets, not universal quotas for arbitrary future layouts.

## Hybrid sizing

Below `md`, explicit logical rows use content-sized tracks. Each full artist card remains eight columns wide and spans two logical rows, with a physical minimum height of three half-size modules (+50% from the original two-module minimum). Its interior separator is exactly one row of eight tiles (8×1), not two rows of four; the last card does not force a trailing separator. The tiles retain their proportions; doubling the mobile column count halves each decorative tile’s width and height. Artist wrappers retain two logical rows with content-sized tracks accommodating the taller physical minimum, so the card itself does not shrink with the separator. Artist labels refit within that footprint rather than increasing its height for long or enlarged names; the full card must not collapse to the smaller interior label. The minimum is applied on the outer artist-slot wrapper, whose container is the poster rather than the nested artist container. Information blocks can also grow with wrapping text; the hero spans two natural rows. Decorative slots keep a 160/152 aspect ratio. From `md`, proportional module heights become track minimums, with content-aware growth when text needs more room; decorative slots no longer impose their own aspect ratio. Content wrappers use grid stretching rather than percentage child heights. Information text contributes its natural height; artist text is fitted to its reserved area without overflowing into adjacent rows. Placement, roster order and adjacent tile reservations use the same calculation in every range; there is no second mobile render or browser packing engine.

`--unit` converts artwork coordinates into a geometric module based on the poster's available width. Keep it for proportional grid-track minimums and the mobile artist-slot height minimum, not for font sizes, padding or margins. The wider-screen title uses 4/3 of its three-column hero width to reach the existing fourth-column spill footprint. An inherited custom property containing `cqw` resolves that unit at its consumer; reusing the poster's formula inside a smaller container would incorrectly scale the title width a second time. Intrinsic SVG dimensions and the page's maximum width do not need blanket clamps.

Title, date and information text retain bounded `clamp()` utilities and their own inline-size containers. Artist names instead use server-measured uppercase Poppins 900 advances from `poppins-black-metrics.json`; `artist-name.ts` computes each name's width in em without a runtime font parser. The label's font size is the smaller of the width fit and height fit, with no percentage target or arbitrary font-size ceiling. Artist spacing uses Tailwind's rem-based scale: the whole name-and-schedule composition is inset 1.5rem horizontally and `min(1.5rem, 15%)` vertically. This leaves a balanced black border above and below the full composition without collapsing the name area in short mobile slots; the name refits inside the remaining space. Three grid rows reserve the artist schedule's natural height: the name uses the flexible first row, the magenta surface extends through the second row, and the horizontally centered schedule spans the second and third rows. This overlaps half the schedule over the surface's lower edge without placing letters underneath it. The name's size container reserves another 0.75rem horizontally, 0.125rem above and 0.25rem below as breathing room. Hover moves the name and schedule slightly without underlining the name. Keyboard focus uses the fallback anchor's visible outline without translating the surface, title, date or Ver más; returning focus after the modal therefore does not introduce a second 2px/4px movement. Reduced motion removes hover movement. The square schedule label uses `primary` / `background`, 0.75rem horizontal padding and 0.25rem vertical padding. Its font is bounded by the available card width minus its padding (with a 14em text measure) and 0.75rem; it reads each artist's editable `date.day` and `date.time` as “Sábado 28 - 23:00hrs” for the current data. No machine datetime is inferred from those strings. The smaller mobile vertical inset leaves usable name space within the naturally shorter four-column module. Spacing grows with the root font size; enlarged spacing leaves less room for the automatically fitted letters and does not guarantee text-resize accessibility. For each possible line count, dynamic programming finds the word-boundary composition with the narrowest maximum line. The server calculates the aspect-ratio intervals where each composition gives the largest fitting font; CSS container queries select the winner using the real available width and height. Ties prefer fewer lines. Native aspect queries can quantize fractional dimensions near a switching boundary; rendered optimality and containment allow at most one CSS pixel of rounding. GEPE remains one line; compound names can wrap without increasing their slots. Names remain a single copy of selectable HTML and require no client JavaScript. Regenerate the committed metrics when changing Poppins 900; unsupported characters fail explicitly instead of silently using incorrect widths. `tests/e2e/arc2026-artist-sizing.spec.ts` checks actual label containment, maximum occupation in at least one dimension, and GEPE's equal-or-larger size across breakpoint edges (short cards can make both names height-limited). Title text stays in normal flow and can wrap beyond its four authored groups when space or enlarged text requires it.

After a fresh root build, run `pnpm exec playwright test tests/e2e/arc2026-hybrid-sizing.spec.ts` in addition to the existing browser checks. It exercises fixed mobile artist footprints under root text enlargement, readable text, artist uniqueness, breakpoint edges and 200% root text sizing. Artist labels refit rather than guaranteeing that their font grows under text-only enlargement; this is the explicitly selected fixed-slot behavior, not a claim of WCAG text-resize compliance. Its halved CSS viewport case approximates zoom-induced reflow only: it is not native browser zoom, and `deviceScaleFactor` changes raster density rather than zoom. The same suite compares every full mobile artist card against four live adjacent decorative slots, without freezing pixel dimensions or label size. Passing rendered checks, not the sizing formulas alone, is the fit evidence. The artist-sizing suite also compares the rendered font against every candidate's mathematical maximum and checks that multiline names wrap when that permits larger text.

## Poster styling

The shared composition in `PosterGrid.astro` and the poster components (including the content-independent `PosterInformation` base and its `PosterProgram` / `PosterDisciplines` wrappers) use statically detectable Tailwind 4.1 utilities, with no authored static style blocks. `ArtistName` additionally emits server-generated font-fit container-query rules for its measured word compositions; presentation utilities remain Tailwind. Shared slot strings and the motif color map contain complete utility names, not interpolated fragments. Unused legacy styling classes are removed; `information-slot` and `pattern-slot` remain because browser tests consume them. Functional data attributes and shared navbar hooks are preserved.

`PosterGrid.astro` assigns runtime CSS variables from `calculatePosterLayout` and the existing presets. Utilities consume those values for grid placement and container-relative sizing. Responsive utilities are mobile-first: unprefixed styles define the phone layout, `md:` selects tablet from 48rem (768px), and `xl:` selects desktop from 80rem (1280px). The 1200–1279px range now intentionally uses the tablet layout, with no custom breakpoint overrides. Colors and fonts reuse the installed theme tokens. Intrinsic SVG geometry stays in the artwork, not in styling utilities.

Run `pnpm --filter festival-2026 test src/features/poster/__tests__/poster-grid.test.ts src/features/poster/__tests__/poster-motifs.test.ts` for layout-algorithm and stable tile checks. Tests protect functionality and the accepted decorative tile artwork, including raster seams; they do not freeze typography, page composition, utility classes or source structure. The shell and infrastructure utility boundary is described below.

## Shell and infrastructure styling

`Header` consumes `@festivalarc/ui/FestivalNavbar.astro` on the homepage and existing detail routes. Its minimum height follows ARC 2024 (72px); logo/date are required, location/links/CTA are optional, and Ediciones lists every other edition. This edition supplies Inicio plus four category links and opts into centered desktop links, no underlines and pathname-based active semantics; its edition-local wrapper colors active links, navigation hover and keyboard focus `arc-yellow`. Exact pages use `aria-current='page'`, canonical participant descendants mark the parent category with `'true'`, and home is exact-only, including a publication base. The opened mobile panel contains the same five destinations and active state. Four 16×16 decorative separators sit between the five desktop links, using fixed distinct canonical chevrons, rosette, lightning and sparks. `NavigationTile.astro` references the original `poster-motifs.svg` as an external URL plus symbol fragment, so fallback pages need neither grid definitions nor duplicated global SVG IDs. The shared package imports no edition artwork. Other consumers retain the shared navbar's default layout. The confirmed header copy is “28 y 29 de noviembre” (2026) and “Plaza de Armas de La Serena”. Header colors are inherited CSS tokens assigned using Tailwind utilities. See `packages/ui/README.md` for slots, tokens, public styling hooks and mobile dialog behavior. Historical apps are not migrated; the old `PreviousEditions` source is retained but no longer used by Header.

`features/artists/ArtistDetail.astro` consumes the narrow build-only `ParticipantView`, supports nullable local images through native Astro Image, and omits missing performer metadata/media columns. It renders safe absolute HTTP(S) ticket links only. All 93 participants have canonical `/<public-category-slug>/<participant-id>/` fallbacks; `/artistas/` is removed without aliases or redirects.

`styles/global.css` retains the Tailwind import and existing color/font theme tokens, and explicitly scans `packages/ui/src` with `@source`. The single `layouts/Layout.astro` delivers both local fonts and all metadata. Layout utilities carry page sizing, body typography/color and low-specificity heading/link defaults. The `:where()` variants deliberately allow existing element utilities to override those defaults, including the edition links' outline-style override. Existing layout, footer and poster utilities are not rewritten.

Run `pnpm --filter festival-2026 test` and `pnpm build`, then the browser checks in the quick path. Navbar tests cover required/optional slots, accessible content, mobile keyboard/focus/resize behavior, edition links and public customization. `EventModal.astro`, `event-modal.ts` and `event-modal-motion.ts` own one scoped dialog, its connection lifecycle and its independent GSAP paint layers. No per-card listeners, client packing or runtime catalog imports are added. Normal modified links retain browser intent; successful unmodified activation opens the modal without URL/history changes. Failed setup leaves anchors usable; failed opening releases partial locks/paint and navigates to that anchor.

## Rendering and boundaries

- `pages/index.astro` and `pages/[category]/index.astro` select scope and metadata; `PosterGrid.astro` owns their shared composition and responsive geometry. `ArtistName.astro` renders each name, data-driven schedule and full-card canonical fallback anchor using the existing local Poppins 900 delivery, retaining hover, keyboard-focus and reduced-motion states. `data-event-scope` identifies the shared root; anchors expose `data-event-trigger` and stable `data-event-id` for the shared modal. `PosterGrid` prerenders templates only for its selected participants; names/descriptions remain escaped Astro output. Static `ArtistDetail` semantics remain the direct-load fallback. Native modality, focus and scroll ownership persist throughout reverse; body overflow is clipped while the document remains scroll-locked, keeping the sticky header in place beneath the native backdrop; the source link remains in its unchanged grid cell. Only its shared surface and name paint are temporarily hidden with owned, reversible visibility declarations. Source date/Ver más fade from their captured opacity to hidden during the first 150ms alongside opening, and back during the final 150ms of reverse. This adds no stage to the 450ms score and no fade-owned scroll lock. The controller owns only source opacity/visibility restoration and the hidden open endpoint; motion disposal during resize/font settlement keeps metadata hidden, and a rebuilt reverse starts hidden. Reduced motion uses immediate hidden/restored endpoints. Original declarations and priorities return through the same cleanup as the shared surface/name.
- `PosterPattern.astro` bleeds decorative SVGs by 0.5 CSS pixels per side to cover subpixel seams. Grid cells keep their original dimensions; curves and diagonals retain normal antialiasing. Do not clip this bleed at each cell or combine it with global `crispEdges`. Regression check: `pnpm exec playwright test tests/e2e/arc2026-pattern-seams.spec.ts` after the root build.
- `PosterIntro.astro` renders the title as selectable HTML in four authored groups that may wrap further: “EL ARTE / DE HABITAR / LA / CIUDAD”, using local Poppins Black 900 as an approximation of the supplied artwork, not an identification of its original typeface. Tight tracking, compact leading, foreground white, cyan (`#5ce1e6`) and magenta (`#e50070`) preserve the approved title appearance without loading `LOGO_HERO.png`. Below `md`, only the intro's date/title content has a 1rem horizontal inset. Its inner inline-size container excludes that padding so container-relative type refits inside the available width. The header, poster grid, first artist and shared information wrapper are not padded. The longest line nearly fills the inset hero width and its height grows naturally with the text; a full-width wrapper alone is not sufficient. From `md`, the heading explicitly reaches four columns using 4/3 of the hero width, but only “DE HABITAR” uses that extra measure; the other groups stay within the three-column hero. Independent rem-plus-local-container clamps keep dates smaller than the title, with a spacing-scale gap between them. Normal widths retain the four authored lines; enlarged text may wrap within groups, including long words, rather than clipping or painting over adjacent slots. Visible dates use the confirmed festival dates, 28–29 November 2026; they do not assign artists to days.

Title-specific browser coverage: after the root build, run `pnpm exec playwright test tests/e2e/arc2026-poster-title.spec.ts`. It checks accessible copy, loaded Poppins 900, normal four-line grouping, relative date hierarchy, near-full mobile text measure, reserved spill containment, clipping and artist-text separation at 320, 390, 767, 768, 1024, 1279, 1280, 1440 and 1920px, both normally and with 200% root text. This is text enlargement, not native browser zoom. Title tuning must not change artist-card geometry or the existing functional test policy. `tests/e2e/arc2026-artist-cards.spec.ts` checks schedule copy, colors, square corners, spacing, containment, horizontal centering, overlap and balanced outer black spacing at mobile/tablet/desktop widths, city-free names with descriptors preserved, and the full-card surface's hover, focus and reduced-motion response. Its old button selectors require migration before that separately authorized browser suite runs; no browser evidence is claimed for this routing stage.
- `poster-motifs.svg` retains the accepted design export, except for `lightning`: its four cyan triangles use straight vector edges rather than the source JPEG's traced pixel steps. Preserve its magenta background, cyan fill and alternating arrangement.
- The homepage and artist-detail routes use `layouts/Layout.astro` for the document shell, metadata, fonts, shared Header and Footer.
- Homepage/category grids and canonical details derive from one validated catalog; the Astro artist collection retains only the 46 music/stage works. Finite day plans, stable hooks and one scoped filter adapter implement day recomposition without a client catalog/store or poster entrance animation. The modal has a separate surface and semantics-hidden text-only title proxy, so its paint can grow/travel without scaling readable body text or changing grid geometry. It supports reduced-motion endpoints and safe settlement on resize/font/image changes. During opening, window/visual viewport resize, root size, font and image notifications coalesce until the entrance completes, then refresh the title from current source geometry; they do not cancel the entrance. Closing can still reverse an unfinished entrance and discards deferred adjustments; enabling reduced motion settles immediately. Once open, notifications retain immediate settlement. This protects opening from mobile viewport changes, but the reported real-phone Brave cause remains unconfirmed. Long content scrolls internally with close/actions outside the body scroller. Focused modal Vitest tests mock native dialog and GSAP; they do not establish visual quality, device performance or native-browser accessibility. Nonvisual static-browser checks and their outstanding limitations are recorded in the mobile-modal task; no visual checks were performed. The navbar uses the existing workspace UI dependency and navigation script.

Known sizing limitation: at a 320px viewport with 200% root text, the existing rem-based insets can leave no height for artist lettering. This predates the architecture refactor and is not a passing accessibility check.

Design authority and evidence: `odd/tasks/arc2026-static-grid.md`; accepted artboard: `design/arc2026-slot-grid/02-poster-grid.html`.
