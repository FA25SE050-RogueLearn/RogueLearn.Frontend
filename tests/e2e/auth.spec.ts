import { test, expect } from '@playwright/test';
import { createTestAdminClient } from '../utils/createTestClient';

test.describe('Authentication Flow', () => {
  const hasSupabaseTestEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  test.skip(!hasSupabaseTestEnv, 'Missing Supabase test env vars in `.env.test`.');

  let supabaseAdmin: ReturnType<typeof createTestAdminClient> | null = null;
  if (hasSupabaseTestEnv) {
    supabaseAdmin = createTestAdminClient();
  }

  let testUserEmail = '';
  let testUserId = '';

  test('should allow a user to sign up and verify profile creation in the database', async ({ page }) => {
    // --- 1. ARRANGE ---
    const randomString = Math.random().toString(36).substring(2, 10);
    testUserEmail = `test.user.${randomString}@mailinator.com`;
    const testUserPassword = 'Password123!';
    const testUsername = `testuser_${randomString}`;

    // --- 2. ACT ---
    await page.goto('/signup');

    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Username').fill(testUsername);
    await page.getByLabel('Email Address').fill(testUserEmail);
    await page.getByLabel('Password').fill(testUserPassword);
    await page.getByLabel(/i accept/i).check();

    await page.getByRole('button', { name: /Begin Journey/i }).click();

    // --- 3. ASSERT (UI) ---
    // Wait for the page to respond
    await page.waitForTimeout(3000);

    // Debug: Take screenshot and log page content
    await page.screenshot({ path: 'test-debug-screenshot.png', fullPage: true });
    const bodyText = await page.locator('body').textContent();
    console.log('=== PAGE CONTENT AFTER SUBMIT ===');
    console.log(bodyText);
    console.log('=================================');

    // Check for either success or error message
    const hasSuccess = await page.getByText(/Registration successful/i).count() > 0;
    const hasError = await page.locator('.text-red-400').count() > 0;

    console.log('Has success message:', hasSuccess);
    console.log('Has error message:', hasError);

    if (hasError) {
      const errorText = await page.locator('.text-red-400').textContent();
      console.log('Error message:', errorText);
    }

    // Check for success message
    const successMessage = page.getByText(/Registration successful! Please check your email to verify your account/i);
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    // --- 4. ASSERT (DATABASE) ---
    const { data: profile, error } = await supabaseAdmin!
      .from('user_profiles')
      .select('*')
      .eq('email', testUserEmail)
      .single();

    expect(error).toBeNull();
    expect(profile).not.toBeNull();
    expect(profile.username).toBe(testUsername);
    expect(profile.email).toBe(testUserEmail);
    expect(profile.first_name).toBe('Test');

    if (profile) {
      testUserId = profile.auth_user_id;
    }
  });

  test.afterAll(async () => {
    if (testUserId) {
      const { error } = await supabaseAdmin!.auth.admin.deleteUser(testUserId);
      if (error) {
        console.error('Error cleaning up user:', error.message);
      } else {
        console.log(`Successfully cleaned up user: ${testUserEmail}`);
      }
    }
  });
});
