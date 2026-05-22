<template>
  <div class="dr-field" ref="fieldRef">
    <!-- Trigger inputs -->
    <div class="dr-field__inputs">
      <button
        ref="departureRef"
        type="button"
        class="dr-field__input"
        :class="{ 'dr-field__input--active': isOpen && activeField === 'from' }"
        data-testid="dr-trigger-departure"
        :aria-label="`Departure date: ${formattedStart}`"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        @click="handleDepartureTriggerClick"
      >
        <span class="dr-field__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span class="dr-field__text">
          <span class="dr-field__label">Departure</span>
          <span class="dr-field__value">{{ formattedStart }}</span>
        </span>
      </button>

      <div class="dr-field__separator" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>

      <button
        ref="returnRef"
        type="button"
        class="dr-field__input"
        :class="{ 'dr-field__input--active': isOpen && activeField === 'to' }"
        data-testid="dr-trigger-return"
        :aria-label="`Return date: ${formattedEnd}`"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        @click="handleReturnTriggerClick"
      >
        <span class="dr-field__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span class="dr-field__text">
          <span class="dr-field__label">Return</span>
          <span class="dr-field__value">{{ formattedEnd }}</span>
        </span>
      </button>
    </div>

    <!-- Desktop popup via Teleport + floating-ui -->
    <Teleport to="body">
      <div
        v-if="isOpen && !isMobile"
        ref="floatingRef"
        class="dr-popup"
        :style="floatingStyles"
        @mousedown.self="() => {}"
      >
        <Calendar
          ref="calendarRef"
          :start="internalStart"
          :end="internalEnd"
          :hover-start="hoverStart"
          :hover-end="hoverEnd"
          :active-field="activeField"
          :min-date="effectiveMinDate"
          :max-date="effectiveMaxDate"
          :locale="locale"
          :is-mobile="false"
          @pick="handlePick"
          @hover="handleHover"
          @close="closePopup"
          @done="commitAndClose"
        />
      </div>
    </Teleport>

    <!-- Mobile fullscreen -->
    <Teleport to="body">
      <div v-if="isOpen && isMobile" class="dr-overlay">
        <Calendar
          ref="calendarRef"
          :start="internalStart"
          :end="internalEnd"
          :hover-start="hoverStart"
          :hover-end="hoverEnd"
          :active-field="activeField"
          :min-date="effectiveMinDate"
          :max-date="effectiveMaxDate"
          :locale="locale"
          :is-mobile="true"
          @pick="handlePick"
          @hover="handleHover"
          @close="handleMobileClose"
          @done="handleDone"
        />
      </div>
    </Teleport>

    <!-- Aria live region outside popup for announcements -->
    <div
      class="dr-live"
      data-testid="dr-live"
      aria-live="polite"
      aria-atomic="true"
    >{{ liveMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/vue'
import Calendar from './Calendar.vue'
import { useDateRange } from '../../composables/useDateRange'
import { useBodyScrollLock } from '../../composables/useBodyScrollLock'
import { toISO, addMonths, endOfMonth, startOfDay } from '../../utils/dates'
import type { DateRange } from './types'

const props = withDefaults(
  defineProps<{
    modelValue: DateRange
    minDate?: Date
    maxDate?: Date
    locale?: string
  }>(),
  {
    locale: 'en-US',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

// Determine if mobile at component level
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.matchMedia('(max-width: 767.98px)').matches
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Effective min/max dates
const today = new Date()
const effectiveMinDate = computed(() => {
  return props.minDate ?? new Date(today.getFullYear(), today.getMonth(), today.getDate())
})

const effectiveMaxDate = computed(() => {
  return props.maxDate ?? endOfMonth(addMonths(today, 12))
})

// Internal state (uncommitted on mobile until Done/Close)
const {
  start: internalStart,
  end: internalEnd,
  activeField,
  hoverDate,
  hoverStart,
  hoverEnd,
  pick,
  setActiveField,
} = useDateRange(
  new Date(props.modelValue.start),
  new Date(props.modelValue.end)
)

// Sync with modelValue changes
watch(
  () => props.modelValue,
  (val) => {
    internalStart.value = new Date(val.start)
    internalEnd.value = new Date(val.end)
  },
  { deep: true }
)

const isOpen = ref(false)

useBodyScrollLock(isOpen)

const liveMessage = ref('')

// Floating UI
const departureRef = ref<HTMLElement | null>(null)
const floatingRef = ref<HTMLElement | null>(null)
const fieldRef = ref<HTMLElement | null>(null)
const calendarRef = ref<InstanceType<typeof Calendar> | null>(null)

const { floatingStyles, update } = useFloating(fieldRef, floatingRef, {
  placement: 'bottom-start',
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})

const returnRef = ref<HTMLElement | null>(null)

// Formatted date display
const formattedStart = computed(() =>
  internalStart.value.toLocaleDateString(props.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
)

const formattedEnd = computed(() =>
  internalEnd.value.toLocaleDateString(props.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
)

function openPopup(field: 'from' | 'to') {
  setActiveField(field)
  isOpen.value = true
  nextTick(async () => {
    if (calendarRef.value) {
      await calendarRef.value.autoScroll()
    }
  })
}

function closePopup() {
  isOpen.value = false
  hoverDate.value = null
  // Commit on desktop close
  if (!isMobile.value) {
    commitValue()
  }
  // Return focus to trigger
  nextTick(() => {
    departureRef.value?.focus()
  })
}

function commitValue() {
  emit('update:modelValue', {
    start: new Date(internalStart.value),
    end: new Date(internalEnd.value),
  })
}

function commitAndClose() {
  commitValue()
  closePopup()
}

function handleDepartureTriggerClick() {
  if (isOpen.value) {
    if (activeField.value === 'from') {
      // Toggle: close
      closePopup()
    } else {
      // Just change active field
      setActiveField('from')
      if (!isMobile.value && calendarRef.value) {
        // On desktop, don't auto-scroll when already open
      }
    }
  } else {
    openPopup('from')
  }
}

function handleReturnTriggerClick() {
  if (isOpen.value) {
    if (activeField.value === 'to') {
      // Toggle: close
      closePopup()
    } else {
      // Just change active field
      setActiveField('to')
      if (!isMobile.value && calendarRef.value) {
        // On desktop, don't auto-scroll when already open
      }
    }
  } else {
    openPopup('to')
  }
}

function handlePick(date: Date) {
  pick(date)
  liveMessage.value = `Selected ${date.toLocaleDateString(props.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`
  // On desktop, commit immediately after each pick
  if (!isMobile.value) {
    commitValue()
  }
}

function handleHover(date: Date | null) {
  // Only apply hover on non-touch devices
  if (!isMobile.value) {
    hoverDate.value = date
  }
}

function handleMobileClose() {
  // Close without committing (but we commit anyway in spec — "both commit")
  commitValue()
  isOpen.value = false
  hoverDate.value = null
}

function handleDone() {
  commitValue()
  isOpen.value = false
  hoverDate.value = null
}

// Outside click handler (desktop only)
function handleOutsideClick(e: MouseEvent) {
  if (!isOpen.value || isMobile.value) return
  const target = e.target as Node
  // Check if click is inside field or popup
  if (fieldRef.value?.contains(target)) return
  if (floatingRef.value?.contains(target)) return
  closePopup()
}

onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style scoped>
.dr-field {
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-width: 420px;
}

.dr-field__inputs {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.06);
  transition: border-color 0.18s, box-shadow 0.18s;
}

.dr-field__inputs:focus-within {
  border-color: #6366f1;
  box-shadow: 0 2px 16px rgba(99, 102, 241, 0.14);
}

.dr-field__input {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  transition: background-color 0.15s;
  position: relative;
}

.dr-field__input:hover {
  background-color: #f1f5f9;
}

.dr-field__input--active {
  box-shadow: inset 0 0 0 2px #6366f1;
  border-radius: 11px;
  background-color: #f5f3ff;
}

.dr-field__icon {
  color: #6366f1;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.dr-field__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dr-field__label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dr-field__value {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dr-field__separator {
  color: #a5b4fc;
  padding: 0 4px;
  user-select: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  align-self: center;
}

.dr-popup {
  z-index: 9999;
  max-width: calc(100vw - 32px);
  /* position set by floating-ui */
}

.dr-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
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
</style>
