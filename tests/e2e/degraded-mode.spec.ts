import { expect, test } from '@playwright/test';

test('email and calendar can fail while core work remains available', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel(/email source health/i).selectOption('temporarily-unavailable');
  await page.getByLabel(/calendar source health/i).selectOption('not-connected');
  await expect(page.getByText(/manual notes and tasks/i)).toBeVisible();
  await expect(page.getByText(/core workflow remains ready/i)).toBeVisible();
  await page.getByRole('link', { name: /continue to targets/i }).click();
  await expect(page.getByRole('heading', { name: 'Targets' })).toBeVisible();
  await expect(page.getByText('RaceTrac')).toBeVisible();
});

