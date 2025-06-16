import { beforeMount, afterMount } from '@playwright/experimental-ct-vue/hooks'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import type { App } from 'vue'

export type HooksConfig = {
  /* You can add any configuration you need for your components here */
  enableRouting?: boolean
  mockAuthUser?: {
    id: number
    username: string
    role: 'admin' | 'user'
  }
}

beforeMount<HooksConfig>(async ({ app, hooksConfig }) => {
  // Додаємо Pinia для state management
  const pinia = createPinia()
  app.use(pinia)

  // Якщо потрібно встановити мок користувача для тестування
  if (hooksConfig?.mockAuthUser) {
    // Імітуємо localStorage для тестування авторизації
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => {
          if (key === 'user') {
            return JSON.stringify(hooksConfig.mockAuthUser)
          }
          return null
        },
        setItem: () => { },
        removeItem: () => { },
        clear: () => { },
      },
      writable: true,
    })
  }

  // Додаємо глобальні стилі для тестування (опціонально)
  const style = document.createElement('style')
  style.textContent = `
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
    }
    
    * {
      box-sizing: border-box;
    }
  `
  document.head.appendChild(style)
})

afterMount(async () => {
  // Очищення після тесту
  console.log('Component test completed')
}) 