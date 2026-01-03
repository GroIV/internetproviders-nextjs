import { test, expect } from '@playwright/test'

test.describe('Legal Pages', () => {
  test('privacy policy should load', async ({ page }) => {
    await page.goto('/privacy')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check page loads with privacy content
    await expect(page.locator('body')).toContainText(/privacy/i)
  })

  test('terms of service should load', async ({ page }) => {
    await page.goto('/terms')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check page loads with terms content
    await expect(page.locator('body')).toContainText(/terms/i)
  })
})
