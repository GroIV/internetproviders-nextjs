import { test, expect } from '@playwright/test'

test.describe('Legal Pages', () => {
  test('privacy policy should load', async ({ page }) => {
    await page.goto('/privacy')

    // Check page loads with content
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('body')).toContainText(/privacy/i)
  })

  test('terms of service should load', async ({ page }) => {
    await page.goto('/terms')

    // Check page loads with content
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('body')).toContainText(/terms/i)
  })
})
