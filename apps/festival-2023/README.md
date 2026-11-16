# ARC2023 archive builds

ARC2023 keeps Astro 5.14.1 and uses `astro-icon` **1.2.0** with locally
installed Iconify collections (`@iconify-json/mdi` 1.2.3 and
`@iconify-json/ic` 1.2.4). The former 0.8.2 default resolver called
`api.astroicon.dev`, whose disabled deployment caused SVG rendering to fail,
including on `/404.html`. This was a remote service failure, not evidence of
a recent dependency update.

## Build and verify

Use Node **>=22.12.0** (required by astro-icon 1.2.0) and the workspace's
pnpm 11.25.0. Local verification used Node 26.13.0. The root `vercel.json`
does not declare a Node runtime, and no repository runtime pin was found;
confirm the deployment project's Node setting before claiming deployed
compatibility. No runtime configuration or Astro upgrade is part of this fix.

From the repository root:

```sh
pnpm --filter festival-arc-2023 exec node --test scripts/icon-migration.test.mjs
pnpm --filter festival-arc-2023 test
pnpm --filter festival-arc-2023 build
pnpm build
```

The focused regression builds the real archive with `/2023` publication paths
in a temporary output directory. It denies fetches only to the retired icon
API and checks rendered SVGs, viewBoxes, classes, social labels, event links,
and dynamic icon names, including `/404.html`. This is not a fully offline
build test. Temporary test output is removed at teardown. The normal build
wrapper deliberately removes edition-level 404/robots/sitemap files; the
regression calls Astro's public build API to inspect 404 rendering before
that publication safeguard.

## Maintaining icons

Import `Icon` from `astro-icon/components`. The `icon()` integration in
`astro.config.mjs` includes the complete current inventory: social/media
icons, email, navigation arrows, calendar, and TikTok. When adding dynamic
`SocialNetworks` or `RelevantLinks` names, update that include list and the
render regression together. Ticket links use the existing local ticket image,
not an Iconify icon.

Version 1 emits `data-icon` and may reuse document-local SVG symbols instead
of the old `astro-icon` attribute. Existing consumers use Tailwind classes,
not old attribute selectors; those classes, links, and labels are unchanged.
Each consumer explicitly passes undefined width/height to omit v1's `1em`
defaults, matching v0's omitted dimensions and preserving one-axis Tailwind
sizing. The regression checks those attributes and local symbol/path bodies.
Do not change publication-path helpers or build-output safeguards to migrate
icons.

## Recovery evidence

The task's local evidence is under `output/arc2023-astro-icon-upgrade/`:
`baseline.tar` contains only the baseline app and root lockfile;
`backup-validation.json` records every live-content hash, the archive SHA-256,
and previously absent new files. It was validated before source/dependency
changes. Logs and exit-code files record verification, including failed
attempts.

Recovery is manual and requires parent authorization: compare current changes
with that manifest, extract only the changed tracked app files and
`pnpm-lock.yaml` into a separate recovery directory, then selectively apply
their baseline contents after checking for later edits. Review the two
previously absent files separately. Reinstall the recovered lockfile with
the normal package manager if authorized. Do not extract the whole archive
over the worktree, reset Git, remove unrelated work, or roll back automatically.
