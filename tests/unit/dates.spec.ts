import { describe, it, expect } from 'vitest'
import { monthGrid, addMonths, addDays, isSameDay, isInRange, toISO, endOfMonth } from '../../src/utils/dates'

describe('dates utils', () => {
  describe('addMonths', () => {
    it('adds months', () => {
      expect(addMonths(new Date(2025, 0, 15), 1).getMonth()).toBe(1)
    })
    it('handles year rollover', () => {
      const r = addMonths(new Date(2025, 11, 15), 1)
      expect(r.getFullYear()).toBe(2026)
      expect(r.getMonth()).toBe(0)
    })
    it('clamps to last day of target month (Jan31 + 1m = Feb28)', () => {
      const r = addMonths(new Date(2025, 0, 31), 1) // Jan 31 + 1 month
      expect(r.getFullYear()).toBe(2025)
      expect(r.getMonth()).toBe(1) // February
      expect(r.getDate()).toBe(28) // clamped to Feb 28
    })
    it('subtracts months with negative delta', () => {
      const r = addMonths(new Date(2025, 5, 15), -2)
      expect(r.getMonth()).toBe(3) // April
    })
    it('preserves day when no overflow', () => {
      const r = addMonths(new Date(2025, 2, 15), 3)
      expect(r.getDate()).toBe(15)
      expect(r.getMonth()).toBe(5) // June
    })
  })

  describe('addDays', () => {
    it('adds days', () => {
      expect(addDays(new Date(2025, 0, 1), 1).getDate()).toBe(2)
    })
    it('crosses month boundary', () => {
      const r = addDays(new Date(2025, 0, 31), 1)
      expect(r.getMonth()).toBe(1)
      expect(r.getDate()).toBe(1)
    })
    it('subtracts days with negative delta', () => {
      const r = addDays(new Date(2025, 1, 1), -1)
      expect(r.getMonth()).toBe(0)
      expect(r.getDate()).toBe(31)
    })
    it('crosses year boundary', () => {
      const r = addDays(new Date(2025, 11, 31), 1)
      expect(r.getFullYear()).toBe(2026)
      expect(r.getMonth()).toBe(0)
      expect(r.getDate()).toBe(1)
    })
  })

  describe('isSameDay', () => {
    it('true for same date', () => {
      expect(isSameDay(new Date(2025, 5, 1), new Date(2025, 5, 1))).toBe(true)
    })
    it('false for different date', () => {
      expect(isSameDay(new Date(2025, 5, 1), new Date(2025, 5, 2))).toBe(false)
    })
    it('false for different month', () => {
      expect(isSameDay(new Date(2025, 5, 1), new Date(2025, 6, 1))).toBe(false)
    })
    it('false for different year', () => {
      expect(isSameDay(new Date(2025, 5, 1), new Date(2026, 5, 1))).toBe(false)
    })
    it('true ignores time component', () => {
      const a = new Date(2025, 5, 1, 10, 30, 0)
      const b = new Date(2025, 5, 1, 22, 0, 0)
      expect(isSameDay(a, b)).toBe(true)
    })
  })

  describe('isInRange', () => {
    const s = new Date(2025, 5, 10)
    const e = new Date(2025, 5, 20)
    it('true inside range', () => expect(isInRange(new Date(2025, 5, 15), s, e)).toBe(true))
    it('true on start boundary', () => {
      expect(isInRange(s, s, e)).toBe(true)
    })
    it('true on end boundary', () => {
      expect(isInRange(e, s, e)).toBe(true)
    })
    it('false one day before start', () => {
      expect(isInRange(new Date(2025, 5, 9), s, e)).toBe(false)
    })
    it('false one day after end', () => {
      expect(isInRange(new Date(2025, 5, 21), s, e)).toBe(false)
    })
    it('true for same-day range', () => {
      const d = new Date(2025, 5, 15)
      expect(isInRange(d, d, d)).toBe(true)
    })
  })

  describe('toISO', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(toISO(new Date(2025, 5, 1))).toBe('2025-06-01')
    })
    it('pads single-digit month and day', () => {
      expect(toISO(new Date(2025, 0, 5))).toBe('2025-01-05')
    })
    it('formats December correctly', () => {
      expect(toISO(new Date(2025, 11, 31))).toBe('2025-12-31')
    })
    it('formats 4-digit year correctly', () => {
      expect(toISO(new Date(2000, 0, 1))).toBe('2000-01-01')
    })
  })

  describe('endOfMonth', () => {
    it('returns last day of month for 31-day months', () => {
      expect(endOfMonth(new Date(2025, 0, 1)).getDate()).toBe(31) // January
    })
    it('returns last day of February in regular year', () => {
      expect(endOfMonth(new Date(2025, 1, 1)).getDate()).toBe(28)
    })
    it('handles leap year February', () => {
      expect(endOfMonth(new Date(2024, 1, 1)).getDate()).toBe(29)
    })
    it('returns last day for 30-day month', () => {
      expect(endOfMonth(new Date(2025, 3, 1)).getDate()).toBe(30) // April
    })
    it('returns correct month', () => {
      const r = endOfMonth(new Date(2025, 5, 1)) // June
      expect(r.getMonth()).toBe(5)
      expect(r.getDate()).toBe(30)
    })
  })

  describe('monthGrid', () => {
    it('returns 42 cells', () => {
      const grid = monthGrid(2025, 5, 1)
      expect(grid.length).toBe(42)
    })
    it('throws for year < 1900', () => {
      expect(() => monthGrid(1899, 0, 1)).toThrow()
    })
    it('does not throw for year === 1900', () => {
      expect(() => monthGrid(1900, 0, 1)).not.toThrow()
    })
    it('first cell is correct day-of-week for locale first day (Monday)', () => {
      const grid = monthGrid(2025, 5, 1) // June 2025, firstDay=Mon
      // June 2025 starts on Sunday (0), so with Monday as first day,
      // first cell should be May 26 (Mon), which is not in June
      expect(grid[0].inCurrentMonth).toBe(false)
    })
    it('cells in current month have inCurrentMonth=true', () => {
      const grid = monthGrid(2025, 5, 1)
      const juneFirst = grid.find(c => c.iso === '2025-06-01')
      expect(juneFirst?.inCurrentMonth).toBe(true)
    })
    it('cells outside current month have inCurrentMonth=false', () => {
      const grid = monthGrid(2025, 5, 1)
      // May 26 should be in grid but not in June
      const mayCell = grid.find(c => c.iso === '2025-05-26')
      expect(mayCell).toBeDefined()
      expect(mayCell?.inCurrentMonth).toBe(false)
    })
    it('all cells have correct iso format', () => {
      const grid = monthGrid(2025, 5, 1)
      for (const cell of grid) {
        expect(cell.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    })
    it('disables cells before minDate', () => {
      const minDate = new Date(2025, 5, 15) // June 15
      const grid = monthGrid(2025, 5, 1, minDate)
      const june10 = grid.find(c => c.iso === '2025-06-10')
      expect(june10?.isDisabled).toBe(true)
    })
    it('does not disable cells on or after minDate', () => {
      const minDate = new Date(2025, 5, 15) // June 15
      const grid = monthGrid(2025, 5, 1, minDate)
      const june15 = grid.find(c => c.iso === '2025-06-15')
      expect(june15?.isDisabled).toBe(false)
    })
    it('disables cells after maxDate', () => {
      const maxDate = new Date(2025, 5, 20) // June 20
      const grid = monthGrid(2025, 5, 1, undefined, maxDate)
      const june21 = grid.find(c => c.iso === '2025-06-21')
      expect(june21?.isDisabled).toBe(true)
    })
    it('does not disable cells on or before maxDate', () => {
      const maxDate = new Date(2025, 5, 20) // June 20
      const grid = monthGrid(2025, 5, 1, undefined, maxDate)
      const june20 = grid.find(c => c.iso === '2025-06-20')
      expect(june20?.isDisabled).toBe(false)
    })
    it('grid starts on Sunday when firstDay=0', () => {
      // January 2025 starts on Wednesday
      const grid = monthGrid(2025, 0, 0) // firstDay=Sunday
      // First cell should be Sunday Dec 29
      expect(grid[0].iso).toBe('2024-12-29')
    })
    it('grid starts on Monday when firstDay=1 for June 2025', () => {
      // June 2025 starts on Sunday, so with Monday first, grid starts May 26
      const grid = monthGrid(2025, 5, 1) // firstDay=Monday
      expect(grid[0].iso).toBe('2025-05-26')
    })
    it('grid cells are consecutive days', () => {
      const grid = monthGrid(2025, 5, 1)
      for (let i = 1; i < grid.length; i++) {
        const prev = grid[i - 1].date.getTime()
        const curr = grid[i].date.getTime()
        expect(curr - prev).toBe(24 * 60 * 60 * 1000)
      }
    })
  })
})
