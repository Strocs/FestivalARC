# Annual publishing

This is the operating procedure for the yearly publication cycle: keep a temporary calls site at the root, then replace it with the completed final edition without turning calls into an archive.

## Current publication state

`editions.config.ts` is the source of truth. Today it selects:

| Role | Publication | Location |
| --- | --- | --- |
| Active calls | `calls-2026` | `/` |
| Final archive | `festival-2023` | `/ediciones/2023` |
| Final archive | `festival-2024` | `/ediciones/2024` |

The root development shortcut is separate: `pnpm dev` runs `festivalarc-2025`. Use the publication table and app-specific filters when working on the selected site.

## Publication states

| State | Configuration rule | Build base |
| --- | --- | --- |
| Calls period | One active `kind: calls` entry; no calls archive entry | `/` |
| Final active edition | One active `kind: final` entry | `/` |
| Completed edition | A `kind: final` archive with base `/ediciones/YYYY` | `/ediciones/YYYY` |

The editions package validates these invariants: IDs match their years (`festival-YYYY` or `calls-YYYY`), package names exist in the workspace, archive IDs and years are unique, and 404/robots/sitemap ownership remains with distribution.

## Calls period

To publish or maintain calls:

1. Create an independent `apps/calls-YYYY` Astro package with a `build` script.
2. Register its exact `package.json.name` in `knownWorkspacePackages` in `editions.config.ts`.
3. Select it as the single active publication with `kind: 'calls'`, `id: 'calls-YYYY'`, and `expiresWhenFinalPublished: true`.
4. Keep calls out of `archives`; calls have no archive base.
5. Build and inspect the composed root artifact.

Calls should use `PUBLICATION_BASE=/`. Distribution owns the global 404, robots, and sitemap files.

## Calls to final

Use this sequence when the final edition is ready:

1. **Build the final app independently.** Add the final `apps/festival-YYYY` package and confirm its routes, assets, and base-aware references. A final app must be static and honor both `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR`; see [Adding an app](adding-an-app.md).
2. **Create the final publication descriptor.** Its ID must be `festival-YYYY`, its year must equal the calls year, and its package name must match the new app exactly. The editions package's `createFinalPublication` and `replaceCallsWithFinal` helpers encode these rules for lifecycle code and tests.
3. **Validate the final app at the root.** Build it with `PUBLICATION_BASE=/`; the final active edition is served at `/`.
4. **Update the selection.** Replace the calls `active` entry with the final entry. Move the previous final active edition to `archives` with `base: /ediciones/YYYY` when there is one. Never add calls to `archives`.
5. **Remove calls from the final publication set.** The final configuration must not select calls as active or archive, and the completed artifact must contain no calls routes or calls data. Remove the calls app/config entry only after the final build has passed and the fallback is no longer needed.
6. **Run the full validation below.** Inspect the manifest, routes, archive navigation, metadata, discovery files, and the absence of calls output before deployment.

If the final build fails, keep the calls configuration and fix the final app or configuration. Do not manually copy partial files into `.output`.

## Validation commands

Run from the repository root:

```bash
pnpm type
pnpm test
pnpm turbo run build
pnpm build
pnpm --filter @festivalarc/distribution test
pnpm run test:e2e
```

For a selected app, its direct checks can be run with its workspace package name:

```bash
pnpm --filter your-package-name type
pnpm --filter your-package-name test
pnpm --filter your-package-name build
```

The composed build independently builds the active publication and every archive with its configured base, validates package ownership and references, creates global discovery files, writes `.distribution-manifest.json`, and atomically replaces `.output`.

## Evidence checklist

Before deployment, confirm:

- [ ] `editions.config.ts` has exactly one active publication.
- [ ] Calls, if present, are active at `/` and have `expiresWhenFinalPublished: true`.
- [ ] Archives contain only final publications with `/ediciones/YYYY` bases.
- [ ] IDs, years, package names, and archive bases are unique and match their contracts.
- [ ] `.output/index.html` represents the active publication.
- [ ] Every archive is present below its configured base.
- [ ] `.output/404.html`, `.output/robots.txt`, and sitemap files are distribution-owned.
- [ ] The manifest's configuration digest matches the intended configuration and its entries have expected owners and hashes.
- [ ] Routes, archive links, canonical/social URLs, assets, sitemap URLs, and robots content stay within their intended publication bases.
- [ ] A calls-to-final artifact contains no calls routes or calls data.

Read the generated artifact without modifying it:

```bash
test -d .output
test -s .distribution-manifest.json
python3 -m json.tool .distribution-manifest.json
find .output -maxdepth 2 -type f | sort
```

## Failure and rollback

A failed app build, validation, reference scan, or composition is a failed publication. Fix the source and rerun the workflow. Distribution uses disposable staging and restores the previous `.output` if the final directory swap fails; never merge old and new outputs manually.

For an already deployed mistake, use the Vercel project rollback controls, restore the last known-good source/configuration through version control, and rerun the validation and composed build. See [Deployment](deployment.md).
