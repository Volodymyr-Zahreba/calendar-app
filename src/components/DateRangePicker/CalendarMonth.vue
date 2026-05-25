<template>
  <div
    class="dr-month"
    data-testid="dr-month"
    :data-month="monthISO"
    role="group"
    :aria-label="monthLabel"
  >
    <div class="dr-month__header">
      <span class="dr-month__title">{{ monthLabel }}</span>
    </div>

    <table role="grid" :aria-label="monthLabel" class="dr-month__grid">
      <thead>
        <tr class="dr-month__weekdays">
          <th
            v-for="day in weekdayLabels"
            :key="day.key"
            role="columnheader"
            :aria-label="day.long"
            scope="col"
            class="dr-month__weekday"
          >
            {{ day.short }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(week, wi) in weeks" :key="wi" role="row">
          <CalendarDay
            v-for="cell in week"
            :key="cell.iso"
            :cell="cell"
            :is-start="cell.inCurrentMonth && isStart(cell.date)"
            :is-end="cell.inCurrentMonth && isEnd(cell.date)"
            :is-in-range="cell.inCurrentMonth && isInRange(cell.date)"
            :is-hover-range="cell.inCurrentMonth && isHoverRange(cell.date)"
            :is-focused="isFocused(cell.date)"
            :locale="locale"
            @pick="$emit('pick', $event)"
            @hover="$emit('hover', $event)"
            @keydown="handleDayKeydown($event, cell.date)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalendarDay from './CalendarDay.vue'
import type { DayCellMeta } from './types'
import {
  monthGrid,
  isSameDay,
  isInRange as utilIsInRange,
  toISO,
  getFirstDayOfWeek,
} from '../../utils/dates'

const props = defineProps<{
  month: Date // first day of the month
  start: Date
  end: Date
  hoverStart: Date | null
  hoverEnd: Date | null
  focusedDate: Date | null
  minDate: Date
  maxDate: Date
  locale: string
}>()

const emit = defineEmits<{
  pick: [date: Date]
  hover: [date: Date | null]
  keydown: [event: KeyboardEvent, date: Date]
}>()

const firstDayOfWeek = computed(() => getFirstDayOfWeek(props.locale))

const monthISO = computed(() => {
  const y = props.month.getFullYear()
  const m = String(props.month.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
})

const monthLabel = computed(() =>
  props.month.toLocaleDateString(props.locale, { month: 'long', year: 'numeric' })
)

const cells = computed<DayCellMeta[]>(() =>
  monthGrid(
    props.month.getFullYear(),
    props.month.getMonth(),
    firstDayOfWeek.value,
    props.minDate,
    props.maxDate,
  )
)

const weeks = computed<DayCellMeta[][]>(() => {
  const result: DayCellMeta[][] = []
  for (let i = 0; i < 6; i++) {
    result.push(cells.value.slice(i * 7, i * 7 + 7))
  }
  return result
})

const weekdayLabels = computed(() => {
  const labels = []
  for (let i = 0; i < 7; i++) {
    const dayIndex = (firstDayOfWeek.value + i) % 7
    // Use a reference date: week starting Jan 5, 2025 (Sunday)
    const refDate = new Date(2025, 0, 5 + dayIndex) // Jan 5 2025 is Sunday
    labels.push({
      key: dayIndex,
      short: refDate.toLocaleDateString(props.locale, { weekday: 'narrow' }),
      long: refDate.toLocaleDateString(props.locale, { weekday: 'long' }),
    })
  }
  return labels
})

function isStart(d: Date) {
  return isSameDay(d, props.start)
}

function isEnd(d: Date) {
  return isSameDay(d, props.end)
}

function isInRange(d: Date) {
  return utilIsInRange(d, props.start, props.end)
}

function isHoverRange(d: Date) {
  if (!props.hoverStart || !props.hoverEnd) return false
  return utilIsInRange(d, props.hoverStart, props.hoverEnd)
}

function isFocused(d: Date) {
  if (!props.focusedDate) return false
  return isSameDay(d, props.focusedDate)
}

function handleDayKeydown(e: KeyboardEvent, date: Date) {
  emit('keydown', e, date)
}
</script>

<style scoped>
.dr-month {
  flex: 0 0 340px;
  scroll-snap-align: start;
  padding: 0 8px;
}

.dr-month__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  height: 36px;
}

.dr-month__title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.dr-month__grid {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.dr-month__weekday {
  width: 40px;
  height: 32px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 0;
}

/* On mobile, hide the column headers inside each CalendarMonth
   since Calendar.vue shows a global sticky weekday row */
@media (max-width: 767.98px) {
  .dr-month__weekdays {
    display: none;
  }
}
</style>
