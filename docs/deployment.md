# Deployment

FestivalARC has one Vercel deployment. Vercel runs the root build, which composes the selected active publication and archives into `.output`; it does not deploy an app directory directly.

## Vercel contract

`vercel.json` is intentionally minimal:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build` |
| Output directory | `.output` |
| Framework | `null` |

Do not change the Vercel output directory to an individual app's `dist/` directory. The root artifact contains the active site, archives, and distribution-owned global files.

## Build and composition flow

Run the composed build from the repository root:

```bash
pnpm build
```

The distribution runner:

1. Imports and validates `editions.config.ts`.
2. Discovers package names from `apps/*/package.json`.
3. Builds the selected active publication at `/` and each final archive at its `/ediciones/YYYY` base.
4. Passes `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR` to each app.
5. Normalizes app output and rejects missing packages, duplicate owners, unsafe paths, destination collisions, and archive-base escapes.
6. Adds the neutral global `404.html`, `robots.txt`, and sitemap files.
7. Writes `.distribution-manifest.json` with the configuration digest and file ownership/hash data.
8. Atomically replaces `.output` with the composed staging tree.

`pnpm turbo run build` runs the workspace `build` tasks that are defined in package manifests. The explicit root composition entrypoint for deployment is `pnpm build`.

The current selection is:

| Publication | Kind | Destination |
| --- | --- | --- |
| `calls-2026` | active calls | `/` |
| `festival-2023` | final archive | `/ediciones/2023` |
| `festival-2024` | final archive | `/ediciones/2024` |

Change the selection only in `editions.config.ts`. See [Annual publishing](annual-publishing.md) for calls-to-final operations and [Adding an app](adding-an-app.md) for the app contract.

## Pre-deployment checks

Before deploying a configuration or app change, run:

```bash
pnpm type
pnpm test
pnpm turbo run build
pnpm build
pnpm --filter @festivalarc/distribution test
pnpm run test:e2e
```

The end-to-end suite serves `.output` at port 4173. Run it after the composed build, not against an individual app output.

## Inspect the candidate artifact

Perform these readback checks before handing the root artifact to Vercel:

```bash
test -d .output
test -s .distribution-manifest.json
python3 -m json.tool .distribution-manifest.json
find .output -maxdepth 2 -type f | sort
```

Confirm at minimum:

- `.output/index.html` exists for the active publication.
- Archive output exists under `ediciones/2023/` and `ediciones/2024/`.
- `.output/404.html`, `.output/robots.txt`, `.output/sitemap-index.xml`, and the sitemap shard exist.
- `.distribution-manifest.json` has the expected configuration digest and lists distribution ownership for global files.
- The artifact contains no calls archive directory or calls-only routes after a calls-to-final replacement.
- Links, canonical/social metadata, assets, archive navigation, sitemap URLs, and robots content use the intended bases.

Do not manually copy files into `.output` or edit the manifest to make an artifact appear valid. Fix the source app or publication configuration and rebuild.

## Atomic replacement and rollback

Composition uses disposable staging. On a successful build, the completed staging tree becomes `.output`; an existing `.output` is moved aside during the swap and removed after success. If the final directory rename fails, the previous output is restored and the staging tree is cleaned up.

There is no repository rollback command. To recover from a bad candidate:

1. Stop deployment of the candidate.
2. Use the Vercel project controls to roll back an already deployed deployment when necessary.
3. Restore the last known-good `editions.config.ts` and app source through version control.
4. Run the full pre-deployment checks and `pnpm build` again.

Never recover by merging old and new app files by hand. The next successful composition is the rollback boundary: it recreates the complete artifact from the selected sources and configuration.
