# Festival UI

Shared Astro 7 components for the current festival and future editions. Historical sites are not migrated.

## FestivalNavbar

```astro
---
import FestivalNavbar from '@festivalarc/ui/FestivalNavbar.astro'
const editions = [{ label: 'ARC 2025', href: '/ediciones/2025/' }]
---
<div class='font-sans [--header-bg-color:var(--color-background)] [--header-text-color:var(--color-foreground)] [--header-panel-bg-color:var(--color-background)] [--header-panel-text-color:var(--color-foreground)]'>
  <FestivalNavbar editions={editions} homeHref='/' links={[{ label: 'Programa', href: '/programa/' }]}>
    <img slot='logo' src='/logo.svg' alt='Festival ARC' />
    <span slot='date'>28 y 29 de noviembre</span>
    <span slot='location'>Plaza de Armas de La Serena</span>
    <a slot='cta' href='/entradas/' class='rounded px-4 py-2'>Entradas</a>
    <p slot='mobile-extra'>Contenido adicional del festival</p>
  </FestivalNavbar>
</div>
```

Required slots: `logo`, `date`. Optional slots: `location`, `cta`, `mobile-extra`.
Required prop: `editions` (a non-empty list of `{ label, href }`).
Optional props: `links` (same shape, defaults to empty), `homeHref` (defaults to `/`).
No style/color/class props. The consumer resolves base-aware URLs and supplies all editions except itself.

CTA appears before Ediciones, both on desktop and in the mobile panel.
CTA markup is rendered twice: avoid IDs inside that slot.
Below Tailwind's default `lg` breakpoint (64rem), a native modal dialog provides
focus containment, Escape dismissal and return focus. It closes after navigation
or switching to desktop. Ediciones uses a button-operated disclosure with Escape
and outside-click dismissal.

## Tailwind and customization

The consumer compiles utilities. Register the package source in its Tailwind v4 entrypoint
(adjust the relative path from the stylesheet):

```css
@import 'tailwindcss';
@source '../../../../packages/ui/src';
```

Inherited CSS tokens:

| Token | Default |
| --- | --- |
| `--header-bg-color` | transparent |
| `--header-text-color` | inherit |
| `--header-border-color` | currentColor |
| `--header-panel-bg-color` | Canvas |
| `--header-panel-text-color` | CanvasText |

Typography inherits from the festival. Stable styling hooks:
`data-festival-header`, `data-header-brand`, `data-header-date`,
`data-header-location`, `data-header-nav`, `data-header-cta`,
`data-header-editions`, `data-header-toggle`, `data-header-panel`, `data-header-close`.

Scope customizations to the festival wrapper, rather than depending on internal nesting.
Use consumer CSS/Tailwind for backgrounds and structural overrides; for example:

```css
.arc2027 [data-festival-header] {
  background-image: url('/images/header-texture.webp');
  background-size: cover;
}
```

Minimum header height follows ARC 2024: outer `py-1` plus inner `min-h-16`
(72px with the standard 16px root font and default spacing). Content can grow
instead of clipping at narrow widths or enlarged text.
`--header-border-color` supplies a color; add border width through a public hook if wanted.
Keep the default `lg` breakpoint at 64rem so CSS and dialog resize handling agree.
