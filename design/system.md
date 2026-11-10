# ARC 2026 — active-edition contract

Foundation for the Astro prototype, not a standalone HTML mockup. Decision source:
`odd/tasks/arc2026-prototype.md`, S2–S36 and its Log. T1 prepares documentation,
dependencies and data; it neither applies these tokens to CSS nor changes the homepage or indexation.

## Sampled palette: observed source and authorized use

Source: `refs/afiche-diseño.jpeg`, 1280 × 1600, sRGB. Pixels read with
ImageMagick `magick … -format '%[pixel:p{x,y}]' info:`. Coordinates use the
top-left origin and are zero-based. Approximate JPEG values, **not an official
vector palette**: edges and other regions may vary because of compression.
The following names identify the sampled palette, applied as T2 CSS tokens below.

| Token | sRGB / hex sample | Pixel (x, y) | Observed region → prototype role |
| --- | --- | --- | --- |
| arc-pink | 255, 0, 138 / `#ff008a` | 20, 180 | Upper background → expressive surface and patterns |
| arc-rose | 255, 100, 207 / `#ff64cf` | 700, 20 | Upper arrow → pattern counterpoint |
| arc-cyan | 0, 255, 255 / `#00ffff` | 910, 40 | Upper lightning bolt → identity/accent |
| arc-yellow | 248, 231, 1 / `#f8e701` | 880, 230 | Right yellow module → patterns |
| arc-ink | 0, 15, 22 / `#000f16` | 400, 400 | Central dark field → information bands |
| arc-paper | 255, 255, 253 / `#fffffd` | 50, 550 | White interior of headline → text on dark backgrounds |

Extraction and color approximation are authorized (S9). The roles follow the
source artwork; they do not authorize text combinations without contrast measurement.

## Observed code baseline — separate from the new direction

Source: `apps/festival-2026/src/styles/global.css` at the T1 baseline (before T2).

| Existing token | Observed value | Declared use |
| --- | --- | --- |
| --color-background | `#000000` | Background |
| --color-foreground | `#d5d5d5` | Foreground |
| --color-primary | `#5ce1e6` | Primary |
| --color-accent | `#e50070` | Accent |
| --font-sans | `var(--font-poppins), sans-serif` | Current sans |

`apps/festival-2026/astro.config.mjs` declares Poppins through Fontsource, weights
200/300/400/600/700/800/900, normal, latin. T1 does not change this.
The observed CSS also sets the body margin to zero and minimum height to 100%.
It declares no spacing scale, radii or shadows: no scale is invented here.

## Approved direction for T2/T3

| Area | Contract |
| --- | --- |
| Typography | Heavy, condensed sans (S6/S9). S19/S24 supersede the initial system approximation: Anton normal 400 for display headings, Poppins for reading, both through Astro's integrated Google provider and locally served static assets. This is the selected prototype pairing, not identification of the poster's official typeface. |
| Composition | Mosaic as the focal point; square artist/pattern modules without gaps or radii. S20–S23: plain title inside the grid, spanning 3/6 desktop, 2/4 tablet, 2/2 mobile columns; title is the non-square exception, one tile-row high on desktop/tablet and natural-height on mobile (S25). Remaining DOM sequence strictly alternates pattern/artist, starting with pattern. At >=1200px content width is min(viewport − 64px, 1440px), centered; below this breakpoint there are no outer grid gutters. No fixed tile-count requirement or filler. |
| Active vs. decorative | Current pass (S13/S17): image-only artist links with meaningful accessible names, no visible metadata/bands/counters. Complete data remains in detail; readable card metadata is deferred. Patterns are decorative, without Tab stops or announcements; SVGs reconstruct raster geometry, not vector originals. |
| Navigation | Compact sticky bar, always visible. A single vertical page scroll, without horizontal scrolling at 320 CSS px. No new dimensions are set here. |
| Detail | Same artwork enlarged, above the homepage and with its own URL. The direct route must work without JS. Escape, visible close control and focus restoration if the trigger is still present. Implementation reserved for T2/T3. |
| Motion | Expressive but controlled, transforming existing reconstructed shapes with GSAP/MorphSVG. S27: one-shot 600ms decorative entry and 250ms detail opening, no loops. Reduced motion omits nonessential animation; content, focus, URL changes and closing never wait for it. |
| Contrast | Normal text ≥ 4.5:1, large text ≥ 3:1, relevant UI ≥ 3:1 where applicable. Check text/bands, focus and controls in the final render; the palette alone does not certify AA. |
| Indexation | Preserve current behavior (S11). Do not add noindex. Visibly mark demonstration content in future renders. |

## Local data and static consumption

- `apps/festival-2026/src/content/{artists,activities,venues}/demo.json` separates
  identity, activities and venues. An artist may have multiple activities,
  disciplines and related venues; no biography or booking is invented.
- `src/features/arc2026/data/program.ts` uses `astro/zod` (API exported by installed
  Astro 7.2.9). `validateProgram` validates without mutating its argument: IDs and
  orders unique within each collection, existing references, `demo: true`, ISO dates
  with explicit timezone and optional HTTP(S) external links. Explicit editorial
  order is ascending, not inferred from dates, names or file position.
- `readLocalProgram()` returns the validated, ordered graph. All three loaders
  in `src/content.config.ts` reuse that function: build-time Astro collections,
  without fetch, CMS or backend. `activitiesForArtist` preserves that order;
  `formatActivityTime` presents in `es-CL`, `America/Santiago`, with a 24-hour clock.
- `demoLabel` must appear on the homepage/detail: «Demostración: artista, actividades, horarios y espacios no confirmados.»
  Each entity also retains `demo: true`.
  This is a prototype contract, not a publishing model for a confirmed lineup.
- Times on October 28/29, 2026, disciplines and «Espacio de ejemplo» are
  **structural examples**, not an official schedule. The day/time/venue printed
  on the raster card are not confirmed. There is no real ticket link or booking implementation.

The `src/…` paths in this section are relative to `apps/festival-2026/`.
Dependencies added only to that edition: `gsap` (includes `MorphSVGPlugin`) and
`nanostores`. No React, additional DrawSVG/Flip, router or new validation
dependency. T1 does not yet register plugins, create stores or deliver animations.

## Assets and provenance

Common destination: `apps/festival-2026/src/assets/arc2026/`. Byte-for-byte copies,
verified using SHA-256; originals in `refs/` remain intact.

| Local copy | Source | Limitation |
| --- | --- | --- |
| javiera-mena-demo.jpeg | `refs/ejemplo-artistas.jpeg` | 397 × 349; low resolution, already composited with portrait, ornaments and text. Not an original cutout; does not confirm participation, time or venue. Enlargement cannot recover detail. |
| arc26-logo.png | `refs/ChatGPT Image Aug 31, 2026, 11_14_27 AM.png` | Local ARC26 raster, 1961 × 802; no claim of a vector original or provenance beyond the received file. |

`src/features/arc2026/data/artwork.ts` exposes local imports to reuse exactly
the same artwork in the mosaic and detail. The poster, historical portraits
and external images are not copied to render this prototype.

## Approved first-pass refinements and boundaries

- Source image treatment (S13), verbatim: «se posiciona como cover, no la recortes
  explícitamente ni tampoco añades html arbitrario para llenar algo que aún no
  está cerrado.» Preserve the source asset; use CSS `object-fit: cover` inside
  square tiles. No generated crop, fill elements or newly reconstructed bands.
- Current-pass card appearance (S17): «Solo la imagen, sin capas nuevas por
  ahora». Do not add visible metadata, captions, badges or a counter to cards.
  The user explicitly postponed that PDF requirement. Keep a meaningful accessible
  link name and show complete demonstration activity data in the artist detail.
- Multiple activities (S15): «Primera actividad y contador» remains the preference
  for later visible metadata, not permission to implement that layer now.
- Columns (S14): six at >=1200 CSS px, four at 768-1199 px, two below 768 px;
  retain the approved visual balance between artists and decorative motifs.
- Motion (S16): «Entrada y transiciones, sin bucles». No continuous loops or
  added pause control; respect reduced motion and keep content available.
- New consequential editorial/design choices remain proposals subject to S2.
  First-prototype applied metrics are recorded below, not finalized brand decisions.
- No standalone artboard HTML, manifest or canvas. T1 did not change production
  CSS, indexation, homepage or overlays. T2/T3 may implement the approved real
  Astro prototype on dev; deployment and archived-edition changes remain excluded.

## T2 applied first-prototype values — not official brand metrics

- The sampled palette supplies background/foreground/primary/accent and rose/yellow
  pattern tokens. Initial T2 used the condensed system stack but Chromium rendered
  Liberation Sans; S19/S24 replace it with loaded Anton, not a renamed fallback.
- S20–S25 replace the former 30px / 36px title strip. The initial two-row draft
  was not approved: «Una fila — más compacto» fixes the half-width desktop/tablet
  title to one normal tile row. It has no row span or forced height; its contents
  fit beside square tiles without expanding their row. At >=768px, padding is
  16px, Anton heading clamp(44px, 9cqw, 64px) with line-height 1.05, and the
  existing 14px demo label has 20px line-height and 8px top spacing.
  Below 768px the full-width title retains natural height, 32px padding,
  clamp(48px, 13cqw, 96px) heading with line-height 1.1, and a 14px/24px label
  with 16px top spacing. Heading wrapping stays balanced; no clipping, truncation
  or hidden text is used. These are fitting metrics for the approved compact
  row, not official brand values. Incomplete final rows remain unfilled.
  Detail heading stays 36px / 60px, section heading 24px, padding 16px / 32px.
  These applied metrics are first-prototype implementation values, not official
  brand metrics or a new type/spacing scale.
- Header reuses the edition navigation and its padding, with a 96px / 112px-wide
  local logo; sticky at top, no confirmed date or venue copy. Its inherited
  transition/transform rules are disabled in this shell: T2 adds no motion.
- The existing demo references and motifs are retained, now strictly interleaved
  pattern/artist in DOM order. No artists are hidden, no filler is added, and no
  fixed 12/12 count is asserted by the tests. Six columns at 1200px, four at 768px,
  two below; desktop content capped at 1440px with >=32px centered margins.
  Header/footer spacing remains unchanged by this revision.
- Artist tiles contain only the unchanged imported JPEG and native link. The
  source's own raster text remains; no HTML metadata, crop generation or fill is
  added. CSS cover centers the image inside the square. The detail preserves the
  full original aspect ratio and enlarges it into half the desktop layout/full
  mobile width; low-resolution source limitations remain visible.
- Six SVG motifs reconstruct poster arrows, lightning, star, petals, orbits and
  curved sparks. No interaction, focus targets or announced content. No originals
  or derived raster assets are changed.
- `ArtistDetail.astro` takes the validated artist/program and reuses ordered
  activity/time helpers. T2 supplies the direct static route; T3 reuses the same
  component with an optional heading ID and h2/h3/h4 hierarchy inside the dialog.
  Standalone defaults retain h1/h2/h3 and emit no IDs.
- Root title/description/canonical defaults and indexing policy remain unchanged.
  The new artist route supplies its own demonstration title/description and uses
  the existing layout's base-aware canonical logic. Existing footer is reused.
## Font delivery and redistribution provenance (S19/S24)

- Official integrated mechanism: `fonts` in `astro.config.mjs`,
  `fontProviders.google()` for Anton and Poppins, and `Font` from `astro:assets`
  in the shared layout. Astro resolves/downloads at build time and copies fonts
  to local static assets. No Google browser stylesheet, import, CDN link or
  preconnect is added. No npm integration/package changes.
- Anton is normal 400 only; heading styles explicitly retain 400 and disable
  font synthesis. Poppins retains the pre-existing normal latin reading weights
  200/300/400/600/700/800/900. The T1 Fontsource baseline above remains historical.
- API references: https://v6.docs.astro.build/en/guides/fonts/ and
  https://v6.docs.astro.build/en/reference/font-provider-reference/ .
- Official Anton metadata identifies normal 400, designer Vernon Adams and OFL:
  https://github.com/google/fonts/blob/main/ofl/anton/METADATA.pb .
- Unchanged upstream copyright notices and complete SIL OFL 1.1 text are shipped
  in `public/fonts/Anton-OFL.txt` and `public/fonts/Poppins-OFL.txt`, fetched from
  https://raw.githubusercontent.com/google/fonts/main/ofl/anton/OFL.txt and
  https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/OFL.txt .
  Copyright is attributed to the respective 2020 project authors exactly as
  supplied; these notices accompany the generated static distribution. Repository
  copies normalize CRLF to LF and remove trailing whitespace only; copyright
  wording and all license tokens are unchanged.
- Browser tests inspect actual Chromium platform fonts for homepage/detail h1,
  not just CSS declarations, and isolate active-edition font requests from archive
  navigation. Responsive geometry checks cover 1920/1440/1200/1199/768/767/320px.
- Observed local GREEN: Chromium reports `Anton-Regular`, custom font, 27 heading
  glyphs on `/` and 12 on `/artistas/javiera-mena/`, with computed weight 400.
  Both routes request only same-origin `/_astro/fonts/*.woff2` assets; no external
  browser requests occur in this isolated font check. Root composition copies
  eight font files; the two complete OFL notices are included in public output.

## T3 progressive enhancement (S5–S8, S26–S29)

Artist anchors retain their canonical static URLs. Unmodified click, Enter and
touch open a named native `dialog`; modified/middle clicks remain browser-native.
Reloading or sharing the artist URL serves the standalone, no-JavaScript route.
The static artwork and validated activities come from `ArtistDetail.astro` in
both presentations, not a second browser data graph or fetch.

- **Presentation:** desktop/tablet (>=768px) is centered, max 1440px wide, with
  >=32px margins on all sides. Mobile is full-screen (`100dvh`). The dialog owns
  scrolling; the underlying page is locked at its original position. A sticky,
  visible «Cerrar ficha» button and Escape dismiss immediately. Native modality
  contains focus; closing returns it to the exact connected mosaic trigger.
- **Navigation:** `enhance.ts` synchronizes the dialog from the pathname on click,
  Back/Forward and restoration. Pushed entries preserve unrelated history state.
  The Nanostores selection atom coordinates only native presentation and cosmetic
  motion; it is not navigation authority or a duplicated content model.
- **Cleanup:** pagehide/Astro before-swap abort local listeners, disconnect the
  observer, unsubscribe motion, kill tweens, close the dialog and release locks.
  BFCache pageshow/Astro page-load reinitialize without duplicating handlers.
  Locks restore only overflow values/priorities; motion restores only its owned
  opacity/path values. Unrelated inline properties remain untouched.
- **Motion:** dynamically loaded GSAP/MorphSVG morphs existing decorative paths
  from another existing poster reconstruction into their static shapes over
  600ms when first entering view. Rect/circle-only orbits stay static. Tile and
  grid geometry never animate. The already-open dialog fades from 0.7 to 1
  opacity over 250ms, never making information invisible. Download failure leaves
  fully functional native dialogs and static motifs. Initial reduced motion
  skips these tweens; changing to reduced motion kills them and restores final
  shapes/opacity. No loops, scroll manipulation, router or extra plugin.
- **Focus contrast:** image-only links now have adjacent paper/ink inset outlines,
  not cyan against pink (only 2.981:1). Paper/ink measures 19.422:1. The close
  button uses the same paper/ink roles; source raster text remains uncertified.

## S31–S36 proposal-phase override — approved constraints, not applied app metrics

Source: `odd/tasks/arc2026-prototype.md`, S31–S36 and L33–L35. The earlier
composition, width cap, strict alternation and motion entries above describe the
existing app, not the requested future revision. Preserve that historical evidence.

- S36 authorizes standalone artboards only for comparison before human selection;
  it supersedes the earlier no-artboard restriction for this phase alone. No app
  implementation, indexation, font delivery or interaction-stack change is implied.
- Approved future frame: fluid width, no max-width, four-sided padding 48px at
  >=1200px, 32px at 768–1199px, 16px below 768px. These are selected future
  constraints, not measurements of the current app.
- Full uncropped `apps/festival-2026/src/assets/LOGO_HERO.png`, 1920 × 520,
  replaces the text hero and visible description. Preserve an accessible h1/name.
- Artist squares span 2 × 2 small modules; each decorative square spans 1 × 1.
  Vary artist starts; mobile has one full-width artist column with small motif
  groups between cards. No fixed decorative column, card overlays or filler.
- No entrance, morphing, opening animation, transitions or smooth scrolling.
- The three layout densities/placements and direction 3 negative space are
  **proposals**, not approved production tokens or a new spacing scale.
- Artboards use only the six sampled poster colors above and `sans-serif`, the
  generic fallback already observed in the app stack. Self-contained canvas files
  cannot load the app fonts: small UI text is not rendered Poppins. Critical hero
  and card typography remains in unchanged embedded raster artwork. The approved
  app pairing remains Anton 400 / Poppins with Astro-local delivery (S24).
- Accessible proposal UI uses paper/ink (19.422:1, L22); focus uses adjacent ink
  and paper outlines. Raster text is not certified by this contrast measurement.

## Verification boundary

Independent T1 behavioral verification remains unavailable under the accepted
S18 disposition; T3 local functional checks do not replace it. S17 still defers
visible card metadata and counters. T3 does not alter indexation, fonts, source
assets, header/footer, archives or publishing behavior.
