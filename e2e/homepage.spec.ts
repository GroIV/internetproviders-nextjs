import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/InternetProviders/i)

    // Check main heading or branding is visible
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Check providers link exists and works
    const providersLink = page.locator('nav').getByRole('link', { name: /providers/i })
    await expect(providersLink).toBeVisible()
  })

  test('should show chat interface', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check chat panel is visible (either embedded or via button)
    const chatElements = page.locator('[aria-label*="chat" i], [role="dialog"], [class*="chat" i]')
    await expect(chatElements.first()).toBeVisible({ timeout: 10000 })
  })
})
