import { defineConfig, devices } from '@playwright/test'

/**
 * 🎭 Конфігурація Playwright для E2E та компонентного тестування
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Директорія з тестами
  testDir: './tests',

  // Паттерни для різних типів тестів
  projects: [
    {
      name: 'e2e',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        // Скріншоти лише при помилках
        screenshot: 'only-on-failure',
        // Відео для debugging
        video: 'retain-on-failure',
        // Trace для детального debugging
        trace: 'on-first-retry'
      }
    },
    {
      name: 'component',
      testMatch: '**/component/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Для компонентних тестів використовуємо Vite dev server
        baseURL: 'http://localhost:5173',
        screenshot: 'only-on-failure'
      }
    },
    // Мобільні тести (опціонально)
    {
      name: 'mobile-e2e',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['iPhone 13'],
        baseURL: 'http://localhost:5173'
      }
    }
  ],

  // Глобальні налаштування тестів
  use: {
    // Селектори з data-testid
    testIdAttribute: 'data-testid',
    
    // Таймаути
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    
    // Локалізація
    locale: 'uk-UA',
    timezoneId: 'Europe/Kiev',
    
    // Заголовки
    extraHTTPHeaders: {
      'Accept-Language': 'uk,en'
    }
  },

  // Налаштування виконання тестів
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Репортери
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Директорії для артефактів
  outputDir: 'test-results/',
  
  // Web Server для E2E тестів
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },

  // Очікування на селектори
  expect: {
    // Візуальні порівняння
    toHaveScreenshot: {
      threshold: 0.3,
      mode: 'strict'
    },
    // Таймаут для очікувань
    timeout: 10_000
  }
}) 