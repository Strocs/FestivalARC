# Slice 2 semantic parity evidence

## Scope and decision

- Change: `festivalarc-annual-monorepo`
- Slice: 2 only (`apps/festival-2025` boundary); Slice 3 was not started.
- Criterion: maintainer-approved semantic parity, not literal generated-output byte parity.
- No new E2E test code was added. The existing `/programacion` Chromium headless smoke is the approved migration-boundary check. Richer interaction/status E2E is explicitly deferred to Slice 10.
- The parent already acquired the runtime attempt with `proceed`; this actor did not acquire or settle it.

## Ownership and file-preserving move

| Check | Result |
|---|---|
| Git renames | 174 `R100` renames; 0 non-100% renames |
| Pre-move source files | 111 |
| Moved app source files | 111 |
| Pre-move public files | 59 |
| Moved app public files | 59 |
| Duplicate root `src` owner | absent (`src/` does not exist) |
| Duplicate root `public` owner | absent (`public/` does not exist) |
| Cross-edition imports | none found |

The staged extraction remains file-preserving. Root command/config proxies and legacy wiring remain in place; no Slice 3 contracts or publication configuration were added.

## Public asset parity

Compared `HEAD:public/**` with `apps/festival-2025/public/**` by relative POSIX path and exact bytes:

- 59 paths before and after; path sets equal.
- 14,914,753 bytes before and after.
- 0 byte differences.

## Routes, HTTP behavior, and metadata/discovery

The isolated build emitted the same two page paths as the baseline: `index.html` and `programacion/index.html`. Dev-server HTTP checks returned:

- `GET /` -> `200`
- `GET /programacion` -> `200`
- `GET /does-not-exist` -> `404`

The emitted metadata remains semantically equivalent to the baseline for both pages: Festival ARC 2025 titles/descriptions, `https://festivalarc.com` Open Graph URL, `https://festivalarc.com/og_image.png` social image, `/ARC25.png` favicon, and `/sitemap-index.xml` sitemap link. The `/programacion` sitemap link is present in both compared outputs after rebuild; it is semantically equal and is not a Slice 2 migration regression.

Legacy discovery ownership remains unchanged for this slice:

- `robots.txt`: present, legacy app output, SHA-256 `fce62d8dc4c20f5ff56c09ab5014d576d13938ca02d1aeab5eed91c95efcffe4`; points to `https://www.festivalarc.com/sitemap-index.xml`.
- `sitemap-index.xml`: present, SHA-256 `6151a8519659dfd8b6b97ea49f7504a066050ded44cc1c3a421bfd0a4cdc8d0e`; references `https://festivalarc.com/sitemap-0.xml`.
- `sitemap-0.xml`: present, SHA-256 `152a50ba66787b0567f4d6a7320667a07d864cd85b152b2d44618638b7677951`; contains the root and `/programacion/` URLs.
- `404.html`: absent in the app output; ownership remains explicitly deferred to the future distribution compositor, not claimed by Slice 2.

## Static output semantic comparison

Baseline `dist` versus isolated `apps/festival-2025/dist`:

| Metric | Baseline | Isolated | Interpretation |
|---|---:|---:|---|
| Files | 75 | 75 | equal |
| Total bytes | 20,896,518 | 20,896,198 | isolated output is 320 bytes smaller |
| Normalized path set | — | equal | generated CSS hash name normalized |
| Stable generated assets | equal | equal | same bytes/hashes for non-CSS generated assets |
| Public copied assets | 59 | 59 | exact byte parity |

The only generated filename change is `_astro/index.CfrPN-dV.css` -> `_astro/index.B4mNX1Cw.css`. After replacing that generated hash name in the two page HTML files, both pages compare equal. The 320-byte total difference is confined to the generated CSS artifact (36,596 -> 36,276 bytes); it is recorded as build-output nondeterminism from generated CSS, not a source or rendered-semantic behavior change. This evidence does not claim literal byte parity for the complete output.

## Verification commands

All commands were run without dependency upgrades, source fixes, Slice 3 work, or delivery actions.

| Command | Outcome | Wall duration |
|---|---|---:|
| `pnpm type` | exit 0 | 25,173 ms |
| `CI=1 pnpm test` | exit 0; 10 files / 71 tests | 40,278 ms |
| `pnpm build` | exit 0; 2 pages built | 67,109 ms |
| `pnpm --dir apps/festival-2025 run type` | exit 0 | 21,876 ms |
| `CI=1 pnpm --dir apps/festival-2025 test` | exit 0; 10 files / 71 tests | 34,180 ms |
| `pnpm --dir apps/festival-2025 build` (clean generated-report inputs) | exit 0; 2 pages built | 61,183 ms |
| `CI=1 pnpm run test:e2e` | exit 0; 1 test passed in 44.9 s | 58,956 ms |

### Chromium-only proof

`apps/festival-2025/playwright.config.ts` declares only the `chromium` project with `browserName: 'chromium'`, `headless: true`, and executable `/usr/sbin/chromium` by default. The successful E2E run used the existing test only (`open /programacion`); no Firefox or WebKit project was configured, installed, or invoked. No interactive browser or `playwright-cli` was used.

## Cleanup

The E2E run generated only the allowed report artifacts under `apps/festival-2025/playwright-report/**` and `apps/festival-2025/test-results/**`; those directories are removed after this evidence capture. No `.gitignore`, `.pi/**`, or `refs/**` content was edited.

## Conclusion

Slice 2 semantic parity is satisfied under the approved criterion. The final Slice 2 implementation task may be marked complete. Remaining richer interaction/status browser coverage belongs to Slice 10 and is not a Slice 2 blocker.
