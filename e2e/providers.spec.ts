import { test, expect } from '@playwright/test'

test.describe('Providers', () => {
  test('providers page should load', async ({ page }) => {
    await page.goto('/providers')

    // Check page loads
    await expect(page).toHaveTitle(/providers/i)

    // Should show provider listings
    await expect(page.locator('main')).toBeVisible()
  })

  test('individual provider page should load', async ({ page }) => {
    // Test a common provider page
    await page.goto('/providers/att-internet')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Should show provider name
    await expect(page.locator('h1, [class*="title"]').first()).toBeVisible()
  })

  test('compare page should load', async ({ page }) => {
    await page.goto('/compare')

    // Check page loads
    await expect(page).toHaveTitle(/compare/i)
  })
})
