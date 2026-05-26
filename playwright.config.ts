import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const bddTestDir = defineBddConfig({
  features: 'tests/e2e/features/**/*.feature',
  steps: 'tests/e2e/steps/**/*.ts',
  outputDir: '.features-gen',
})

export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: '75%',
  reporter: [['list'], ['html']],
  use: {
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    video: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
  },
  expect: {
    timeout: 10 * 1000,
  },
  webServer: {
    command: 'pnpm exec vite preview --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'bdd-desktop',
      testDir: bddTestDir,
      testMatch: /features\/desktop\//,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        viewport: { width: 1280, height: 720 },
        userAgent: `${devices['Desktop Chrome'].userAgent}-kiv-pw-tests`,
      },
    },
    {
      name: 'bdd-mobile',
      testDir: bddTestDir,
      testMatch: /features\/mobile\//,
      use: {
        ...devices['Pixel 7'],
        baseURL: 'http://localhost:5173',
        userAgent: `${devices['Pixel 7'].userAgent}-kiv-pw-tests`,
      },
    },
  ],
})
