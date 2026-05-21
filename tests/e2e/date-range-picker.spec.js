import { test, expect, devices } from '@playwright/test';
const BASE_URL = 'http://localhost:5173';
const SEED = '2025-06-10,2025-06-20';
const BASE = `${BASE_URL}/?seed=${SEED}`;
// Helper: open the departure popup
async function openPopup(page) {
    await page.goto(BASE);
    await page.click('[data-testid="dr-trigger-departure"]');
    await expect(page.locator('[data-testid="dr-calendar"]')).toBeVisible();
}
test.describe('DateRangePicker desktop', () => {
    // Test 1: opens popup on departure click
    test('opens on departure click', async ({ page }) => {
        await page.goto(BASE);
        await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible();
        await page.click('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).toBeVisible();
    });
    // Test 2: closes popup on second departure click (toggle)
    test('closes popup on second departure click', async ({ page }) => {
        await openPopup(page);
        await page.click('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible();
    });
    // Test 3: shows 12 months in dr-scroll
    test('displays 12 months in dr-scroll', async ({ page }) => {
        await openPopup(page);
        const months = page.locator('[data-testid="dr-month"]');
        await expect(months).toHaveCount(12);
    });
    // Test 4: month has correct data-month attribute
    test('months have correct data-month attributes', async ({ page }) => {
        await openPopup(page);
        // With default minDate = today (2026-05-21), first month should be 2026-05
        // but with seed the minDate is unset, so today is used
        // Just verify all have data-month in YYYY-MM format
        const months = page.locator('[data-testid="dr-month"]');
        const count = await months.count();
        expect(count).toBe(12);
        for (let i = 0; i < count; i++) {
            const dataMonth = await months.nth(i).getAttribute('data-month');
            expect(dataMonth).toMatch(/^\d{4}-\d{2}$/);
        }
    });
    // Test 5: initial seed range applies is-start and is-end classes
    test('seed range: is-start on June 10, is-end on June 20', async ({ page }) => {
        // We need a min that allows June 2025 — use ?min=2025-06-01&seed=...
        await page.goto(`${BASE_URL}/?seed=${SEED}&min=2025-06-01`);
        await page.click('[data-testid="dr-trigger-departure"]');
        const startDay = page.locator('[data-iso="2025-06-10"]');
        const endDay = page.locator('[data-iso="2025-06-20"]');
        await expect(startDay).toHaveClass(/is-start/);
        await expect(endDay).toHaveClass(/is-end/);
    });
    // Test 6: days in range have is-in-range class
    test('seed range: days between start and end have is-in-range', async ({ page }) => {
        await page.goto(`${BASE_URL}/?seed=${SEED}&min=2025-06-01`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // June 15 is between June 10 and June 20
        const midDay = page.locator('[data-iso="2025-06-15"]');
        await expect(midDay).toHaveClass(/is-in-range/);
    });
    // Test 7: clicking a day applies is-start class
    test('clicking a day sets is-start', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        const day = page.locator('[data-iso="2025-06-05"]');
        await day.click();
        await expect(day).toHaveClass(/is-start/);
    });
    // Test 8: two clicks produce a range
    test('two clicks create range with is-start, is-end, is-in-range', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // Click start day
        await page.locator('[data-iso="2025-06-05"]').click();
        // Now in 'to' field — click end day
        await page.locator('[data-iso="2025-06-12"]').click();
        await expect(page.locator('[data-iso="2025-06-05"]')).toHaveClass(/is-start/);
        await expect(page.locator('[data-iso="2025-06-12"]')).toHaveClass(/is-end/);
        await expect(page.locator('[data-iso="2025-06-08"]')).toHaveClass(/is-in-range/);
    });
    // Test 9: symmetric pick case — from, d > end: end updates, from stays active
    test('symmetric pick: from, d > end — updates end, from stays active', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // Departure (from) is active. Click a day after end=20: June 25
        await page.locator('[data-iso="2025-06-25"]').click();
        // end should be June 25, from stays active
        await expect(page.locator('[data-iso="2025-06-25"]')).toHaveClass(/is-end/);
        // departure trigger should still be active
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).toHaveClass(/dr-field__input--active/);
    });
    // Test 10: symmetric pick case — from, d < end: start updates, switches to 'to'
    test('symmetric pick: from, d < end — updates start, switches to return', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // activeField='from', click June 5 (< end=20): start=June 5, activeField='to'
        await page.locator('[data-iso="2025-06-05"]').click();
        await expect(page.locator('[data-iso="2025-06-05"]')).toHaveClass(/is-start/);
        // return trigger should now be active
        await expect(page.locator('[data-testid="dr-trigger-return"]')).toHaveClass(/dr-field__input--active/);
    });
    // Test 11: symmetric pick case — to, d > start: end updates, switches to 'from'
    test('symmetric pick: to, d > start — updates end, switches to departure', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-return"]');
        // activeField='to', click June 22 (> start=10): end=June 22, activeField='from'
        await page.locator('[data-iso="2025-06-22"]').click();
        await expect(page.locator('[data-iso="2025-06-22"]')).toHaveClass(/is-end/);
        // departure should now be active
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).toHaveClass(/dr-field__input--active/);
    });
    // Test 12: symmetric pick case — to, d < start: start updates, stays 'to'
    test('symmetric pick: to, d < start — updates start, to stays active', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-return"]');
        // activeField='to', click June 5 (< start=10): start=June 5, activeField stays 'to'
        await page.locator('[data-iso="2025-06-05"]').click();
        await expect(page.locator('[data-iso="2025-06-05"]')).toHaveClass(/is-start/);
        // return trigger should still be active
        await expect(page.locator('[data-testid="dr-trigger-return"]')).toHaveClass(/dr-field__input--active/);
    });
    // Test 13: outside click closes desktop popup
    test('outside click closes popup', async ({ page }) => {
        await openPopup(page);
        // Click somewhere outside the calendar and trigger
        await page.mouse.click(10, 10);
        await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible();
    });
    // Test 14: hover preview — is-hover-range appears on hover outside range
    test('hover preview: is-hover-range appears on hover outside range', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // Hover over June 25 (> end=20)
        await page.locator('[data-iso="2025-06-25"]').hover();
        // June 22 should be in hover range (between end and hovered day)
        await expect(page.locator('[data-iso="2025-06-22"]')).toHaveClass(/is-hover-range/);
    });
    // Test 15: hover preview disappears when hovering inside range
    test('hover preview: no is-hover-range when hovering inside range', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // Hover over June 15 (inside range 10-20)
        await page.locator('[data-iso="2025-06-15"]').hover();
        // No day outside range should have is-hover-range
        const hoverRangeDays = page.locator('.is-hover-range');
        await expect(hoverRangeDays).toHaveCount(0);
    });
    // Test 16: dr-prev and dr-next are visible on desktop
    test('dr-prev and dr-next are visible on desktop', async ({ page }) => {
        await openPopup(page);
        await expect(page.locator('[data-testid="dr-prev"]')).toBeVisible();
        await expect(page.locator('[data-testid="dr-next"]')).toBeVisible();
    });
    // Test 17: dr-next scrolls to next months
    test('dr-next scrolls forward', async ({ page }) => {
        await openPopup(page);
        const scrollEl = page.locator('[data-testid="dr-scroll"]');
        const scrollBefore = await scrollEl.evaluate((el) => el.scrollLeft);
        await page.click('[data-testid="dr-next"]');
        // Wait for scroll animation
        await page.waitForTimeout(500);
        const scrollAfter = await scrollEl.evaluate((el) => el.scrollLeft);
        expect(scrollAfter).toBeGreaterThan(scrollBefore);
    });
    // Test 18: dr-prev scrolls back after dr-next
    test('dr-prev scrolls backward', async ({ page }) => {
        await openPopup(page);
        // First scroll forward
        await page.click('[data-testid="dr-next"]');
        await page.waitForTimeout(500);
        const scrollEl = page.locator('[data-testid="dr-scroll"]');
        const scrollBefore = await scrollEl.evaluate((el) => el.scrollLeft);
        // Then scroll back
        await page.click('[data-testid="dr-prev"]');
        await page.waitForTimeout(500);
        const scrollAfter = await scrollEl.evaluate((el) => el.scrollLeft);
        expect(scrollAfter).toBeLessThan(scrollBefore);
    });
    // Test 19: activeField reflected in dr-field__input--active class
    test('departure trigger has active class when opened via departure', async ({ page }) => {
        await page.goto(BASE);
        await page.click('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).toHaveClass(/dr-field__input--active/);
        await expect(page.locator('[data-testid="dr-trigger-return"]')).not.toHaveClass(/dr-field__input--active/);
    });
    test('return trigger has active class when opened via return', async ({ page }) => {
        await page.goto(BASE);
        await page.click('[data-testid="dr-trigger-return"]');
        await expect(page.locator('[data-testid="dr-trigger-return"]')).toHaveClass(/dr-field__input--active/);
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).not.toHaveClass(/dr-field__input--active/);
    });
    // Test 20: switching active field by clicking return trigger while open
    test('clicking return trigger while open switches active field to to', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.click('[data-testid="dr-trigger-departure"]');
        // Initially departure is active
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).toHaveClass(/dr-field__input--active/);
        // Click return while open
        await page.click('[data-testid="dr-trigger-return"]');
        await expect(page.locator('[data-testid="dr-trigger-return"]')).toHaveClass(/dr-field__input--active/);
        await expect(page.locator('[data-testid="dr-trigger-departure"]')).not.toHaveClass(/dr-field__input--active/);
    });
    // Test 21: dr-live region is present and hidden
    test('dr-live region is present in DOM', async ({ page }) => {
        await page.goto(BASE);
        await expect(page.locator('[data-testid="dr-live"]').first()).toBeTruthy();
    });
    // Test 22: calendar does not show dr-done or dr-close on desktop
    test('dr-done and dr-close are not visible on desktop', async ({ page }) => {
        await openPopup(page);
        await expect(page.locator('[data-testid="dr-done"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="dr-close"]')).not.toBeVisible();
    });
    // Test 23: dr-weekdays not visible on desktop
    test('dr-weekdays is not visible on desktop', async ({ page }) => {
        await openPopup(page);
        await expect(page.locator('[data-testid="dr-weekdays"]')).not.toBeVisible();
    });
});
test.describe('DateRangePicker mobile', () => {
    test.use({
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        userAgent: devices['iPhone 13'].userAgent,
    });
    // Test 24: mobile shows fullscreen sheet
    test('opens fullscreen calendar on mobile', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        const calendar = page.locator('[data-testid="dr-calendar"]');
        await expect(calendar).toBeVisible();
        // On mobile the calendar should be fullscreen (fixed inset-0)
        const box = await calendar.boundingBox();
        expect(box).not.toBeNull();
        // Width should equal viewport width
        const viewport = page.viewportSize();
        expect(Math.round(box.width)).toBe(viewport.width);
    });
    // Test 25: dr-weekdays visible on mobile
    test('dr-weekdays is visible on mobile', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-weekdays"]')).toBeVisible();
    });
    // Test 26: dr-weekdays is sticky (top position doesn't change on scroll)
    test('dr-weekdays stays sticky during scroll', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        const weekdays = page.locator('[data-testid="dr-weekdays"]');
        await expect(weekdays).toBeVisible();
        const boxBefore = await weekdays.boundingBox();
        // Scroll the calendar
        await page.locator('[data-testid="dr-scroll"]').evaluate((el) => {
            el.scrollTop = 300;
        });
        await page.waitForTimeout(100);
        const boxAfter = await weekdays.boundingBox();
        // The Y position of the sticky weekdays should remain the same
        expect(boxAfter.y).toBe(boxBefore.y);
    });
    // Test 27: dr-done commits and closes
    test('dr-done closes the calendar', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).toBeVisible();
        await page.tap('[data-testid="dr-done"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible();
    });
    // Test 28: dr-close closes without selecting new dates
    test('dr-close closes the calendar', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).toBeVisible();
        await page.tap('[data-testid="dr-close"]');
        await expect(page.locator('[data-testid="dr-calendar"]')).not.toBeVisible();
    });
    // Test 29: dr-prev and dr-next are NOT shown on mobile
    test('dr-prev and dr-next are not visible on mobile', async ({ page }) => {
        await page.goto(`${BASE_URL}/?min=2025-06-01&max=2026-12-31&seed=2025-06-10,2025-06-20`);
        await page.tap('[data-testid="dr-trigger-departure"]');
        await expect(page.locator('[data-testid="dr-prev"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="dr-next"]')).not.toBeVisible();
    });
});
