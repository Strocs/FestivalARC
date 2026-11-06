# ARC 2026 — active-edition contract

Foundation for the Astro prototype, not a standalone HTML mockup. Decision source:
`odd/tasks/arc2026-prototype.md`, S2–S12 and its Log. T1 prepares documentation,
dependencies and data; it neither applies these tokens to CSS nor changes the homepage or indexation.

## Sampled palette: observed source and authorized use

Source: `refs/afiche-diseño.jpeg`, 1280 × 1600, sRGB. Pixels read with
ImageMagick `magick … -format '%[pixel:p{x,y}]' info:`. Coordinates use the
top-left origin and are zero-based. Approximate JPEG values, **not an official
vector palette**: edges and other regions may vary because of compression.
The following names are contract identifiers, not yet CSS variables.

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

Source: `apps/festival-2026/src/styles/global.css` (unchanged).

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

## Approved direction for T2/T3 — not yet applied

| Area | Contract |
| --- | --- |
| Typography | Heavy, condensed sans (S6/S9). Authorized system approximation: `Impact, Haettenschweiler, 'Arial Narrow', sans-serif`. This neither identifies the poster's official typeface nor requires font downloads. Sizes and metrics remain to be checked in the prototype. |
| Composition | Mosaic as the focal point from the outset; balance between artists and patterns. Continuous grid, without gaps or radii, square modules (`aspect-ratio: 1`); faithful adaptation of the social-media artwork, not a gallery of historical portraits. |
| Active vs. decorative | Artist: real link/button with image, name, day and time; readable information in bands. Pattern: decorative, no Tab stop or empty announcement, no imitation link. Future SVGs will be reconstructions from raster, not vector originals. |
| Navigation | Compact sticky bar, always visible. A single vertical page scroll, without horizontal scrolling at 320 CSS px. No new dimensions are set here. |
| Detail | Same artwork enlarged, above the homepage and with its own URL. The direct route must work without JS. Escape, visible close control and focus restoration if the trigger is still present. Implementation reserved for T2/T3. |
| Motion | Expressive but controlled, transforming shapes with GSAP/MorphSVG. Respect `prefers-reduced-motion`: no forced scrolling/rotation; access to content must not depend on animation. Durations and choreography are undecided. |
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
- Type sizes and new consequential editorial/design choices remain proposals
  subject to S2. This document does not claim finalized metrics or choreography.
- No standalone artboard HTML, manifest or canvas. T1 did not change production
  CSS, indexation, homepage or overlays. T2/T3 may implement the approved real
  Astro prototype on dev; deployment and archived-edition changes remain excluded.
