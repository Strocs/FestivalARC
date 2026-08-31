```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:d64a998e5a33ea45427fb970f698039cacd36afe88c0c4154ab7afa463b52d23
verdict: pass
blockers: 0
critical_findings: 0
requirements: 11/11
scenarios: 16/16
test_command: CI=1 pnpm test
test_exit_code: 0
test_output_hash: sha256:fa47cad51888e64e8ebb8e1cac247997b6758bddfdc30fc5c398ed463d930c41
build_command: pnpm build
build_exit_code: 0
build_output_hash: sha256:fe1de85e29627cf995f74f9b989eb9b476dd4445acace86fac8f3d6271d3bf39
```

# Verification Report — festivalarc-annual-monorepo

## Verdict

**PASS — Slice 10 implementation is independently verified.** The two former CRITICAL blockers were re-probed: Turbo completed without the ARC2023 shared-output race, and repeated composed builds produced identical manifest evidence with no ARC2024 `server-render-time` values. No archive, delivery, commit, push, PR, review, receipt, or deployment action was performed.

## Structured status and action context

- Change: `festivalarc-annual-monorepo`.
- Artifact store: `openspec`; authoritative change root: `openspec/changes/festivalarc-annual-monorepo`.
- Native status consumed before verification: all 39 implementation tasks complete, `applyState: all_done`, `actionContext.mode: repo-local`, workspace root `/home/strocs/dev/FestivalARC`, allowed edit root `/home/strocs/dev/FestivalARC`.
- The native status still described the prior stale report as `nextRecommended: remediate`; the parent-provided maintainer-authorized reset and active `proceed` token authorized this fresh verification. This actor did not acquire, reset, or settle runtime authority.
- Strict TDD: inactive for this change (`openspec/config.yaml` sets `strict_tdd: false`).
- Review/receipt gate: not run; receipt-driven review is disabled and was not enabled.

## Spec and scenario coverage

All 11 requirements and 16 scenarios in `specs/annual-publishing/spec.md` were reviewed against the current implementation, tests, generated output, and browser evidence.

| Requirement | Result | Evidence |
|---|---|---|
| Independent workspace and edition boundaries | PASS | Seven workspace packages type/build; ARC2023, ARC2024, ARC2025, and calls retain separate application boundaries. |
| Active and archived publication boundaries | PASS | Checked-in configuration selects one root calls publication and final archives at `/ediciones/2023` and `/ediciones/2024`; composed output contains those destinations only. |
| Temporary calls lifecycle | PASS | Chromium and composition tests verify root calls publication, no `/ediciones/2026`, replacement removal, and failed-composition preservation. |
| Base-aware publication URLs | PASS | Browser routes, canonical/Open Graph metadata, navigation, CSS, image, and nested archive references resolve beneath configured bases. |
| Sitemap and robots behavior | PASS | 106 emitted page URLs are represented in the distribution sitemap; robots points to the composed sitemap. |
| Typed deterministic composition and ownership | PASS | Distribution tests pass; sorted manifest and repeated-build evidence are identical; ownership and atomic-failure cases are covered. |
| Global deployment file ownership | PASS | Exactly one neutral distribution-owned `404.html`, `robots.txt`, `sitemap-0.xml`, and `sitemap-index.xml` are present. |
| 2025 compatibility baseline | PASS with documented warning | Existing Slice 6 parity evidence and maintainer-approved differences are retained; the known absence of pre-migration HTML/screenshot captures remains documented. |
| Independent builds and one static deployment | PASS | `pnpm turbo run build` completed 5/5 tasks; direct composition produced `.output`; only the root `vercel.json` publishes `.output`. |
| Annual operational repeatability | PASS | `docs/annual-publishing.md` documents calls, rollover, archives, future editions, evidence, and rollback. |
| Standard verification evidence | PASS | Required type, tests, independent Turbo build, direct build, distribution checks, and Chromium-only E2E passed. |

## Task completion

- `tasks.md`: **39/39 implementation tasks checked**.
- Unchecked implementation task markers matching `^\s*- \[ \]`: **none**.
- Parent-owned lifecycle actions remain deferred by instruction; they are not implementation task blockers.

## Exact validation commands

Output hashes below are SHA-256 hashes of the captured command output logs.

| Exact command | Exit | Result | Output hash |
|---|---:|---|---|
| `pnpm type` | 0 | PASS; all seven workspace type scripts completed, with 2 ARC2023 hints and 1 ARC2024 hint, no errors | `sha256:723f558ffa3590300b468aacedddd3eeafb0c86a970bc2a4f61e8a2619425057` |
| `CI=1 pnpm test` | 0 | PASS; 12 Vitest files / 76 tests plus focused Node suites passed | `sha256:fa47cad51888e64e8ebb8e1cac247997b6758bddfdc30fc5c398ed463d930c41` |
| `pnpm turbo run build` | 0 | PASS; 5/5 tasks completed, including concurrent application and distribution builds | `sha256:47f44de0b7577cba1b3be65f2411b46dc2a29df4ba98b38e42e063a592a3ed81` |
| `pnpm build` — first run | 0 | PASS; composed 350 files | `sha256:36095e3c76bcd310c5ed6e29441a661fd7cb24ddbcfb91f02bfe79e3096ff3` |
| `pnpm build` — second run | 0 | PASS; composed 350 files with the same manifest hash | `sha256:fe1de85e29627cf995f74f9b989eb9b476dd4445acace86fac8f3d6271d3bf39` |
| `pnpm --dir tooling/distribution type` | 0 | PASS | `sha256:47cdc39a9cef04ed331b6935bc4dc2a18778b9ec6950ab0236520743b122a73e` |
| `CI=1 pnpm --dir tooling/distribution test` | 0 | PASS; 1 file / 15 tests | `sha256:5eb93b1f9eccbb6152a7dd2659ef23f90efdfd6a3e462632d8ae7862d4ffd97f` |
| `CI=1 pnpm run test:e2e` | 0 | PASS; 6/6 tests, Chromium only, one worker | `sha256:3001bf202ac49e9d110dcc3e5a721930a89b24dec6b3f01d2018c4f152147370` |

Supplemental `git diff --check` exited 2 because the pre-existing modified `apply-progress.md` has a blank line at EOF. No edit was made because the allowed edit surface was only this report. Output hash: `sha256:cbf4063312da742fcbc2a4ff068751089b456a96d5c8cdc99e25b2875159656a`.

## Former CRITICAL blocker re-probes

### ARC2023 concurrent shared-output race

- The fresh `pnpm turbo run build` exercised the former topology: Turbo launched the standalone ARC2023 build concurrently with the distribution build, which also builds ARC2023. It completed successfully with no missing `dist/entry.mjs`, `.astro` asset, or partial-output error.
- A direct concurrent isolation probe also launched two simultaneous commands with separate `DISTRIBUTION_OUTPUT_DIR` values:
  - `PUBLICATION_BASE=/ediciones/2023 DISTRIBUTION_OUTPUT_DIR=<temporary>/one pnpm --dir apps/festival-2023 build` — exit 0, 217 files, 44,134,465 bytes.
  - `PUBLICATION_BASE=/ediciones/2023 DISTRIBUTION_OUTPUT_DIR=<temporary>/two pnpm --dir apps/festival-2023 build` — exit 0, 217 files, 44,134,465 bytes.
- Both isolated output trees had identical tree hash `sha256:078134900642f55e44dc575d145eed8611395552a86f0360d76927fea083d7e8`.
- The temporary concurrent output directory was removed after the probe.

### ARC2024 render-time nondeterministic manifests

- The package test `apps/festival-2024/scripts/build-determinism.test.mjs` passed 1/1, running two builds with `NODE_ENV=development` and asserting byte equality for every emitted HTML file and absence of `server-render-time`.
- Two fresh sequential root `pnpm build` runs both exited 0 and both printed manifest SHA-256 `sha256:2d1d83be1cce64bbf200dfbbc06111deb62cf856e1db25481ba87bc86249f775`.
- The retained composed output scan found zero ARC2024 files containing `server-render-time`.

## Retained output and manifest evidence

- `.output`: 350 files, 71,822,782 bytes.
- `.distribution-manifest.json`: 350 entries, matching all `.output` paths, byte counts, and SHA-256 values.
- Manifest-content SHA-256: `sha256:393c727433e5a37d4d6e5a45e2bfc5480d692b49691531e6c8ee243836e0f2a1`.
- Manifest file SHA-256: `sha256:3ed878973468e4163c4643909a3abfa6f84158e5a88985175bbda7b582b3af64`.
- Output tree evidence SHA-256: `sha256:fab632b20f0491250905d5035ee44fa803f8a34c22ea9923a312345b370ce9c1`.
- Configuration SHA-256: `sha256:9a3c846ccc39015028eb8c2793ef64d3bc7f95d28883a1268f2ba18c5e57f95f`.
- Manifest ownership counts: distribution 4, calls-2026 6, festival-2023 217, festival-2024 123.
- Sitemap route count: 106.
- Global files: one `404.html`, one `robots.txt`, one `sitemap-0.xml`, and one `sitemap-index.xml`.
- Calls archive path `/ediciones/2026` is absent.

## Strict TDD and assertion quality

Strict TDD is **not active** for this change, so the mandatory strict-TDD evidence-table gate does not apply. The remediated blocker tests nevertheless assert observable build outputs: isolated output configuration, successful concurrent builds, exact HTML equality, and absence of timing attributes. No tautological or type-only assertion was identified in the focused blocker tests.

## Review workload and PR boundary

- `tasks.md` records high review risk, chained PRs, and `feature-branch-chain`.
- Slice 10 is the assigned boundary. Its five implementation rows are checked.
- The Slice 10 `size:exception` and bounded remediation are recorded in `apply-progress.md`; the remediation changed no task checkboxes and stayed within the supplied bound.
- No evidence of scope creep beyond Slice 10 remediation was found. No actual PR or branch delivery boundary was created, as required by the user.

## Cleanup and browser lifecycle

- Chromium-only Playwright E2E used the repository-managed web server and configured `/usr/sbin/chromium`; no Firefox or WebKit project was invoked.
- The Playwright-managed server and browser exited after E2E. A final process scan found no Chromium, Playwright, Astro, Vite, Turbo, pnpm, or HTTP server process.
- Task-owned `dist`, `.astro`, `.vercel`, `.turbo`, Playwright report, and `test-results` directories were removed.
- The temporary concurrent build directory was removed.
- Intended `.output` and sibling `.distribution-manifest.json` evidence were retained.
- The pre-existing protected/user-owned `.pi`, `refs`, `output`, and unrelated working-tree changes were not modified.

## Archive readiness

Verification is complete and no CRITICAL blocker remains. Archive and delivery were intentionally **not performed**. The parent must preserve the user-directed hold: close Slice 10, but do not archive or deliver.

## Risks and non-blocking findings

1. `git diff --check` reports one pre-existing blank line at EOF in `apply-progress.md`; this report did not modify that out-of-scope artifact.
2. The 2025 pre-migration HTML/screenshot oracle remains incomplete, as truthfully documented in the retained Slice 6 evidence and approved by the maintainer; current verification does not represent that limitation as a fabricated byte comparison.
3. Builds continue to emit non-fatal Astro dependency prompts and historical CSS-resolution warnings; all required commands exited 0 and browser asset requests returned successfully.

## Next recommendation

`archive` is the normal dependency-next phase after this passing verification, but it is intentionally deferred by the user's explicit instruction. Do not archive or deliver.

## Key Learnings

1. Per-process staging prevents concurrent historical Astro builds from corrupting shared application output.
2. Forcing production mode removes render-time metadata that otherwise destabilizes static manifests.
3. Matching manifest entries against output requires the compositor's normalized path-and-owner ordering.
