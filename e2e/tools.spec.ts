import { test, expect } from '@playwright/test'

test.describe('Tools', () => {
  test('speed test page should load', async ({ page }) => {
    await page.goto('/tools/speed-test')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check page loads with speed test content
    await expect(page.locator('body')).toContainText(/speed/i)
  })

  test('quiz page should load', async ({ page }) => {
    await page.goto('/tools/quiz')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check page loads
    await expect(page).toHaveTitle(/InternetProviders/i)
  })

  test('AI assistant page should load', async ({ page }) => {
    await page.goto('/tools/ai-assistant')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check page loads
    await expect(page).toHaveTitle(/InternetProviders/i)
  })
})
