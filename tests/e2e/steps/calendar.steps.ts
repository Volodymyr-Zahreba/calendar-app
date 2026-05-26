import { createBdd } from 'playwright-bdd'
import { expect } from '@playwright/test'

const { When, Then } = createBdd()

When('I click the Departure trigger', async ({ page }) => {
  await page.click('[data-testid="dr-trigger-departure"]')
})

When('I click the Return trigger', async ({ page }) => {
  await page.click('[data-testid="dr-trigger-return"]')
})

When('I click the Departure trigger again', async ({ page }) => {
  await page.click('[data-testid="dr-trigger-departure"]')
})

When('I click outside the calendar', async ({ page }) => {
  await page.mouse.click(10, 10)
})

When('I click the day {string}', async ({ page }, iso: string) => {
  // Exclude out-of-month days which may duplicate the same iso date
  await page.click(`[data-iso="${iso}"]:not(.dr-day--other-month)`)
})

When('I click the Next button', async ({ page }) => {
  await page.click('[data-testid="dr-next"]')
  await page.waitForTimeout(400)
})

When('I click the Prev button', async ({ page }) => {
  // Save scroll position before clicking prev
  await page.locator('[data-testid="dr-scroll"]').evaluate((el) => {
    ;(el as HTMLElement & { __scrollBefore?: number }).__scrollBefore = el.scrollLeft
  })
  await page.click('[data-testid="dr-prev"]')
  await page.waitForTimeout(400)
})

When('I click the Done button', async ({ page }) => {
  await page.click('[data-testid="dr-done"]')
})

When('I click the Close button', async ({ page }) => {
  await page.click('[data-testid="dr-close"]')
})

Then('the calendar should be visible', async ({ page }) => {
  await expect(page.locator('[data-testid="dr-calendar"]')).toBeVisible()
})

Then('the calendar should not be visible', async ({ page }) => {
  await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible()
})

Then('the calendar should show 12 months', async ({ page }) => {
  const months = page.locator('[data-testid="dr-month"]')
  await expect(months).toHaveCount(12)
})

Then('the day {string} should have class {string}', async ({ page }, iso: string, cls: string) => {
  // Exclude out-of-month days which may duplicate the same iso date
  const day = page.locator(`[data-iso="${iso}"]:not(.dr-day--other-month)`)
  await expect(day).toHaveClass(new RegExp(cls))
})

Then('out-of-month days should not have class {string}', async ({ page }, cls: string) => {
  const outOfMonthDays = page.locator('.dr-day--other-month')
  const count = await outOfMonthDays.count()
  for (let i = 0; i < count; i++) {
    await expect(outOfMonthDays.nth(i)).not.toHaveClass(new RegExp(cls))
  }
})

Then('the Departure input should be active', async ({ page }) => {
  await expect(page.locator('[data-testid="dr-trigger-departure"]')).toHaveClass(/dr-field__input--active/)
})

Then('the Return input should be active', async ({ page }) => {
  await expect(page.locator('[data-testid="dr-trigger-return"]')).toHaveClass(/dr-field__input--active/)
})

Then('the scroll position should have increased', async ({ page }) => {
  const scrollLeft = await page.locator('[data-testid="dr-scroll"]').evaluate((el) => el.scrollLeft)
  expect(scrollLeft).toBeGreaterThan(0)
})

Then('the scroll position should have decreased', async ({ page }) => {
  const { before, after } = await page.locator('[data-testid="dr-scroll"]').evaluate((el) => {
    const scrollBefore = (el as HTMLElement & { __scrollBefore?: number }).__scrollBefore ?? Infinity
    return { before: scrollBefore, after: el.scrollLeft }
  })
  expect(after).toBeLessThan(before)
})

Then('the calendar width should equal the viewport width', async ({ page }) => {
  const calendar = await page.locator('[data-testid="dr-calendar"]').boundingBox()
  const viewport = page.viewportSize()
  expect(calendar?.width).toBe(viewport?.width)
})

Then('the weekday row should be visible', async ({ page }) => {
  await expect(page.locator('[data-testid="dr-weekdays"]')).toBeVisible()
})
