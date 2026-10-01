import { defineConfig } from '@playwright/test'
const baseURL = `http://127.0.0.1:4173${process.env.PAGES_BASE_PATH || '/hetu-luoshu/'}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    channel: process.platform === 'darwin' ? 'chrome' : undefined,
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
    trace: 'retain-on-failure',
  },
  webServer: { command: 'npm run preview -- --port 4173', url: baseURL, reuseExistingServer: !process.env.CI },
})
