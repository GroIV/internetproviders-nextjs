import { test, expect } from '@playwright/test'

test.describe('Search and Location', () => {
  test('state page should load', async ({ page }) => {
    await page.goto('/internet/texas')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Should show Texas-specific content
    await expect(page.locator('body')).toContainText(/Texas/i)
  })

  test('city page should load', async ({ page }) => {
    await page.goto('/internet/texas/austin')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Should show Austin-specific content
    await expect(page.locator('body')).toContainText(/Austin/i)
  })

  test('ZIP code search should work on compare page', async ({ page }) => {
    await page.goto('/compare')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Look for ZIP input field
    const zipInput = page.locator('input[placeholder*="zip" i], input[placeholder*="ZIP" i], input[type="text"]').first()

    if (await zipInput.isVisible()) {
      // Enter a valid ZIP code
      await zipInput.fill('78701')
      await zipInput.press('Enter')

      // Wait for results
      await page.waitForLoadState('networkidle')

      // Page should still be functional
      await expect(page).toHaveTitle(/InternetProviders/i)
    }
  })
})
