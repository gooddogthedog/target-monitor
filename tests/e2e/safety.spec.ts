import { expect, test } from '@playwright/test';

test('editing an approved payload fails closed', async ({ page }) => {
  await page.goto('/approvals/action-racetrac-outreach');
  await page.getByRole('button', { name: /review exact action/i }).click();
  await page.getByRole('button', { name: /lock exact action/i }).click();
  await page.getByRole('button', { name: /approve this exact action/i }).click();
  await page.getByRole('button', { name: /confirm demo presence/i }).click();
  await expect(page.getByRole('button', { name: /complete demo action/i })).toBeEnabled();
  await page.getByLabel(/exact content/i).fill('Changed payload');
  await expect(page.getByRole('status')).toContainText(/approval invalidated/i);
  await expect(page.getByRole('button', { name: /complete demo action/i })).toBeDisabled();
});

test('approval route states that it has no outbound capability', async ({ page }) => {
  await page.goto('/approvals');
  await expect(page.getByText(/nothing external can happen here/i)).toBeVisible();
  await expect(page.getByText(/demo—no message will be sent/i)).toBeVisible();
  await expect(page.getByText(/outbound disabled/i).first()).toBeVisible();
});

