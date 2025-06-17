import { test as base, expect, Page } from '@playwright/test'

// Типи для різних ролей користувачів
export interface User {
  username: string
  password: string
  role: 'admin' | 'user'
  displayName: string
}

// Інтерфейс для auth fixture
interface AuthFixture {
  loginAsAdmin: () => Promise<void>
  loginAsUser: () => Promise<void>
  logout: () => Promise<void>
  ensureLoggedOut: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
}

// Користувачі для тестування
const testUsers: Record<string, User> = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'admin'
  },
  user: {
    username: 'user',
    password: 'user123',
    role: 'user',
    displayName: 'user'
  }
}

// Розширюємо базовий тест з auth fixture
export const test = base.extend<AuthFixture>({
  /**
   * 🔐 Auth Fixture - автоматизує процеси авторизації
   */
  loginAsAdmin: async ({ page }, use) => {
    const loginAsAdmin = async () => {
      await loginUser(page, testUsers.admin)
    }
    await use(loginAsAdmin)
  },

  loginAsUser: async ({ page }, use) => {
    const loginAsUser = async () => {
      await loginUser(page, testUsers.user)
    }
    await use(loginAsUser)
  },

  logout: async ({ page }, use) => {
    const logout = async () => {
      // Перевіряємо чи користувач залогінений
      const userGreeting = page.getByTestId('user-greeting')
      if (await userGreeting.isVisible()) {
        await page.getByTestId('logout-button').click()
        
        // Чекаємо на перенаправлення та зміну UI
        await expect(page.getByTestId('login-link')).toBeVisible()
        await expect(userGreeting).not.toBeVisible()
      }
    }
    await use(logout)
  },

  ensureLoggedOut: async ({ page }, use) => {
    const ensureLoggedOut = async () => {
      // Переходимо на головну сторінку
      await page.goto('/')
      
      // Перевіряємо чи користувач не залогінений
      const loginLink = page.getByTestId('login-link')
      const userGreeting = page.getByTestId('user-greeting')
      
      if (await userGreeting.isVisible()) {
        // Якщо залогінений - вилогінюємося
        await page.getByTestId('logout-button').click()
        await expect(loginLink).toBeVisible()
      }
    }
    await use(ensureLoggedOut)
  },

  getCurrentUser: async ({ page }, use) => {
    const getCurrentUser = async (): Promise<User | null> => {
      const userGreeting = page.getByTestId('user-greeting')
      
      if (await userGreeting.isVisible()) {
        const greetingText = await userGreeting.textContent()
        
        // Парсимо ім'я користувача з привітання
        if (greetingText?.includes('admin')) {
          return testUsers.admin
        } else if (greetingText?.includes('user')) {
          return testUsers.user
        }
      }
      
      return null
    }
    await use(getCurrentUser)
  }
})

/**
 * 🔑 Допоміжна функція для авторизації
 */
async function loginUser(page: Page, user: User): Promise<void> {
  // Переходимо на сторінку логіну
  await page.goto('/login')
  
  // Очікуємо завантаження форми
  await expect(page.getByTestId('login-form')).toBeVisible()
  
  // Заповнюємо форму
  await page.getByTestId('username-input').fill(user.username)
  await page.getByTestId('password-input').fill(user.password)
  
  // Відправляємо форму
  await page.getByTestId('submit-button').click()
  
  // Чекаємо на успішний логін
  await expect(page.getByTestId('success-notification')).toBeVisible()
  
  // Чекаємо на перенаправлення на головну сторінку
  await page.waitForURL('/')
  
  // Перевіряємо що користувач залогінений
  await expect(page.getByTestId('user-greeting')).toBeVisible()
  await expect(page.getByTestId('user-greeting')).toContainText(user.displayName)
}

/**
 * 🧹 Допоміжна функція для очищення localStorage
 */
export async function clearAuthData(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
  })
}

/**
 * 📝 Допоміжна функція для перевірки стану авторизації
 */
export async function expectLoggedIn(page: Page, user?: User): Promise<void> {
  await expect(page.getByTestId('user-greeting')).toBeVisible()
  await expect(page.getByTestId('logout-button')).toBeVisible()
  await expect(page.getByTestId('login-link')).not.toBeVisible()
  
  if (user) {
    await expect(page.getByTestId('user-greeting')).toContainText(user.displayName)
  }
}

/**
 * 🚪 Допоміжна функція для перевірки стану гостя
 */
export async function expectLoggedOut(page: Page): Promise<void> {
  await expect(page.getByTestId('login-link')).toBeVisible()
  await expect(page.getByTestId('user-greeting')).not.toBeVisible()
  await expect(page.getByTestId('logout-button')).not.toBeVisible()
}

// Експортуємо expect для зручності
export { expect } 