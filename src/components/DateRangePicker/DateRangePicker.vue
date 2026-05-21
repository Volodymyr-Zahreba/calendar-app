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
        <span class="dr-field__label">Departure</span>
        <span class="dr-field__value">{{ formattedStart }}</span>
      </button>

      <div class="dr-field__separator" aria-hidden="true">→</div>

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
        <span class="dr-field__label">Return</span>
        <span class="dr-field__value">{{ formattedEnd }}</span>
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

const { floatingStyles, update } = useFloating(departureRef, floatingRef, {
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
}

.dr-field__inputs {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.dr-field__input {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  min-width: 160px;
  transition: background-color 0.15s;
  position: relative;
}

.dr-field__input:hover {
  background-color: #f9fafb;
}

.dr-field__input--active {
  /* Highlight active field with a shadow/border */
  box-shadow: inset 0 0 0 2px #2563eb;
  border-radius: 11px;
  background-color: #eff6ff;
}

.dr-field__label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dr-field__value {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin-top: 2px;
}

.dr-field__separator {
  color: #9ca3af;
  padding: 0 8px;
  user-select: none;
  flex-shrink: 0;
}

.dr-popup {
  z-index: 9999;
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
