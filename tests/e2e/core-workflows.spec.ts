import { expect, test } from '@playwright/test';

test('RaceTrac thesis reaches a completed local-only demo receipt', async ({ page }) => {
  await page.goto('/targets/racetrac');
  await expect(page.getByRole('heading', { name: 'RaceTrac' })).toBeVisible();
  await page.getByRole('link', { name: /review outreach/i }).click();
  await page.getByRole('button', { name: /review exact action/i }).click();
  await expect(page.getByText(/demo—no message will be sent/i).first()).toBeVisible();
  await page.getByRole('button', { name: /lock exact action/i }).click();
  await page.getByRole('button', { name: /approve this exact action/i }).click();
  await page.getByRole('button', { name: /confirm demo presence/i }).click();
  await page.getByRole('button', { name: /complete demo action/i }).click();
  await expect(page.getByRole('heading', { name: /completed demo receipt/i })).toBeVisible();
  await expect(page.getByText(/no external provider was contacted/i)).toBeVisible();
});

test('H-E-B gate override records the right account and accountability', async ({ page }) => {
  await page.goto('/pipeline');
  await page.getByRole('button', { name: /review H-E-B blocked gate/i }).click();
  await page.getByRole('button', { name: /override with accountability/i }).click();
  await page.getByLabel(/override reason/i).fill('Founder accepts commissioning-owner uncertainty for this stage.');
  await page.getByLabel(/accountable owner/i).fill('Caleb');
  await page.getByRole('checkbox', { name: /acknowledge the risk/i }).check();
  await page.getByRole('button', { name: /record override/i }).click();
  await expect(page.getByText(/override recorded by Caleb/i)).toBeVisible();
  await expect(page.getByText(/H-E-B · July 20, 2026/i)).toBeVisible();
});

