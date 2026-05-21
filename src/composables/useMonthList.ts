import { computed } from 'vue'
import type { Ref } from 'vue'
import { addMonths } from '../utils/dates'

/**
 * Returns an array of 12 Date objects (first day of each month)
 * starting from the month of minDate.
 */
export function useMonthList(minDate: Ref<Date>) {
  const months = computed<Date[]>(() => {
    const result: Date[] = []
    const base = new Date(minDate.value.getFullYear(), minDate.value.getMonth(), 1)
    for (let i = 0; i < 12; i++) {
      result.push(addMonths(base, i))
    }
    return result
  })

  return { months }
}
