import { test, expect } from '@playwright/test'

test.describe('Tools', () => {
  test('speed test page should load', async ({ page }) => {
    await page.goto('/tools/speed-test')

    // Check page loads
    await expect(page).toHaveTitle(/speed/i)

    // Should show speed test interface
    await expect(page.locator('main')).toBeVisible()
  })

  test('quiz page should load', async ({ page }) => {
    await page.goto('/tools/quiz')

    // Check page loads
    await expect(page.locator('main')).toBeVisible()
  })

  test('AI assistant page should load', async ({ page }) => {
    await page.goto('/tools/ai-assistant')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Should show chat interface
    await expect(page.locator('main')).toBeVisible()
  })
})
