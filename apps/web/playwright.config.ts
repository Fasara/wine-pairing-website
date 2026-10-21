import { defineConfig, devices } from '@playwright/test';

// BASE_URL set  -> run against an already running stack (e.g. docker compose), no servers started.
// BASE_URL unset -> start a mock API and the built Next.js app (run `npm run build` first).
const external = process.env.BASE_URL;
const baseURL = external ?? 'http://localhost:3100';
const mockApi = 'http://localhost:4010';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: external
    ? undefined
    : [
        { command: 'node e2e/mock-api.mjs', url: `${mockApi}/health`, reuseExistingServer: !process.env.CI },
        {
          command: 'npx next start -p 3100',
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          env: { API_URL: mockApi, NEXT_PUBLIC_API_URL: mockApi },
        },
      ],
});
