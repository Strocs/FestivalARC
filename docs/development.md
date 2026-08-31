# Development

Run commands from the repository root unless a command says otherwise. The workspace includes four independent Astro apps plus shared packages and distribution tooling.

## Install

The repository uses `pnpm@10.18.2`. Node.js is required, but no Node version is pinned in the repository.

```bash
pnpm install
```

The root composed preview also requires Python 3.

## Start one app

Use the workspace package name, not the app directory name:

| App | Command | Default local port |
| --- | --- | ---: |
| 2025 festival | `pnpm --filter festivalarc-2025 dev` | 4321 |
| 2026 calls | `pnpm --filter calls-2026 dev` | 4321 |
| 2023 archive | `pnpm --filter festival-arc-2023 dev` | 4321 |
| 2024 archive | `pnpm --filter festival-arc-2024 dev` | 4321 |

No app configuration overrides Astro's default development port. The root shortcuts are equivalent to the 2025 commands:

```bash
pnpm dev
pnpm start
```

Both root commands run `festivalarc-2025`, not the currently selected `calls-2026` publication.

### Work on multiple apps

There is no root concurrent all-app dev command. Open one terminal per app and assign explicit ports:

```bash
# Terminal 1
pnpm --filter festivalarc-2025 dev -- --port 4321

# Terminal 2
pnpm --filter calls-2026 dev -- --port 4322

# Terminal 3
pnpm --filter festival-arc-2023 dev -- --port 4323

# Terminal 4
pnpm --filter festival-arc-2024 dev -- --port 4324
```

The port assignments above are a suggested local layout. Change them if another process is using a port. Keep each app in its own terminal so logs and lifecycle commands remain attributable.

## Checks and builds

### Workspace checks

```bash
pnpm type
pnpm test
```

These root scripts run each workspace package's `type` or `test` script when present.

Run the distribution package tests directly when changing composition behavior:

```bash
pnpm --filter @festivalarc/distribution test
```

### Build commands

Run all workspace build tasks that expose a `build` script:

```bash
pnpm turbo run build
```

Build the selected active publication and archives, and compose the deployable site:

```bash
pnpm build
```

The composed build reads `editions.config.ts`, builds each selected app independently, and atomically replaces `.output`. See [Deployment](deployment.md) for the composition contract.

### End-to-end tests

The root Playwright project serves the composed artifact on port 4173:

```bash
pnpm build
pnpm run test:e2e
pnpm run test:e2e:ui
pnpm run test:e2e:debug
```

Do not run the root E2E suite against an unbuilt or stale `.output`.

## Preview

Preview the composed root artifact with the repository's Python server:

```bash
pnpm preview
```

It serves `.output` at `http://localhost:4173`. For an individual app, use that app's `preview` script after building it; the 2024 script builds before previewing, while the other app scripts expect an existing app build.

## Generated directories and files

Do not edit or manually compose generated output.

| Path | Owner and purpose |
| --- | --- |
| `apps/*/dist/` | Per-app fallback build output when `DISTRIBUTION_OUTPUT_DIR` is not set |
| `apps/*/.astro/` | Astro-generated project state; tracked by the Turbo build task's output definition |
| `.output/` | Final composed site served by preview and deployed to Vercel |
| `.distribution-manifest.json` | Composition manifest with configuration digest, file owners, sizes, and SHA-256 values |
| `.distribution-build-*/` and `..output-staging-*/` | Temporary distribution staging directories; removed after the build |

During a distribution build, `DISTRIBUTION_OUTPUT_DIR` redirects each selected app's output into disposable staging instead of its normal `dist/` directory.

## Troubleshooting

- **The wrong site starts:** `pnpm dev` and `pnpm start` intentionally target `festivalarc-2025`. Use the exact filter for `calls-2026` or an archive.
- **A second app cannot start:** all apps default to port 4321. Pass a unique port as shown above.
- **A filter is not found:** use the package name from the table. For example, the directory `apps/festival-2023` is the package `festival-arc-2023`.
- **The composed site is stale:** run `pnpm build` again. Do not copy files between app outputs or into `.output`.
- **The distribution build rejects a package:** confirm its package name is registered in `editions.config.ts`, its package directory exists under `apps/`, and its build honors `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR`.
- **Archive links escape their base:** inspect the app's base-aware routes and assets, then rebuild with its configured `/ediciones/YYYY` base.
- **Preview or E2E cannot bind:** stop the process already using port 4173, then rerun the preview or E2E command.

Next: [Adding an app](adding-an-app.md) or [Deployment](deployment.md).
