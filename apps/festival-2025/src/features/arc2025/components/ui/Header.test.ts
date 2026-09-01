import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const headerSource = readFileSync(
  resolve(process.cwd(), 'src/features/arc2025/components/ui/Header.astro'),
  'utf8',
)
const layoutSource = readFileSync(
  resolve(process.cwd(), 'src/features/shared/layouts/Layout.astro'),
  'utf8',
)

describe('Festival ARC 2025 shared visual contracts', () => {
  it('separates the continuous hover hit area from the animated content', () => {
    expect(headerSource).toContain('<div class=\'editions-dropdown group\'>')
    expect(headerSource).toMatch(/<div\s+class=\{cn\([\s\S]*editions-trigger[\s\S]*tabindex='0'[^>]*>/)
    expect(headerSource).toContain('publicationTargets(publicationConfig)')
    expect(headerSource).toContain('top-full')
    expect(headerSource).toContain('hover:-skew-y-4')
    expect(headerSource).toContain('.editions-dropdown:hover .editions-panel')
    expect(headerSource).toContain('.editions-dropdown:focus-within .editions-panel')
    expect(headerSource).not.toContain('<details')
    expect(headerSource).not.toContain('<summary')
    expect(headerSource).not.toContain('details[open]')
    expect(headerSource).toContain('pointer-events: none')
    expect(headerSource).toContain('pointer-events: auto')
    expect(headerSource).toMatch(/<div\s+class=\{?[^>]*editions-panel[^>]*>/s)
    expect(headerSource).toContain('editions-panel-content')
    expect(headerSource).toMatch(/\.editions-panel[^{}]*{[^}]*top: 100%;[^}]*padding-top: 0\.5rem;[^}]*pointer-events: none;/s)
    expect(headerSource).toMatch(/\.editions-panel-content\s*{[^}]*opacity: 0;[^}]*transform: translateY\(0\.5rem\);/s)
    expect(headerSource).toContain('prefers-reduced-motion: reduce')
    expect(headerSource).not.toContain('.editions-panel::before')
    expect(headerSource).not.toMatch(/\.editions-panel\s*{[^}]*transform:/s)
    expect(headerSource).not.toContain('<ul\n                    class={cn(\n                      \'editions-panel')
    expect(headerSource).not.toContain('<script')
  })

  it('defines concrete asset-backed font faces in the layout', () => {
    expect(layoutSource).toContain("assetPath('/fonts/DKAppelstroop.woff2')")
    expect(layoutSource).toContain("assetPath('/fonts/BestoomBold.woff2')")
    expect(layoutSource).toContain("assetPath('/fonts/NerisLight.woff2')")
    expect(layoutSource).toContain("assetPath('/fonts/NerisSemiBold.woff2')")
    expect(layoutSource).toContain("assetPath('/fonts/NerisBlack.woff2')")
    expect(layoutSource).toContain('@font-face')
    expect(layoutSource).toContain('font-weight: 400')
    expect(layoutSource).toContain('font-weight: 700')
    expect(layoutSource).toContain('font-weight: 300')
    expect(layoutSource).toContain('font-weight: 600')
    expect(layoutSource).toContain('font-weight: 900')
    expect(layoutSource).not.toContain('--arc-font-')
    expect(layoutSource).not.toContain('src: var(')
  })
})
