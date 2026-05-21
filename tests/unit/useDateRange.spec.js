import { describe, it, expect } from 'vitest';
import { useDateRange } from '../../src/composables/useDateRange';
// Helper to create a Date quickly
function d(year, month, day) {
    return new Date(year, month - 1, day);
}
function isoOf(date) {
    if (!date)
        return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}
describe('useDateRange pick — symmetric rule', () => {
    // Base range: start=2025-03-20, end=2025-03-25
    // Case 1 (from): d >= end -> end=d, activeField stays 'from'
    it('from, d > end: updates end, keeps from active', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'from';
        pick(d(2025, 3, 28)); // d=28 > end=25
        expect(isoOf(end.value)).toBe('2025-03-28');
        expect(isoOf(start.value)).toBe('2025-03-20'); // start unchanged
        expect(activeField.value).toBe('from'); // stays 'from'
    });
    // Case 1b (from): d === end -> end=d, activeField stays 'from'
    it('from, d === end: updates end, keeps from active', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'from';
        pick(d(2025, 3, 25)); // d=25 === end=25 (not strictly less)
        expect(isoOf(end.value)).toBe('2025-03-25');
        expect(activeField.value).toBe('from'); // stays 'from'
    });
    // Case 2 (from): d < start -> start=d, activeField='to'
    it('from, d < start: updates start, switches to to', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'from';
        pick(d(2025, 3, 15)); // d=15 < start=20, and 15 < end=25
        expect(isoOf(start.value)).toBe('2025-03-15');
        expect(isoOf(end.value)).toBe('2025-03-25'); // end unchanged
        expect(activeField.value).toBe('to'); // switches to 'to'
    });
    // Case 3 (from): start <= d < end -> start=d, activeField='to'
    it('from, start<=d<end: updates start, switches to to', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'from';
        pick(d(2025, 3, 22)); // d=22 > start=20, 22 < end=25
        expect(isoOf(start.value)).toBe('2025-03-22');
        expect(isoOf(end.value)).toBe('2025-03-25'); // end unchanged
        expect(activeField.value).toBe('to'); // switches to 'to'
    });
    // Case 4 (to): d > end -> end=d, activeField='from'
    it('to, d > end: updates end, switches to from', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'to';
        pick(d(2025, 3, 30)); // d=30 > start=20
        expect(isoOf(end.value)).toBe('2025-03-30');
        expect(isoOf(start.value)).toBe('2025-03-20'); // start unchanged
        expect(activeField.value).toBe('from'); // switches to 'from'
    });
    // Case 5 (to): d < start -> start=d, activeField stays 'to'
    it('to, d < start: updates start, keeps to active', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'to';
        pick(d(2025, 3, 10)); // d=10 < start=20
        expect(isoOf(start.value)).toBe('2025-03-10');
        expect(isoOf(end.value)).toBe('2025-03-25'); // end unchanged
        expect(activeField.value).toBe('to'); // stays 'to'
    });
    // Case 5b (to): d === start -> start=d, activeField stays 'to'
    it('to, d === start: updates start, keeps to active', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'to';
        pick(d(2025, 3, 20)); // d=20 === start=20 (not strictly greater)
        expect(isoOf(start.value)).toBe('2025-03-20');
        expect(activeField.value).toBe('to'); // stays 'to'
    });
    // Case 6 (to): start < d <= end -> end=d, activeField='from'
    it('to, start<d<=end: updates end, switches to from', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        activeField.value = 'to';
        pick(d(2025, 3, 23)); // d=23 > start=20
        expect(isoOf(end.value)).toBe('2025-03-23');
        expect(isoOf(start.value)).toBe('2025-03-20'); // start unchanged
        expect(activeField.value).toBe('from'); // switches to 'from'
    });
    it('invariant: end >= start always holds after multiple picks', () => {
        const { start, end, activeField, pick } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        // Sequence of picks to stress-test invariant
        pick(d(2025, 3, 15)); // from: 15 < end=25 -> start=15, to
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
        pick(d(2025, 3, 28)); // to: 28 > start=15 -> end=28, from
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
        pick(d(2025, 3, 5)); // from: 5 < end=28 -> start=5, to
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
        pick(d(2025, 3, 10)); // to: 10 > start=5 -> end=10, from
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
        pick(d(2025, 3, 30)); // from: 30 >= end=10 -> end=30, from stays
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
        pick(d(2025, 3, 1)); // from: 1 < end=30 -> start=1, to
        expect(start.value.getTime()).toBeLessThanOrEqual(end.value.getTime());
    });
    it('setActiveField changes activeField', () => {
        const { activeField, setActiveField } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        expect(activeField.value).toBe('from');
        setActiveField('to');
        expect(activeField.value).toBe('to');
        setActiveField('from');
        expect(activeField.value).toBe('from');
    });
});
describe('useDateRange hover preview', () => {
    it('d > end: hoverStart=start, hoverEnd=d', () => {
        const { hoverDate, hoverStart, hoverEnd, start, end } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = d(2025, 3, 30); // 30 > end=25
        expect(isoOf(hoverStart.value)).toBe('2025-03-20'); // = start
        expect(isoOf(hoverEnd.value)).toBe('2025-03-30'); // = hoverDate
    });
    it('d < start: hoverStart=d, hoverEnd=end', () => {
        const { hoverDate, hoverStart, hoverEnd } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = d(2025, 3, 10); // 10 < start=20
        expect(isoOf(hoverStart.value)).toBe('2025-03-10'); // = hoverDate
        expect(isoOf(hoverEnd.value)).toBe('2025-03-25'); // = end
    });
    it('inside range (start <= d <= end): hoverStart=null, hoverEnd=null', () => {
        const { hoverDate, hoverStart, hoverEnd } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = d(2025, 3, 22); // 22 is inside [20..25]
        expect(hoverStart.value).toBeNull();
        expect(hoverEnd.value).toBeNull();
    });
    it('d === start: hoverStart=null, hoverEnd=null (on boundary = inside)', () => {
        const { hoverDate, hoverStart, hoverEnd } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = d(2025, 3, 20); // exactly start
        expect(hoverStart.value).toBeNull();
        expect(hoverEnd.value).toBeNull();
    });
    it('d === end: hoverStart=null, hoverEnd=null (on boundary = inside)', () => {
        const { hoverDate, hoverStart, hoverEnd } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = d(2025, 3, 25); // exactly end
        expect(hoverStart.value).toBeNull();
        expect(hoverEnd.value).toBeNull();
    });
    it('hoverDate=null: hoverStart=null, hoverEnd=null', () => {
        const { hoverDate, hoverStart, hoverEnd } = useDateRange(d(2025, 3, 20), d(2025, 3, 25));
        hoverDate.value = null;
        expect(hoverStart.value).toBeNull();
        expect(hoverEnd.value).toBeNull();
    });
});
