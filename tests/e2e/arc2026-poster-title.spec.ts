import { expect, test } from '@playwright/test'

const widths = [320, 390, 767, 768, 1024, 1279, 1280, 1440, 1920]

// Runs in the browser so controls and poster assertions use the same detector.
function collisionMeasurement(selectors: string[]) {
  if (document.fonts.status !== 'loaded') throw new Error('Collision measurement requires loaded fonts')
  const groups = selectors.map(selector => {
    const bounds: { left: number; right: number; top: number; bottom: number }[] = []
    const rangeBounds: typeof bounds = []
    let normalized = 0
    for (const root of document.querySelectorAll(selector)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode
        if (!node.textContent?.trim()) continue
        const parent = node.parentElement!
        if (!parent.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue
        const style = getComputedStyle(parent)
        const canvas = document.createElement('canvas').getContext('2d')!
        canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        canvas.fontKerning = style.fontKerning as CanvasFontKerning
        canvas.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
        const text = style.textTransform === 'uppercase'
          ? node.textContent.toLocaleUpperCase(parent.closest('[lang]')?.getAttribute('lang') || undefined)
          : style.textTransform === 'lowercase'
            ? node.textContent.toLocaleLowerCase(parent.closest('[lang]')?.getAttribute('lang') || undefined)
            : node.textContent
        // Checking the whole stack also checks unused local fallback aliases,
        // which can be errored even when the primary webfont is fully loaded.
        const primaryFamily = style.fontFamily.match(/^("[^"]+"|'[^']+'|[^,]+)/)![0]
        const primaryFont = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${primaryFamily}`
        if (!document.fonts.check(primaryFont, text)) throw new Error('Collision font is not loaded')
        const metrics = canvas.measureText(text)
        let supported = ['none', 'uppercase', 'lowercase'].includes(style.textTransform)
          && style.writingMode === 'horizontal-tb'
          && ['normal', '100%'].includes(style.fontStretch)
          && style.fontVariationSettings === 'normal'
          && style.fontFeatureSettings === 'normal'
          && style.fontVariant === 'normal'
          && style.textShadow === 'none'
          && parseFloat(style.webkitTextStrokeWidth) === 0
        for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
          const s = getComputedStyle(ancestor)
          if (s.transform !== 'none' || s.translate !== 'none' || s.rotate !== 'none'
            || s.scale !== 'none' || !['1', 'normal'].includes(s.zoom)) supported = false
        }
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const r of range.getClientRects()) {
          if (r.width <= 0 || r.height <= 0) continue
          const raw = { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
          rangeBounds.push(raw)
          // Chromium rounds font ascent/descent to layout pixels. Only normalize
          // matching font extents; unsupported shaping/transforms retain the range.
          const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
          const inkHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
          if (supported && Number.isFinite(fontHeight) && inkHeight > 0
            && Math.abs(r.height - fontHeight) <= 1
            && metrics.actualBoundingBoxAscent <= metrics.fontBoundingBoxAscent
            && metrics.actualBoundingBoxDescent <= metrics.fontBoundingBoxDescent) {
            const baseline = r.top + metrics.fontBoundingBoxAscent
            // Whole-node metrics conservatively union wrapped lines' glyphs.
            bounds.push({ ...raw, top: baseline - metrics.actualBoundingBoxAscent, bottom: baseline + metrics.actualBoundingBoxDescent })
            normalized++
          } else bounds.push(raw)
        }
      }
    }
    if (!bounds.length) throw new Error(`No visible text bounds: ${selector}`)
    return { bounds, rangeBounds, normalized }
  })
  const overlaps = (a: typeof groups[number]['bounds'][number], b: typeof a) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  return {
    groups,
    collisions: groups.map(a => groups.map(b => a.bounds.some(x => b.bounds.some(y => overlaps(x, y))))),
  }
}

const collisionSelectors = ['h1', '[aria-label="28 y 29 de noviembre de 2026"]', 'article']

test('collision control retains conservative ranges for transformed text', async ({ page }) => {
  await page.setContent('<h1 style="transform:translateY(10px);font:900 80px Arial">CITY</h1>')
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(collisionMeasurement, ['h1'])
  expect(result.groups[0].normalized).toBe(0)
  expect(result.groups[0].bounds).toEqual(result.groups[0].rangeBounds)
})

test('collision control excludes hidden text without allowing empty measurements', async ({ page }) => {
  await page.setContent('<h1 style="font:900 80px Arial">CITY<span hidden>HIDDEN</span><span style="opacity:0">INVISIBLE</span></h1><article hidden>ARTIST</article>')
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(collisionMeasurement, ['h1'])
  expect(result.groups[0].bounds).toHaveLength(1)
  await expect(page.evaluate(collisionMeasurement, ['article'])).rejects.toThrow('No visible text bounds: article')
})

test('collision control detects actual overlapping text', async ({ page }) => {
  await page.setContent('<h1 style="position:absolute;top:100px;left:100px;font:900 80px Arial;margin:0">CITY</h1><article style="position:absolute;top:100px;left:100px;font:900 80px Arial">CITY</article>')
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(collisionMeasurement, ['h1', 'article'])
  expect(result.groups.map(group => group.bounds.length)).toEqual([1, 1])
  expect(result.collisions[0][1]).toBe(true)
})

test('collision control ignores overlapping transparent wrappers with separated text', async ({ page }) => {
  await page.setContent('<h1 style="position:absolute;top:100px;left:100px;font:900 80px Arial;margin:0">CITY</h1><article style="position:absolute;top:100px;left:100px;width:500px;height:400px"><span style="position:absolute;top:220px;font:900 80px Arial">ARTIST</span></article>')
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(collisionMeasurement, ['h1', 'article'])
  expect(result.groups.map(group => group.bounds.length)).toEqual([1, 1])
  expect(result.collisions[0][1]).toBe(false)
})

test('collision control preserves the real 767px ink gap despite intersecting font ranges', async ({ page }) => {
  await page.setViewportSize({ width: 767, height: 1000 })
  expect((await page.goto('/'))?.status()).toBe(200)
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(collisionMeasurement, ['h1', 'article[aria-label="Niño Cohete"]'])
  expect(result.groups.every(group => group.bounds.length > 0 && group.normalized > 0)).toBe(true)
  const [title, artist] = result.groups
  expect(title.rangeBounds.some(a => artist.rangeBounds.some(b =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top,
  ))).toBe(true)
  expect(result.collisions[0][1]).toBe(false)
})

test('mobile title grows with its available container width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 })
  expect((await page.goto('/'))?.status()).toBe(200)
  await page.evaluate(() => document.fonts.ready)
  const heading = page.getByRole('heading', { level: 1, name: 'El arte de habitar la ciudad', exact: true })
  await expect(heading).toBeVisible()
  const measure = () => heading.evaluate(node => {
    const range = document.createRange()
    range.selectNodeContents(node)
    return {
      availableWidth: node.getBoundingClientRect().width,
      fontSize: parseFloat(getComputedStyle(node).fontSize),
      textWidth: Math.max(...[...range.getClientRects()].map(rect => rect.width)),
    }
  })
  const narrow = await measure()
  await page.setViewportSize({ width: 390, height: 1000 })
  await expect(async () => {
    const wider = await measure()
    expect(wider.availableWidth).toBeGreaterThan(narrow.availableWidth)
    expect(wider.fontSize).toBeGreaterThan(narrow.fontSize)
    expect(wider.textWidth).toBeGreaterThan(narrow.textWidth)
  }).toPass()
})

for (const scale of [100, 200]) {
  for (const width of widths) {
    test(`poster title at ${width}px and ${scale}% text`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 })
      expect((await page.goto('/'))?.status()).toBe(200)
      await page.evaluate(() => document.fonts.ready)
      const heading = page.getByRole('heading', { level: 1, name: 'El arte de habitar la ciudad', exact: true })
      await expect(heading).toBeVisible()
      await expect(heading.locator(':scope > span')).toHaveText(['EL ARTE', 'DE HABITAR', 'LA', 'CIUDAD'])
      const dates = page.getByLabel('28 y 29 de noviembre de 2026', { exact: true })
      await expect(dates).toBeVisible()
      await expect(dates).toHaveText('28.1129.11')
      const originalSize = await heading.evaluate(node => parseFloat(getComputedStyle(node).fontSize))
      if (scale === 200) await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      await page.evaluate(() => document.fonts.ready)
      const collision = await page.evaluate(collisionMeasurement, collisionSelectors)
      const measurement = await heading.evaluate(h => {
        const problems: string[] = []
        const boxes = (root: Element) => {
          const result: DOMRect[] = []
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
          while (walker.nextNode()) {
            if (!walker.currentNode.textContent?.trim()) continue
            const range = document.createRange()
            range.selectNodeContents(walker.currentNode)
            const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0)
            if (!rects.length) problems.push(`empty text bounds: ${walker.currentNode.textContent}`)
            result.push(...rects)
            for (const r of rects) {
              if (r.left < -1 || r.right > innerWidth + 1) problems.push(`offscreen: ${walker.currentNode.textContent}`)
              for (let a = walker.currentNode.parentElement; a; a = a.parentElement) {
                const s = getComputedStyle(a)
                const b = a.getBoundingClientRect()
                if (['hidden', 'clip'].includes(s.overflowX) && (r.left < b.left - 1 || r.right > b.right + 1)) problems.push('horizontal clipping')
                if (['hidden', 'clip'].includes(s.overflowY) && (r.top < b.top - 1 || r.bottom > b.bottom + 1)) problems.push('vertical clipping')
              }
            }
          }
          return result
        }
        const date = h.previousElementSibling!
        const titleBoxes = boxes(h)
        const dateBoxes = boxes(date)
        const artists = [...document.querySelectorAll('article')]
        const hero = h.closest('.information-slot')!.getBoundingClientRect()
        const spill = document.querySelector('.information-slot[aria-hidden="true"]')!.getBoundingClientRect()
        for (const r of titleBoxes) {
          const b = h.getBoundingClientRect()
          if (r.left < b.left - 1 || r.right > b.right + 1) problems.push('unreserved title overflow')
          if (r.right > hero.right + 1 && (r.right > spill.right + 1 || r.top < spill.top - 1 || r.bottom > spill.bottom + 1)) problems.push('title outside reserved fourth-column footprint')
        }
        return {
          problems,
          titleSize: parseFloat(getComputedStyle(h).fontSize),
          dateSize: parseFloat(getComputedStyle(date).fontSize),
          fontLoaded: [...document.fonts].some(f => f.family.includes('Poppins') && f.weight === '900' && f.status === 'loaded'),
          fontFamily: getComputedStyle(h).fontFamily,
          titleBounds: titleBoxes.length,
          dateBounds: dateBoxes.length,
          artistCount: artists.length,
          availableWidth: hero.width,
          longestLineWidth: Math.max(...titleBoxes.map(r => r.right)) - hero.left,
          groupLines: [...h.children].map(group => {
            const r = document.createRange()
            r.selectNodeContents(group)
            return [...new Set([...r.getClientRects()].filter(b => b.width > 0).map(b => Math.round(b.top)))]
          }),
        }
      })
      if (collision.collisions[0][1]) measurement.problems.push('title/date overlap')
      if (collision.collisions[0][2]) measurement.problems.push('title/artist overlap')
      if (collision.collisions[1][2]) measurement.problems.push('date/artist overlap')
      await testInfo.attach('title-measurement', { body: JSON.stringify({ width, scale, ...measurement, collision }, null, 2), contentType: 'application/json' })
      expect(measurement.fontLoaded).toBe(true)
      expect(measurement.fontFamily).toContain('Poppins')
      expect(measurement.titleBounds).toBeGreaterThanOrEqual(4)
      expect(measurement.dateBounds).toBe(2)
      expect(measurement.artistCount).toBeGreaterThan(0)
      expect(measurement.dateSize).toBeLessThan(measurement.titleSize)
      if (scale === 200) expect(measurement.titleSize).toBeGreaterThan(originalSize)
      if (scale === 100) {
        expect(measurement.groupLines.map(lines => lines.length)).toEqual([1, 1, 1, 1])
        if (width < 768) {
          expect(measurement.longestLineWidth).toBeLessThanOrEqual(measurement.availableWidth)
        }
      }
      expect(measurement.problems).toEqual([])
    })
  }
}
