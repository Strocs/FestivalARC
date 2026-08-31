# Sync Report — festivalarc-annual-monorepo

## Status

**synced** — the verified change specification was merged into the canonical OpenSpec specification tree. The change remains active; archive and delivery were not performed.

## Structured status and action context

- Change: `festivalarc-annual-monorepo`
- Artifact store: `openspec`
- Workspace: `/home/strocs/dev/FestivalARC`
- Action context: `repo-local`; allowed edit surface: `openspec/**`
- Parent-authoritative status: 39/39 implementation tasks complete; final verification PASS; no blockers.
- Verification evidence revision: `sha256:d64a998e5a33ea45427fb970f698039cacd36afe88c0c4154ab7afa463b52d23`
- Former build race and manifest nondeterminism blockers: resolved.

## Domains synced

- `annual-publishing`

## Canonical files updated

- `openspec/specs/annual-publishing/spec.md` — created from the directory-backed change specification because no canonical domain spec existed.
- `openspec/changes/festivalarc-annual-monorepo/sync-report.md` — created as the required sync artifact.

## Requirement delta

The source domain specification is a complete new canonical domain specification, not a delta document with ADDED/MODIFIED/REMOVED sections.

- ADDED requirements: all 11 requirements in `annual-publishing/spec.md` were added to the new canonical file:
  1. Independent workspace and edition boundaries
  2. Active and archived publication boundaries
  3. Temporary calls lifecycle
  4. Base-aware publication URLs
  5. Sitemap and robots publication behavior
  6. Typed deterministic composition and ownership
  7. Global deployment file ownership
  8. 2025 compatibility baseline
  9. Independent builds and one static deployment
  10. Annual operational repeatability
  11. Standard verification evidence
- MODIFIED requirements: none
- REMOVED requirements: none
- RENAMED requirements: none

## Guardrails and approvals

- Legacy flat change spec: not present; the source is directory-backed.
- Existing canonical domain spec: absent, so no same-domain replacement or destructive merge was required.
- Active same-domain collisions: none observed.
- Destructive sync approval: not applicable.
- No product code, human documentation, generated outputs, Git state, or protected/user paths were edited.

## Validation performed

- Read proposal, domain spec, design, tasks, apply progress, verify report, archive report, and `openspec/config.yaml`.
- Confirmed the verification report is clearly passing with zero blockers and zero critical findings.
- Confirmed `tasks.md` records 39/39 implementation tasks complete.
- Confirmed the canonical spec is byte-identical to the source domain spec using `cmp`.
- Confirmed the canonical file is readable and contains 11 named requirements.

## Risks

- The verified report retains non-blocking historical warnings, including incomplete pre-migration HTML/screenshot oracle evidence and non-fatal build warnings; these do not block sync.
- Archive remains a separate next phase and was not performed.

## Next recommendation

`sdd-archive` when the parent is ready.
