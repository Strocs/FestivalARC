# Deployment

FestivalARC has one Vercel deployment. Vercel runs a dedicated root build profile that composes the active publication and archives into `.output`; it does not deploy an app directory directly.

## Vercel contract

`vercel.json` configures a static build and its routing:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build:vercel` |
| Output directory | `.output` |
| Framework | `null` |

Do not change the Vercel output directory to an individual app's `dist/` directory. The root artifact contains the active site, archives, and distribution-owned global files.

For ARC2026, `build:vercel` packages the 24 prerendered poster variants and the three default documents as flat `.html` files under `poster-variants/`. The defaults for `/`, `/musica`, and `/artes-escenicas` move too: leaving a matching filesystem page would take precedence over the rewrites. The ordered rules match both `dia` and `orden` first, then either recognized non-default filter alone, then the default document. Missing, default, and unrecognized values fall back independently. No middleware or function is used.

The sitemap contains the public routes, not the internal destinations. Direct `/poster-variants/*` requests receive `X-Robots-Tag: noindex, follow`. Keep the documents and the matching rules in sync; the focused `pnpm --filter @festivalarc/distribution test src/vercel.test.ts` test checks them together.

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

`pnpm turbo run build` runs the workspace `build` tasks that are defined in package manifests. Use `pnpm build` for local composition and `pnpm build:vercel` for the Vercel artifact. Both replace `.output` and write its matching `.distribution-manifest.json`; only the Vercel profile relocates the three default documents.

The current selection is:

| Publication | Kind | Destination |
| --- | --- | --- |
| `festival-2026` | active results | `/` |
| `festival-2023` | final archive | `/ediciones/2023` |
| `festival-2024` | final archive | `/ediciones/2024` |
| `festival-2025` | final archive | `/ediciones/2025` |

Change the publication selection only in `editions.config.ts`. When retiring ARC2026 as the active publication, also retire or update its Vercel poster routing and packaging; the current deployment profile requires `festival-2026` at the root. See [Annual publishing](annual-publishing.md) for calls-to-final operations and [Adding an app](adding-an-app.md) for the app contract.

## Pre-deployment checks

Before deploying a configuration or app change, run:

```bash
pnpm type
pnpm test
pnpm turbo run build
pnpm build
pnpm --filter @festivalarc/distribution test
node --test scripts/home-redirect.test.mjs
pnpm run test:e2e
pnpm build:vercel
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

- After `pnpm build`, `.output/index.html`, `.output/musica/index.html`, and `.output/artes-escenicas/index.html` exist for local preview.
- After `pnpm build:vercel`, none of those three files exists; every rewrite destination in `vercel.json` exists, including the three defaults.
- Archive output exists in both profiles under `ediciones/2023/`, `ediciones/2024/`, and `ediciones/2025/`.
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
