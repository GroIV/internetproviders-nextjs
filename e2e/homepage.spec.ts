import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    // Check page title
    await expect(page).toHaveTitle(/InternetProviders/i)

    // Check navigation is visible
    await expect(page.locator('nav')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check navigation exists
    await expect(page.locator('nav')).toBeVisible()

    // Check some navigation links exist
    const navLinks = await page.locator('nav a').count()
    expect(navLinks).toBeGreaterThan(0)
  })

  test('should show chat interface', async ({ page }) => {
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Check chat elements exist (input or chat panel)
    const chatElements = page.locator('[class*="chat" i], [class*="Chat" i], input[placeholder*="message" i]')

    // At least one chat-related element should exist
    const count = await chatElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
