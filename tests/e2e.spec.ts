import { test, expect } from '@playwright/test';

test.describe('Jasper Sona E2E', () => {

  test('should allow signup and rolling', async ({ page }) => {
    await page.goto('/');

    // Not logged in: the RNG section renders the auth modal
    await page.getByRole('button', { name: 'Sign Up' }).first().click();

    const email = `tester-${Date.now()}@test.com`;
    await page.fill('#auth-email', email);
    await page.fill('#auth-username', 'tester');
    await page.fill('#auth-password', 'password123');
    await page.getByRole('button', { name: 'Sign Up' }).last().click();

    // Stay on home page; game section becomes visible after login
    await expect(page.getByRole('button', { name: /Execute Roll/i })).toBeVisible();

    // Game loop
    await page.getByRole('button', { name: /Execute Roll/i }).click();
    await expect(page.locator('.text-7xl')).toBeVisible(); // Result shown
  });

  test('should deny admin access for non-root users', async ({ page }) => {
    await page.goto('/x8f9a2_rootadmin');
    // Without a root session the user list never loads — no rows, no actions
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });
});
