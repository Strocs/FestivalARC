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
  it('keeps the editions control as an accessible native dropdown button', () => {
    expect(headerSource).toContain('<details>')
    expect(headerSource).toContain('<summary')
    expect(headerSource).toContain("class='size-full cursor-pointer px-4'")
    expect(headerSource).not.toContain("class='cursor-pointer'>Ediciones</summary>")
    expect(headerSource).toContain('withLogo ?')
    expect(headerSource).toContain('hover:-skew-y-4')
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
