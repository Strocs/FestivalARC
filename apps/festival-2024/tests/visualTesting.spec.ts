import { expect, test } from '@playwright/test';

test('Visual comparison between Browsers', async ({ page }) => {
  await page.goto('http://localhost:4321');

  const footer = page.locator('[data-testId="footer"]');
  await footer.scrollIntoViewIfNeeded();

  await expect(page).toHaveScreenshot('home-footer.png');
});
