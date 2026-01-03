import { test, expect } from '@playwright/test'

test.describe('Providers', () => {
  test('providers page should load', async ({ page }) => {
    await page.goto('/providers')

    // Check page loads with InternetProviders branding
    await expect(page).toHaveTitle(/InternetProviders/i)

    // Should show provider content
    await expect(page.locator('body')).toContainText(/provider/i)
  })

  test('individual provider page should load', async ({ page }) => {
    // Test a common provider page
    await page.goto('/providers/att-internet')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Should show provider name in page
    await expect(page.locator('body')).toContainText(/AT&T|att/i)
  })

  test('compare page should load', async ({ page }) => {
    await page.goto('/compare')

    // Check page loads
    await expect(page).toHaveTitle(/InternetProviders/i)
  })
})
