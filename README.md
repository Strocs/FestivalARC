# FestivalARC

FestivalARC is a static cultural festival site published as one composed website. Each edition is an independent Astro app; the distribution package builds the selected active publication and archives, then assembles the deployable `.output` directory.

## Repository map

```text
FestivalARC/
├── apps/
│   ├── festival-2025/       # Default root development app
│   ├── calls-2026/          # Current active calls publication at /
│   ├── festival-2023/       # Archive at /ediciones/2023
│   └── festival-2024/       # Archive at /ediciones/2024
├── packages/
│   ├── editions/            # Publication config validation and lifecycle rules
│   └── seo/                 # Shared SEO helpers
├── tooling/distribution/    # Builds selected apps and composes .output
├── editions.config.ts       # Active/archive selection source
└── .output/                 # Generated composed deployment artifact
```

```text
editions.config.ts
        │ selects active + archives
        ▼
independent Astro app builds
        │ PUBLICATION_BASE + DISTRIBUTION_OUTPUT_DIR
        ▼
tooling/distribution ── validates, scans, adds global files ──► .output
        │
        └────────────────────────────────────────────────────► Vercel
```

The current selection is `calls-2026` at the root, with final archives for 2023 and 2024. The root development shortcut still targets `festivalarc-2025`; select the app you actually need with an app filter.

## Prerequisites and install

- Node.js is required, but this repository does not pin a Node version.
- `pnpm@10.18.2` is the repository package manager.
- Python 3 is required for the root composed preview command.

```bash
pnpm install
```

## Quick commands

Run from the repository root:

| Task | Command |
| --- | --- |
| Default development app (2025) | `pnpm dev` |
| Default start command (2025 Astro server) | `pnpm start` |
| 2025 app development | `pnpm --filter festivalarc-2025 dev` |
| 2026 calls development | `pnpm --filter calls-2026 dev` |
| 2023 archive development | `pnpm --filter festival-arc-2023 dev` |
| 2024 archive development | `pnpm --filter festival-arc-2024 dev` |
| Run workspace build tasks | `pnpm turbo run build` |
| Build and compose the selected site | `pnpm build` |
| Preview composed `.output` | `pnpm preview` |
| Type checks | `pnpm type` |
| Unit/package tests | `pnpm test` |
| End-to-end tests | `pnpm run test:e2e` |

App-specific development commands, ports, distribution details, and deployment checks are in [Development](docs/development.md), [Deployment](docs/deployment.md), and [Annual publishing](docs/annual-publishing.md).

There is currently **no one-command concurrent development server for all apps**. Use separate terminals with explicit, non-colliding ports; see [Development](docs/development.md).

## Guides

- [Development](docs/development.md) — local work, checks, previews, generated output, and troubleshooting
- [Adding an app](docs/adding-an-app.md) — app contract and publication registration
- [Annual publishing](docs/annual-publishing.md) — calls-to-final operations and yearly publication workflow
- [Deployment](docs/deployment.md) — composed artifacts, Vercel, verification, and rollback
