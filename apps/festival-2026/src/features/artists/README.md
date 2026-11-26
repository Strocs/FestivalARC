# Participation details

Edit `src/content/artists.json`. Existing entries remain valid without the optional fields below.

- `location`: venue or stage name, displayed separately from the biography.
- `date.month`: optional month label (for example, `noviembre`), appended to the existing day without changing day-filter keys.
- `socialLinks.instagram`: HTTPS URL starting with `https://www.instagram.com/`.
- `socialLinks.spotify`: HTTPS URL starting with `https://open.spotify.com/`.

Social links use the Simple Icons provider through `astro-icon`, with accessible platform and participant labels. Links open in the current tab.

## Mercado Creativo y DAZ and Expo Arte.Co

Use `description` for optional participant copy, `socialLinks` for the supported networks above, and `website` for an optional absolute HTTP(S) URL. For Expo and Mercado, `socialLinks.instagram` accepts one URL or a nonempty array of URLs in display order; each URL must meet the same Instagram validation rule. Compare incoming names with the catalog using case-insensitive equality only; keep the stored name and confirm any other discrepancy before editing. Omitted or whitespace-only descriptions, with no links, leave the card passive. **Ver más** opens the shared dialog or follows the existing participant URL if JavaScript is disabled.

Images reference `/src/assets/` files and include alt text. Niño Cohete's source is `refs/IMG_4058.JPG.jpeg`; its WebP is auto-oriented, 600 × 900 px, quality 100, and 276,948 bytes. The original is preserved. Astro renders it at quality 100 with intrinsic dimensions.

## Música and Artes Escénicas

The title and social links stay together in the header, with space reserved for the close control. The detail body groups discipline/company near the name, followed by date/time and the larger venue label, then the biography. All body text occupies the left column; the 360 px image column starts at the discipline from the medium breakpoint. Narrow screens stack the complete text column before the image. The modal keeps its fixed title/close control and single vertically scrollable body; background scrolling remains locked.
