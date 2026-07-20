import { expect, test } from '@playwright/test';

test('primary routes remain contained at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/actions', '/brief', '/targets/racetrac', '/pipeline', '/evidence', '/approvals', '/library', '/settings']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} should not overflow horizontally`).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: /open navigation/i })).toBeVisible();
  }
});

