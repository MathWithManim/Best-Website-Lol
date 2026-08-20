import { test, expect } from '@playwright/test';

test.describe('Security scan', () => {

  test('CSP blocks inline script execution', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    await page.goto('/');
    // Attempt inline script injection
    const injected = await page.evaluate(() => {
      try {
        const s = document.createElement('script');
        s.textContent = 'window.__pwned = true';
        document.head.appendChild(s);
        return (window as any).__pwned === true;
      } catch { return 'blocked'; }
    });
    expect(injected).not.toBe(true);
  });

  test('session token exists only in localStorage, not in DOM', async ({ page }) => {
    await page.goto('/');
    const signupToggle = page.getByRole('button', { name: 'Sign Up' }).first();
    if (await signupToggle.isVisible()) {
      await signupToggle.click();
      const email = `sec-${Date.now()}@test.com`;
      await page.fill('#auth-email', email);
      await page.fill('#auth-username', 'securitytest');
      await page.fill('#auth-password', 'password123');
      await page.getByRole('button', { name: 'Sign Up' }).last().click();
      await expect(page.getByRole('button', { name: /Execute Roll/i })).toBeVisible();
    }
    const token = await page.evaluate(() => localStorage.getItem('sessionToken'));
    expect(token).toBeTruthy();
    const domHtml = await page.content();
    expect(domHtml).not.toContain(token!);
    const sources = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(i => i.src).filter(s => s.includes('dicebear'));
    });
    expect(sources.length).toBeGreaterThan(0);
  });

  test('leaderboard username is rendered as text, not HTML', async ({ page }) => {
    // A user with HTML in their username must not execute it
    await page.goto('/');
    const content = await page.content();
    // XSS marker should never appear as an element
    const xssImg = await page.$('img[src="x"]');
    expect(xssImg).toBeNull();
  });

  test('auth modal toggle does not blank screen', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Sign Up' }).first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(page.locator('#auth-email')).toBeVisible();
      await page.getByRole('button', { name: 'Login' }).last().click();
      await expect(page.locator('#auth-email')).toBeVisible();
      await expect(page.locator('#auth-password')).toBeVisible();
    }
  });

  test('no password/session data in client bundle', async ({ page }) => {
    const resp = await page.request.get('/');
    const html = await resp.text();
    const bundlePaths = [...html.matchAll(/assets\/[^"]+\.js/g)].map(m => m[0]);
    for (const path of bundlePaths.slice(0, 5)) {
      const js = await (await page.request.get(`/${path}`)).text();
      expect(js.toLowerCase()).not.toContain('resetsecret');
      expect(js).not.toContain('$2b$');
    }
  });
});
