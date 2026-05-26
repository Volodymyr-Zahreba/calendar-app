import { createBdd } from 'playwright-bdd'

const { Given } = createBdd()

const BASE = 'http://localhost:5173'

Given('I open the app with seed {string}', async ({ page }, seed: string) => {
  // Extract the start date from seed and set min one month before to ensure calendar renders past dates
  const startDate = seed.split(',')[0]
  if (startDate) {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() - 1)
    const min = d.toISOString().slice(0, 10)
    await page.goto(`${BASE}/?seed=${seed}&min=${min}`)
  } else {
    await page.goto(`${BASE}/?seed=${seed}`)
  }
})
