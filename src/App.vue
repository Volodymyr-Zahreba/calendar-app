<template>
  <div class="app">
    <h1 class="app__title">Date Range Picker</h1>

    <div class="app__demo">
      <DateRangePicker
        v-model="dateRange"
        :min-date="minDate"
        :max-date="maxDate"
        locale="en-US"
      />
    </div>

    <div class="app__result" v-if="dateRange">
      <p><strong>Start:</strong> {{ formatDate(dateRange.start) }}</p>
      <p><strong>End:</strong> {{ formatDate(dateRange.end) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DateRangePicker from './components/DateRangePicker/DateRangePicker.vue'
import { parseISO, addMonths, endOfMonth } from './utils/dates'
import type { DateRange } from './components/DateRangePicker/types'

// Parse URL search params
const params = new URLSearchParams(window.location.search)

// ?seed=YYYY-MM-DD,YYYY-MM-DD
const seed = params.get('seed')
const today = new Date()
const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

let initialStart = todayStart
let initialEnd = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 7)

if (seed) {
  const parts = seed.split(',')
  if (parts.length === 2) {
    try {
      initialStart = parseISO(parts[0].trim())
      initialEnd = parseISO(parts[1].trim())
    } catch {
      // fallback to defaults
    }
  }
}

// ?min=YYYY-MM-DD
const minParam = params.get('min')
const minDate = computed<Date | undefined>(() => {
  if (minParam) {
    try { return parseISO(minParam) } catch { return undefined }
  }
  return undefined
})

// ?max=YYYY-MM-DD
const maxParam = params.get('max')
const maxDate = computed<Date | undefined>(() => {
  if (maxParam) {
    try { return parseISO(maxParam) } catch { return undefined }
  }
  return undefined
})

const dateRange = ref<DateRange>({
  start: initialStart,
  end: initialEnd,
})

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f9fafb;
  color: #111827;
}
</style>

<style scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.app__title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #111827;
}

.app__demo {
  margin-bottom: 32px;
}

.app__result {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
}
</style>
