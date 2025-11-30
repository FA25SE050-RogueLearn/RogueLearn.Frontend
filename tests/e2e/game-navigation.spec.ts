import { test, expect } from '@playwright/test';

test.describe('Game Navigation', () => {
  test('Host Game flow shows join code and Unity player', async ({ page }) => {
    await page.goto('/game');

    // Ensure the navigation is visible
    await expect(page.getByRole('heading', { name: 'RogueLearn Multiplayer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Host Game' })).toBeVisible();

    // Start host
    await page.getByRole('button', { name: 'Host Game' }).click();

    // Loading indicator appears
    await expect(page.locator('text=Starting host... please wait.')).toBeVisible();

    // Join code panel should appear (stubbed by backend)
    await expect(page.locator('text=Join Code')).toBeVisible();
    // Copy Code button visible
    await expect(page.getByRole('button', { name: 'Copy Code' })).toBeVisible();

    // Unity container should be present
    await expect(page.locator('canvas')).toHaveCount(1);
  });

  test('Join Game flow validates join code', async ({ page }) => {
    await page.goto('/game');

    // Switch to Join mode
    await page.getByRole('button', { name: 'Join Game' }).click();

    // Web no longer shows join-code input; Unity handles it internally.
    await expect(page.getByLabel('Join Code')).toHaveCount(0);
    // Unity canvas should be present.
    await expect(page.locator('canvas')).toHaveCount(1);
  });
});