import { test } from '@playwright/test'

test('abrir navegador en ruta dev', async ({ page }) => {
  await page.goto('/programacion')
})
