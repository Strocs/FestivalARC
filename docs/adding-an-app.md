# Adding an app

Add an independent Astro app under `apps/`, give it a unique workspace package name, and register that exact name in `editions.config.ts`. There is no generator or maintained template; copy structure only after checking the current apps and keep the new app independently buildable.

## Contract at a glance

| Requirement | Contract |
| --- | --- |
| Location | A package directory under `apps/` |
| Routes | `src/pages/` with at least the routes the publication needs |
| Build | A working `build` script that produces static files |
| Configuration | `astro.config.mjs` must honor `PUBLICATION_BASE` and `DISTRIBUTION_OUTPUT_DIR` |
| Publication base | `/` for the active publication; `/ediciones/YYYY` for an archive |
| Registration | The package's exact `package.json.name` must appear in `editions.config.ts` |
| Global files | 404, robots, and sitemaps belong to distribution, not an app |

The distribution runner discovers packages by reading `apps/*/package.json`. It runs the selected package's `build` script, normalizes the output, checks references, and composes the result with the other selected publications.

## Package and file shape

Use a package name that is unique in the workspace. Publication IDs have enforced names:

- Final edition: `festival-YYYY`
- Temporary calls: `calls-YYYY`

The package name is a separate field. It must match the `name` in `package.json` and the `packageName` in `editions.config.ts` exactly. Current names are not uniform: `festivalarc-2025`, `festival-arc-2023`, `festival-arc-2024`, and `calls-2026` are all valid examples.

A new app should include:

```text
apps/festival-YYYY/
├── astro.config.mjs
├── package.json
├── src/
│   └── pages/
├── public/                 # Unprocessed static assets, when needed
└── tsconfig.json            # Or jsconfig.json for a JavaScript app
```

The distribution minimum is a `package.json` with the exact package name and a working `build` script. To match the workspace contract, expose these scripts as well:

| Script | Purpose |
| --- | --- |
| `dev` | Local Astro development server |
| `start` | Local Astro server shortcut |
| `build` | Type/check and static build |
| `type` | App type or Astro check |
| `test` | App tests |
| `preview` | Preview the app's own build |
| `astro` | Astro CLI passthrough |

`test:e2e` is useful when the app has app-specific browser coverage, but it is not present in every current app.

## Astro base and output

The app must be static and publication-base aware. Follow this configuration shape:

```js
import { defineConfig } from 'astro/config'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  base: publicationBase,
  outDir: distributionOutput || './dist',
  output: 'static',
  site: 'https://festivalarc.com',
})
```

Integrations can be added for the app's needs. The important behavior is:

- A root publication builds with `PUBLICATION_BASE=/`.
- An archive builds with `PUBLICATION_BASE=/ediciones/YYYY`.
- A distribution build supplies `DISTRIBUTION_OUTPUT_DIR`, so the app writes into disposable build staging instead of its normal `dist/` directory.
- A standalone app build falls back to `./dist`.
- Local routes and asset references must remain inside an archive's base. Do not hard-code root-only paths for an archived app.
- Do not publish app-owned `404.html`, `robots.txt`, or sitemap files as global outputs. Distribution reserves and generates them.

The older 2023 app relies on its Astro version's static default and does not spell out `output: 'static'`; make the setting explicit in new apps.

## Register the publication

`editions.config.ts` is the selection source. Add the package name to `knownWorkspacePackages`, then add exactly one publication entry where it belongs.

For a final archive:

```ts
archives: [{
  kind: 'final',
  id: 'festival-YYYY',
  year: YYYY,
  packageName: 'your-workspace-package-name',
  base: '/ediciones/YYYY',
}],
```

For the active final publication:

```ts
active: {
  kind: 'final',
  id: 'festival-YYYY',
  year: YYYY,
  packageName: 'your-workspace-package-name',
},
```

Publication rules enforced by `@festivalarc/editions`:

- There is one active publication.
- A final ID must match its year: `festival-YYYY`.
- An archive must be `kind: final` and use exactly `/ediciones/YYYY` as its base.
- Publication IDs and archive years must be unique.
- Every configured `packageName` must be a known workspace package.
- `notFound`, `robots`, and `sitemap` must remain distribution-owned.
- Calls are temporary active publications and must carry `expiresWhenFinalPublished: true`.
- Calls cannot be placed in `archives`.

The current configuration selects `calls-2026` at `/` and archives `festival-2023` and `festival-2024` at `/ediciones/2023` and `/ediciones/2024`. When calls become a final edition, build and verify the final app first, then use the calls-to-final workflow in [Annual publishing](annual-publishing.md). Do not turn the calls app into an archive.

## Validation checklist

Before opening a change, confirm:

- [ ] The package directory is under `apps/` and has the required Astro files.
- [ ] `package.json.name`, the config `packageName`, and every filter command use the same package name.
- [ ] `build` succeeds with both `/` and the intended archive base.
- [ ] `astro.config.mjs` honors `DISTRIBUTION_OUTPUT_DIR`.
- [ ] Archived routes and assets stay under `/ediciones/YYYY`.
- [ ] The package name is in `knownWorkspacePackages`.
- [ ] The active/archive entry has a unique ID and year.
- [ ] No calls publication was added to `archives`.
- [ ] No app claims global 404, robots, or sitemap ownership.

Run the focused checks, then the composed checks:

```bash
pnpm --filter your-workspace-package type
pnpm --filter your-workspace-package test
pnpm --filter your-workspace-package build
PUBLICATION_BASE=/ediciones/YYYY pnpm --filter your-workspace-package build
pnpm turbo run build
pnpm build
pnpm --filter @festivalarc/distribution test
pnpm run test:e2e
```

Next: [Annual publishing](annual-publishing.md) or [Deployment](deployment.md).
