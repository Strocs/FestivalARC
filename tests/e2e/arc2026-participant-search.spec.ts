import { expect, test } from '@playwright/test'

const searchLabel = 'Buscar participantes'

for (const viewport of [{ width: 1280, height: 900 }, { width: 320, height: 720 }]) {
  test(`opens with motion and focus without moving the search button at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')

    const header = page.getByRole('banner')
    const button = header.getByRole('button', { name: searchLabel })
    const input = header.getByRole('searchbox', { name: searchLabel })
    const box = await button.boundingBox()
    const closedHeader = (await header.boundingBox())!
    expect(box).not.toBeNull()
    await expect(input).toBeHidden()

    const animated = await button.evaluate((trigger) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!
      ;(trigger as HTMLButtonElement).click()
      return panel.getAnimations().some(animation => Number(animation.effect?.getTiming().duration) > 0)
    })
    expect(animated).toBe(true)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(input).toBeFocused()
    expect(await button.boundingBox()).toEqual(box)

    if (viewport.width < 1024) {
      const menu = await header.getByRole('button', { name: 'Abrir navegación' }).boundingBox()
      expect(box!.x + box!.width).toBeLessThanOrEqual(menu!.x)
      await expect.poll(async () => (await input.boundingBox())!.y).toBeGreaterThanOrEqual(closedHeader.y + closedHeader.height)
      expect((await input.boundingBox())!.width).toBeGreaterThan(viewport.width * 0.8)
    } else {
      expect(box!.x).toBeGreaterThan(viewport.width * 0.8)
      expect((await input.boundingBox())!.x).toBeLessThan(box!.x)
    }
  })
}

test('keeps the mobile logo and date side by side without overlapping the controls', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  const header = page.getByRole('banner')
  const logo = header.getByRole('link', { name: 'Inicio', exact: true })
  const date = header.getByText('28 y 29 de noviembre', { exact: true })
  const search = header.getByRole('button', { name: searchLabel })
  await expect(logo).toBeVisible()
  await expect(date).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  const [logoBox, dateBox, searchBox] = await Promise.all([logo.boundingBox(), date.boundingBox(), search.boundingBox()])
  expect(dateBox!.x).toBeGreaterThanOrEqual(logoBox!.x + logoBox!.width)
  expect(dateBox!.y).toBeLessThan(logoBox!.y + logoBox!.height)
  expect(dateBox!.x + dateBox!.width).toBeLessThanOrEqual(searchBox!.x)
  expect(await date.evaluate(element => {
    const text = document.createRange()
    text.selectNodeContents(element)
    return text.getClientRects().length
  })).toBe(1)
})

test('uses a slim search field with a single border that brightens on focus', async ({ page }) => {
  await page.goto('/')
  const header = page.getByRole('banner')
  const border = await header.evaluate(element => getComputedStyle(element).borderBottomColor)
  await header.getByRole('button', { name: searchLabel }).click()
  const search = header.getByRole('search', { name: searchLabel })
  const input = search.getByRole('searchbox')
  await expect(input).toHaveCSS('height', '36px')
  await expect(input).toHaveCSS('border-top-width', '1px')
  await expect(input).toHaveCSS('outline-style', 'none')
  await expect(input).toHaveCSS('border-top-color', /\/ 0\.5\)$/)
  await input.fill('Gepe')
  await input.press('Tab')
  await expect(search.getByRole('link', { name: 'Gepe', exact: true })).toBeFocused()
  await expect(input).toHaveCSS('border-top-color', border)
  await expect(search.locator('[data-search-feedback]')).toHaveCSS('border-top-color', border)
})

for (const width of [390, 1280]) {
  test(`animates the search panel in reverse before it collapses at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: searchLabel })
    await trigger.click()
    const input = page.getByRole('searchbox', { name: searchLabel })
    await expect(input).toBeFocused()
    const id = (await trigger.getAttribute('aria-controls'))!
    const panel = page.locator(`[id="${id}"]`)
    const closing = await panel.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map(animation => animation.finished))
      document.querySelector<HTMLButtonElement>(`[aria-controls="${element.id}"]`)!.click()
      const effect = element.getAnimations()[0]?.effect as KeyframeEffect | undefined
      return {
        visibleDuringMotion: !(element as HTMLElement).hidden,
        opacity: effect?.getKeyframes().map(frame => Number(frame.opacity)),
      }
    })
    expect(closing).toEqual({ visibleDuringMotion: true, opacity: [1, 0] })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
    await expect(panel).toBeHidden()
  })
}

test('temporarily moves the poster toolbar down on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  const toolbar = page.getByRole('group', { name: 'Filtrar artistas por día' })
  const initial = (await toolbar.boundingBox())!
  await page.getByRole('button', { name: searchLabel }).click()
  const search = page.getByRole('search', { name: searchLabel })
  const input = search.getByRole('searchbox')
  await input.fill('a')
  const last = search.getByRole('link').last()
  await expect(last).toBeVisible()
  await expect.poll(async () => (await toolbar.boundingBox())!.y).toBeGreaterThanOrEqual((await last.boundingBox())!.y + (await last.boundingBox())!.height)
  await expect(input).toHaveCSS('border-top-left-radius', '12px')
  await input.press('Escape')
  await expect.poll(async () => (await toolbar.boundingBox())!.y).toBeCloseTo(initial.y, 0)
})

test('returns up to three partial name matches as single-line links without category labels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await page.getByRole('button', { name: searchLabel }).click()
  const search = page.getByRole('search', { name: searchLabel })
  const input = search.getByRole('searchbox')
  const links = search.getByRole('link')

  await input.fill('a')
  await expect(links).toHaveCount(3)
  const name = 'Removernos a Cielo Abierto: Estrategia de Supervivencia'
  await input.fill('REMOVERNOS')
  await expect(links).toHaveCount(1)
  const link = links.getByText(name, { exact: true })
  await expect(link).toHaveAccessibleName(name)
  await expect(link).toHaveCSS('white-space', 'nowrap')
  await expect(link).toHaveCSS('text-overflow', 'ellipsis')
  expect(await link.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true)

  await input.fill('zzzz-no-such-name')
  await expect(links).toHaveCount(0)
  await expect(search.getByRole('status')).toHaveText('No encontramos coincidencias')
  await expect(input).toHaveValue('zzzz-no-such-name')
})

test('searches all four categories and sends users to the selected profile', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: searchLabel }).click()
  const search = page.getByRole('search', { name: searchLabel })
  const input = search.getByRole('searchbox')

  for (const [query, name, path] of [
    ['nino cohete', 'Niño Cohete', '/musica/nino-cohete/'],
    ['lobas', 'Lobas', '/artes-escenicas/lobas/'],
    ['ivan jorquera', 'Iván Jorquera', '/expo-arte-co/ivan-jorquera/'],
    ['nativa joyas', 'NATIVA JOYAS DEL ELQUI', '/mercado-creativo-y-daz/nativa-joyas-del-elqui/'],
  ]) {
    await input.fill(query)
    await expect(search.getByRole('link', { name, exact: true })).toHaveAttribute('href', path)
  }
  await input.press('Tab')
  const profile = search.getByRole('link', { name: 'NATIVA JOYAS DEL ELQUI' })
  await expect(profile).toBeFocused()
  await profile.press('Enter')
  await expect(page).toHaveURL('/mercado-creativo-y-daz/nativa-joyas-del-elqui/')
  await expect(page.getByRole('main', { name: 'Ficha de NATIVA JOYAS DEL ELQUI' })).toBeVisible()
  await expect(page.getByRole('button', { name: searchLabel })).toHaveAttribute('aria-expanded', 'false')
  await page.goBack()
  await page.getByRole('button', { name: searchLabel }).click()
  await expect(page.getByRole('searchbox', { name: searchLabel })).toHaveValue('')
})

test('keeps the query after leaving the panel or pressing Escape', async ({ page }) => {
  await page.goto('/')
  const button = page.getByRole('button', { name: searchLabel })
  const input = page.getByRole('searchbox', { name: searchLabel })
  await button.click()
  await input.fill('javiera')
  await input.press('Tab')
  const result = page.getByRole('link', { name: 'Javiera Mena', exact: true }).first()
  await expect(result).toBeFocused()
  await result.press('Escape')
  await expect(input).toBeHidden()
  await expect(button).toBeFocused()
  await button.press('Enter')
  await expect(input).toHaveValue('javiera')
  await page.getByRole('heading', { level: 1 }).click()
  await expect(input).toBeHidden()
  await button.click()
  await expect(input).toHaveValue('javiera')
  await input.press('Tab')
  await result.press('Tab')
  await expect(input).toBeHidden()
})

test('returns focus on menu Escape but not when handing off to search', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const menu = page.locator('[data-header-toggle]')
  const button = page.getByRole('button', { name: searchLabel })
  const input = page.getByRole('searchbox', { name: searchLabel })
  await menu.click()
  await menu.press('Shift+Tab')
  await expect(button).toBeFocused()
  await expect(input).toBeHidden()
  await button.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()

  await menu.press('Enter')
  await menu.press('Shift+Tab')
  await expect(button).toBeFocused()
  await button.press('Enter')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(input).toBeFocused()
})

test('switches between mobile menu and search and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const menu = page.locator('[data-header-toggle]')
  const dialog = page.getByRole('dialog', { name: 'Navegación del festival' })
  const button = page.getByRole('button', { name: searchLabel })
  const search = page.getByRole('search', { name: searchLabel })
  const input = search.getByRole('searchbox')
  await menu.click()
  await expect(dialog).toBeVisible()
  await button.click()
  await expect(dialog).toBeHidden()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(input).toBeFocused()
  expect(await search.evaluate(element => element.getAnimations().length)).toBe(0)
  await input.fill('Gepe')
  await menu.click()
  await expect(dialog).toBeVisible()
  await expect(search).toBeHidden()
  await expect(menu).toBeFocused()
  await button.click()
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('Gepe')
})
