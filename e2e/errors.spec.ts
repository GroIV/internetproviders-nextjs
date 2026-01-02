import { test, expect } from '@playwright/test'

test.describe('Error Pages', () => {
  test('404 page should show for invalid routes', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist-12345')

    // Should show 404 content
    await expect(page.locator('body')).toContainText(/404|not found/i)

    // Should have a link back to home
    const homeLink = page.getByRole('link', { name: /home/i })
    await expect(homeLink).toBeVisible()
  })
})
