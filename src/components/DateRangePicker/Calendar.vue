<template>
  <div
    ref="dialogRef"
    class="dr-calendar"
    :class="{ 'dr-calendar--mobile': isMobile, 'dr-calendar--desktop': !isMobile }"
    data-testid="dr-calendar"
    role="dialog"
    aria-modal="true"
    aria-label="Choose dates"
    @keydown="handleDialogKeydown"
  >
    <!-- Mobile header -->
    <div v-if="isMobile" class="dr-header dr-header--mobile">
      <span class="dr-header__title">Select dates</span>
      <button
        class="dr-close"
        data-testid="dr-close"
        type="button"
        aria-label="Close"
        @click="handleClose"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Mobile sticky weekday row -->
    <div v-if="isMobile" class="dr-weekdays" data-testid="dr-weekdays" aria-hidden="true">
      <span v-for="day in weekdayLabels" :key="day.key" class="dr-weekdays__day">
        {{ day.short }}
      </span>
    </div>

    <!-- Desktop navigation buttons -->
    <template v-if="!isMobile">
      <button
        class="dr-prev"
        data-testid="dr-prev"
        type="button"
        aria-label="Previous months"
        :disabled="atStart"
        @click="scrollPrev"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="dr-next"
        data-testid="dr-next"
        type="button"
        aria-label="Next months"
        :disabled="atEnd"
        @click="scrollNext"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M8 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </template>

    <!-- Scroll container -->
    <div
      ref="scrollRef"
      class="dr-scroll"
      data-testid="dr-scroll"
      @scroll.passive="updateScrollState"
    >
      <CalendarMonth
        v-for="month in months"
        :key="toISO(month)"
        :month="month"
        :start="start"
        :end="end"
        :hover-start="hoverStart"
        :hover-end="hoverEnd"
        :focused-date="focusedDate"
        :min-date="minDate"
        :max-date="maxDate"
        :locale="locale"
        @pick="handlePick"
        @hover="handleHover"
        @keydown="handleDayKeydown"
      />
    </div>

    <!-- Mobile footer -->
    <div v-if="isMobile" class="dr-footer dr-footer--mobile">
      <button
        class="dr-done"
        data-testid="dr-done"
        type="button"
        @click="handleDone"
      >
        Done
      </button>
    </div>

    <!-- Aria live region -->
    <div
      class="dr-live"
      data-testid="dr-live"
      aria-live="polite"
      aria-atomic="true"
    >{{ liveMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import CalendarMonth from './CalendarMonth.vue'
import { useMonthList } from '../../composables/useMonthList'
import { useFocusTrap } from '../../composables/useFocusTrap'
import {
  toISO,
  addDays,
  addMonths,
  isSameDay,
  getFirstDayOfWeek,
} from '../../utils/dates'
import type { ActiveField } from '../../composables/useDateRange'

const props = defineProps<{
  start: Date
  end: Date
  hoverStart: Date | null
  hoverEnd: Date | null
  activeField: ActiveField
  minDate: Date
  maxDate: Date
  locale: string
  isMobile: boolean
}>()

const emit = defineEmits<{
  pick: [date: Date]
  hover: [date: Date | null]
  close: []
  done: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)

const minDateRef = computed(() => props.minDate)
const { months } = useMonthList(minDateRef)

const { focusFirst } = useFocusTrap(dialogRef)

// Focused date for keyboard navigation (roving tabindex)
const focusedDate = ref<Date>(
  new Date(props.start.getFullYear(), props.start.getMonth(), props.start.getDate())
)

// Scroll state for disabling prev/next
const atStart = ref(true)
const atEnd = ref(false)
const MONTH_WIDTH = 340

// Live region message
const liveMessage = ref('')

// Weekday labels (for mobile sticky row)
const firstDayOfWeek = computed(() => getFirstDayOfWeek(props.locale))
const weekdayLabels = computed(() => {
  const labels = []
  for (let i = 0; i < 7; i++) {
    const dayIndex = (firstDayOfWeek.value + i) % 7
    const refDate = new Date(2025, 0, 5 + dayIndex)
    labels.push({
      key: dayIndex,
      short: refDate.toLocaleDateString(props.locale, { weekday: 'narrow' }),
      long: refDate.toLocaleDateString(props.locale, { weekday: 'long' }),
    })
  }
  return labels
})

function updateScrollState() {
  const el = scrollRef.value
  if (!el) return
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}

function scrollPrev() {
  scrollRef.value?.scrollBy({ left: -MONTH_WIDTH, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

function scrollNext() {
  scrollRef.value?.scrollBy({ left: MONTH_WIDTH, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getMonthEl(month: Date): HTMLElement | null {
  const iso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null
}

function getStartMonthEl(): HTMLElement | null {
  const iso = `${props.start.getFullYear()}-${String(props.start.getMonth() + 1).padStart(2, '0')}`
  return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null
}

function getEndMonthEl(): HTMLElement | null {
  const iso = `${props.end.getFullYear()}-${String(props.end.getMonth() + 1).padStart(2, '0')}`
  return scrollRef.value?.querySelector(`[data-month="${iso}"]`) ?? null
}

async function autoScroll() {
  await nextTick()
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  if (props.isMobile) {
    let target: HTMLElement | null
    if (props.activeField === 'from') {
      target = getStartMonthEl()
    } else {
      target = getEndMonthEl()
    }
    target?.scrollIntoView({ block: 'start', behavior })
  } else {
    // Desktop
    if (props.activeField === 'from') {
      const el = getStartMonthEl()
      el?.scrollIntoView({ inline: 'start', behavior })
    } else {
      // Try endMonth - 1
      const prevEnd = addMonths(props.end, -1)
      let el = getMonthEl(prevEnd) ?? getEndMonthEl()
      el?.scrollIntoView({ inline: 'start', behavior })
    }
  }
  // Update scroll state after scroll
  setTimeout(updateScrollState, 350)
}

onMounted(async () => {
  await autoScroll()
  updateScrollState()

  // Focus the start date cell initially
  await nextTick()
  focusCell(props.start)
})

// Watch for focusedDate change and focus the element
watch(focusedDate, async (newDate) => {
  await nextTick()
  focusCell(newDate)
  // Announce the date
  liveMessage.value = newDate.toLocaleDateString(props.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function focusCell(date: Date) {
  const iso = toISO(date)
  const cell = scrollRef.value?.querySelector<HTMLElement>(`[data-iso="${iso}"]`)
  if (cell) {
    cell.focus({ preventScroll: false })
  }
}

function handlePick(date: Date) {
  emit('pick', date)
  // Update focused date after pick
  focusedDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function handleHover(date: Date | null) {
  emit('hover', date)
}

function handleClose() {
  emit('close')
}

function handleDone() {
  emit('done')
}

function clampToRange(date: Date): Date {
  const min = new Date(props.minDate.getFullYear(), props.minDate.getMonth(), props.minDate.getDate())
  const max = new Date(props.maxDate.getFullYear(), props.maxDate.getMonth(), props.maxDate.getDate())
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (d < min) return min
  if (d > max) return max
  return d
}

function handleDayKeydown(e: KeyboardEvent, date: Date) {
  let newDate: Date | null = null

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      newDate = addDays(date, -1)
      break
    case 'ArrowRight':
      e.preventDefault()
      newDate = addDays(date, 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      newDate = addDays(date, -7)
      break
    case 'ArrowDown':
      e.preventDefault()
      newDate = addDays(date, 7)
      break
    case 'PageUp':
      e.preventDefault()
      if (e.shiftKey) {
        newDate = addMonths(date, -12)
      } else {
        newDate = addMonths(date, -1)
      }
      break
    case 'PageDown':
      e.preventDefault()
      if (e.shiftKey) {
        newDate = addMonths(date, 12)
      } else {
        newDate = addMonths(date, 1)
      }
      break
    case 'Home': {
      e.preventDefault()
      // Go to Monday of the current week
      const dow = date.getDay()
      const daysToMonday = (dow + 6) % 7
      newDate = addDays(date, -daysToMonday)
      break
    }
    case 'End': {
      e.preventDefault()
      // Go to Sunday of current week
      const dow2 = date.getDay()
      const daysToSunday = (7 - dow2) % 7
      newDate = addDays(date, daysToSunday)
      break
    }
    case 'Enter':
    case ' ':
      e.preventDefault()
      handlePick(date)
      return
    case 'Escape':
      e.preventDefault()
      emit('close')
      return
    default:
      return
  }

  if (newDate) {
    const clamped = clampToRange(newDate)
    focusedDate.value = clamped
    // Ensure the month containing the new date is visible
    ensureMonthVisible(clamped)
  }
}

function ensureMonthVisible(date: Date) {
  nextTick(() => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthEl = scrollRef.value?.querySelector<HTMLElement>(`[data-month="${iso}"]`)
    if (monthEl && props.isMobile) {
      monthEl.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    } else if (monthEl && !props.isMobile) {
      const scrollEl = scrollRef.value!
      const elLeft = monthEl.offsetLeft
      const elRight = elLeft + MONTH_WIDTH
      const scrollLeft = scrollEl.scrollLeft
      const clientW = scrollEl.clientWidth
      if (elLeft < scrollLeft) {
        scrollEl.scrollTo({ left: elLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      } else if (elRight > scrollLeft + clientW) {
        scrollEl.scrollTo({
          left: elRight - clientW,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        })
      }
    }
  })
}

function handleDialogKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}

// Expose autoScroll so parent can call it
defineExpose({ autoScroll, focusFirst })
</script>

<style scoped>
.dr-calendar {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.10);
  border: 1px solid #e2e8f0;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* ===== Desktop ===== */
.dr-calendar--desktop {
  width: 744px;
  padding: 32px;
  padding-top: 56px; /* space for nav buttons */
  max-height: calc(100vh - 120px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dr-prev,
.dr-next {
  position: absolute;
  top: 32px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #475569;
  transition: background-color 0.15s;
}

.dr-prev:hover:not([disabled]),
.dr-next:hover:not([disabled]) {
  background-color: #e2e8f0;
  color: #1e293b;
}

.dr-prev:disabled,
.dr-next:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dr-prev {
  left: 32px;
}

.dr-next {
  right: 32px;
}

/* Desktop scroll container */
.dr-calendar--desktop .dr-scroll {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  overflow-y: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 24px;
  /* hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dr-calendar--desktop .dr-scroll::-webkit-scrollbar {
  display: none;
}

/* ===== Mobile ===== */
.dr-calendar--mobile {
  position: fixed;
  inset: 0;
  height: 100dvh;
  width: 100%;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.dr-header--mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 3;
  background: #fff;
  flex-shrink: 0;
}

.dr-header__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.dr-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dr-close:hover {
  background-color: #f3f4f6;
}

.dr-weekdays {
  display: flex;
  padding: 0 20px;
  background: #fff;
  position: sticky;
  top: 53px; /* adjust to header height */
  z-index: 2;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.dr-weekdays__day {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  padding: 8px 0;
}

/* Mobile scroll container */
.dr-calendar--mobile .dr-scroll {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  overscroll-behavior: contain;
  padding: 0 20px;
}

.dr-footer--mobile {
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  background: #fff;
  flex-shrink: 0;
}

.dr-done {
  width: 100%;
  background-color: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
}

.dr-done:hover {
  background-color: #4f46e5;
}

/* Aria live region - visually hidden */
.dr-live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dr-scroll {
    scroll-behavior: auto !important;
  }
}
</style>
