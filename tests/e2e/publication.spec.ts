    import { expect, test } from '@playwright/test'
    import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
    import { tmpdir } from 'node:os'
    import { join } from 'node:path'
    import { publicationConfig } from '../../editions.config.ts'
    import { publicationBase, replaceCallsWithFinal } from '@festivalarc/editions'
    import { compose } from '../../tooling/distribution/src/index.ts'
    
    const origin = 'https://festivalarc.com'
    const fixtureInput = (ownerId: string, kind: 'final' | 'calls', destination: string, content: string) => ({
      ownerId, kind, sourceRoot: 'e2e-fixture', destination, base: publicationBase(destination),
      files: [{ relativePath: 'index.html', bytes: Buffer.from(content) }],
    })
    
    test('serves the root publication and representative interactions/assets', async ({ page }) => {
      const response = await page.goto('/')
      expect(response?.status()).toBe(200)
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', origin)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
      await expect(page.locator('img').first()).toBeVisible()
    })
    
    test('serves archived roots and nested navigation beneath their bases', async ({ page }) => {
      for (const base of ['/ediciones/2023/', '/ediciones/2024/']) {
        const response = await page.goto(base)
        expect(response?.status(), base).toBe(200)
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}${base}`)
        await expect(page.locator('meta[name="robots"]')).toHaveCount(1)
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
        const internalLinks = await page.locator(`a[href^="${base}"]`).evaluateAll((links) => links.map((link) => link.getAttribute('href')).filter(Boolean))
        expect(internalLinks.length, `${base} should expose base-aware navigation`).toBeGreaterThan(0)
        const nested = internalLinks.find((href) => href !== base)
        if (nested) expect((await page.goto(nested))?.status(), nested).toBe(200)
      }
    })

    test('keeps the active publication indexable', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    })
    
    test('exposes edition dropdown targets when the active final edition is selected', async ({ page }) => {
      await page.goto('/ediciones/2024/')
      const targets = page.locator('a[href^="/ediciones/"]')
      expect(await targets.count()).toBeGreaterThan(0)
      await expect(targets.first()).toHaveAttribute('href', /\/ediciones\/(2023|2024)(\/|$)/)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}/ediciones/2024/`)
    })
    
    test('replaces calls without exposing a calls archive at the public boundary', async ({ request }) => {
      expect((await request.get('/ediciones/2026/')).status()).toBe(404)
    
      const finalConfig = replaceCallsWithFinal(publicationConfig, {
        id: 'festival-2026', year: 2026, packageName: 'festivalarc-2026',
      }, { knownWorkspacePackages: ['festivalarc-2026', 'festival-arc-2023', 'festival-arc-2024', 'festivalarc-2025', 'calls-2026'], callsPackageName: 'calls-2026' })
      const root = mkdtempSync(join(tmpdir(), 'festivalarc-e2e-replace-'))
      try {
        const result = compose({ config: finalConfig, outputRoot: join(root, '.output'), inputs: [
          fixtureInput('festival-2026', 'final', '/', 'final'),
          ...finalConfig.archives.map(archive => fixtureInput(archive.id, 'final', archive.base, `<html><head></head><body>${archive.id}</body></html>`)),
        ] })
        expect(result.manifest.some(entry => entry.owner === 'calls-2026')).toBe(false)
        expect(result.manifest.some(entry => entry.path.startsWith('ediciones/2026/'))).toBe(false)
        expect(readFileSync(join(root, '.output/index.html'), 'utf8')).toBe('final')
      } finally { rmSync(root, { recursive: true, force: true }) }
    })
    
    test('prevents a failed composition from replacing the public artifact', async ({ request }) => {
      const root = mkdtempSync(join(tmpdir(), 'festivalarc-e2e-failure-'))
      const output = join(root, '.output')
      try {
        mkdirSync(output)
        writeFileSync(join(output, 'index.html'), 'prior')
        const calls = fixtureInput('calls-2026', 'calls', '/', 'calls')
        expect(() => compose({ config: publicationConfig, outputRoot: output, inputs: [calls, calls] })).toThrow('duplicate input')
        expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe('prior')
        expect((await request.get('/index.html')).status()).toBe(200)
      } finally { rmSync(root, { recursive: true, force: true }) }
    })
    
    test('publishes global fallback and discovery files', async ({ page, request }) => {
      const notFound = await request.get('/404.html')
      expect(notFound.status()).toBe(200)
      expect(await notFound.text()).toContain('Page not found')
      const robots = await request.get('/robots.txt')
      expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap-index.xml`)
      expect(await robots.text()).toContain('Allow: /')
      expect(await robots.text()).not.toContain('Disallow:')
      const sitemap = await request.get('/sitemap-index.xml')
      expect(await sitemap.text()).toContain(`${origin}/sitemap-0.xml`)
      expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('/ediciones/')
      expect((await page.goto('/route-that-does-not-exist'))?.status()).toBe(404)
    })
    
    
