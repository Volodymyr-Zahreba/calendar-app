<template>
  <div class="app">
    <div class="app__hero">
      <h1 class="app__title">Date Range Picker</h1>
      <p class="app__subtitle">Select your travel dates</p>
    </div>

    <div class="app__card">
      <DateRangePicker
        v-model="dateRange"
        :min-date="minDate"
        :max-date="maxDate"
        locale="en-US"
      />
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
  background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
  min-height: 100vh;
  color: #111827;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.app__hero {
  text-align: center;
  margin-bottom: 32px;
}

.app__title {
  font-size: 38px;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: #fff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.app__subtitle {
  font-size: 17px;
  font-weight: 400;
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.01em;
}

.app__card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
