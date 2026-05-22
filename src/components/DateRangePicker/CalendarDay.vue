<template>
  <td
    role="gridcell"
    :tabindex="tabIndex"
    :aria-label="ariaLabel"
    :aria-selected="isSelected || undefined"
    :aria-disabled="cell.isDisabled || undefined"
    :data-testid="'dr-day'"
    :data-iso="cell.iso"
    :class="[
      'dr-day',
      {
        'dr-day--other-month': !cell.inCurrentMonth,
        'dr-day--disabled': cell.isDisabled,
        'is-start': isStart,
        'is-end': isEnd,
        'is-in-range': isInRange && !isStart && !isEnd,
        'is-hover-range': isHoverRange && !isStart && !isEnd,
        'is-today': isToday,
      },
    ]"
    @click="handleClick"
    @keydown="handleKeydown"
    @mouseenter="$emit('hover', cell.date)"
    @mouseleave="$emit('hover', null)"
    @focus="$emit('hover', cell.date)"
    @blur="$emit('hover', null)"
  >
    <span class="dr-day__inner" aria-hidden="true">{{ day }}</span>
  </td>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DayCellMeta } from './types'
import { isSameDay, toISO } from '../../utils/dates'

const props = defineProps<{
  cell: DayCellMeta
  isStart: boolean
  isEnd: boolean
  isInRange: boolean
  isHoverRange: boolean
  isFocused: boolean
  locale: string
}>()

const emit = defineEmits<{
  pick: [date: Date]
  hover: [date: Date | null]
  keydown: [event: KeyboardEvent]
}>()

const today = new Date()

const isToday = computed(() => isSameDay(props.cell.date, today))
const isSelected = computed(() => props.isStart || props.isEnd)

const tabIndex = computed(() => (props.isFocused ? 0 : -1))

const day = computed(() => props.cell.date.getDate())

const ariaLabel = computed(() => {
  return props.cell.date.toLocaleDateString(props.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function handleClick(e: MouseEvent) {
  e.preventDefault()
  if (!props.cell.isDisabled) {
    emit('pick', props.cell.date)
  }
}

function handleKeydown(e: KeyboardEvent) {
  emit('keydown', e)
}
</script>

<style scoped>
.dr-day {
  width: 40px;
  height: 40px;
  padding: 0;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  position: relative;
  outline: none;
  user-select: none;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.dr-day:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
  z-index: 1;
}

.dr-day__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 auto;
  font-size: 14px;
  line-height: 1;
  color: #1e293b;
}

.dr-day:hover:not(.dr-day--disabled):not(.is-start):not(.is-end) .dr-day__inner {
  background-color: #f1f5f9;
}

.dr-day--other-month .dr-day__inner {
  color: #cbd5e1;
}

.dr-day--disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.dr-day--disabled .dr-day__inner {
  color: #cbd5e1;
  opacity: 1;
}

.dr-day.is-start,
.dr-day.is-end {
  background-color: #ede9fe;
}

.dr-day.is-start .dr-day__inner,
.dr-day.is-end .dr-day__inner {
  background-color: #6366f1;
  color: #fff;
  border-radius: 50%;
}

.dr-day.is-in-range {
  background-color: #ede9fe;
  border-radius: 0;
}

.dr-day.is-in-range .dr-day__inner {
  color: #4338ca;
}

.dr-day.is-hover-range {
  background-color: #f5f3ff;
  border-radius: 0;
}

.dr-day.is-hover-range .dr-day__inner {
  color: #4338ca;
}

.dr-day.is-today .dr-day__inner {
  font-weight: 700;
  text-decoration: underline;
}
</style>
