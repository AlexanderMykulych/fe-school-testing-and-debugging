import { test, expect } from '@playwright/experimental-ct-vue'
import LoginForm from '@/components/LoginForm.vue'

test.describe('🔐 LoginForm Component', () => {
  test('📋 Відображає форму входу з усіма елементами', async ({ mount }) => {
    const component = await mount(LoginForm)

    // Перевіряємо заголовок форми
    await expect(component.locator('h2')).toContainText('Вхід в систему')

    // Перевіряємо наявність форми
    await expect(component.getByTestId('login-form')).toBeVisible()

    // Перевіряємо поля вводу
    await expect(component.getByTestId('username-input')).toBeVisible()
    await expect(component.getByTestId('password-input')).toBeVisible()

    // Перевіряємо кнопку входу
    await expect(component.getByTestId('submit-button')).toBeVisible()

    // Перевіряємо демо облікові записи
    await expect(component).toContainText('Демо облікові записи')
    await expect(component).toContainText('admin / admin123')
    await expect(component).toContainText('user / user123')
  })

  test('🔒 Кнопка входу недоступна для коротких даних', async ({ mount }) => {
    const component = await mount(LoginForm)

    // За замовчуванням кнопка має бути недоступна
    await expect(component.getByTestId('submit-button')).toBeDisabled()

    // Вводимо короткий username
    await component.getByTestId('username-input').fill('ab')
    await expect(component.getByTestId('submit-button')).toBeDisabled()

    // Вводимо короткий пароль
    await component.getByTestId('password-input').fill('12345')
    await expect(component.getByTestId('submit-button')).toBeDisabled()
  })

  test('✅ Кнопка входу доступна для валідних даних', async ({ mount }) => {
    const component = await mount(LoginForm)

    // Вводимо валідні дані
    await component.getByTestId('username-input').fill('testuser')
    await component.getByTestId('password-input').fill('password123')

    // Кнопка має стати доступною
    await expect(component.getByTestId('submit-button')).toBeEnabled()
  })

  test('🎭 Емітує подію успішного входу для валідних облікових даних', async ({ mount }) => {
    let loginSuccessEmitted = false
    let loginErrorEmitted = false
    let emittedUser: any = null

    const component = await mount(LoginForm, {
      on: {
        'loginSuccess': (user: any) => {
          loginSuccessEmitted = true
          emittedUser = user
        },
        'loginError': () => {
          loginErrorEmitted = true
        }
      }
    })

    // Вводимо валідні облікові дані адміністратора
    await component.getByTestId('username-input').fill('admin')
    await component.getByTestId('password-input').fill('admin123')

    // Відправляємо форму
    await component.getByTestId('submit-button').click()

    // Чекаємо на завершення операції входу
    await expect(component.getByTestId('submit-button')).toContainText('Вхід...', { timeout: 2000 })

    // Чекаємо на завершення входу
    await expect(component.getByTestId('submit-button')).toContainText('Увійти', { timeout: 3000 })

    // Перевіряємо що емітувалася подія успіху
    expect(loginSuccessEmitted).toBe(true)
    expect(loginErrorEmitted).toBe(false)
    expect(emittedUser).toBeTruthy()
    expect(emittedUser.username).toBe('admin')
  })

  test('🚫 Емітує подію помилки для неправильних облікових даних', async ({ mount }) => {
    let loginSuccessEmitted = false
    let loginErrorEmitted = false
    let emittedError: string = ''

    const component = await mount(LoginForm, {
      on: {
        'loginSuccess': () => {
          loginSuccessEmitted = true
        },
        'loginError': (error: string) => {
          loginErrorEmitted = true
          emittedError = error
        }
      }
    })

    // Вводимо неправильні облікові дані
    await component.getByTestId('username-input').fill('wronguser')
    await component.getByTestId('password-input').fill('wrongpassword')

    // Відправляємо форму
    await component.getByTestId('submit-button').click()

    // Чекаємо на завершення операції
    await expect(component.getByTestId('submit-button')).toContainText('Увійти', { timeout: 3000 })

    // Перевіряємо що з'явилася помилка
    await expect(component.getByTestId('error-message')).toBeVisible()
    await expect(component.getByTestId('error-message')).toContainText('Невірний логін або пароль')

    // Перевіряємо що емітувалася подія помилки
    expect(loginSuccessEmitted).toBe(false)
    expect(loginErrorEmitted).toBe(true)
    expect(emittedError).toContain('Невірний логін або пароль')
  })

  test('🔄 Очищає форму після успішного входу', async ({ mount }) => {
    const component = await mount(LoginForm)

    // Вводимо валідні дані
    await component.getByTestId('username-input').fill('user')
    await component.getByTestId('password-input').fill('user123')

    // Відправляємо форму
    await component.getByTestId('submit-button').click()

    // Чекаємо на завершення входу
    await expect(component.getByTestId('submit-button')).toContainText('Увійти', { timeout: 3000 })

    // Перевіряємо що поля очистилися
    await expect(component.getByTestId('username-input')).toHaveValue('')
    await expect(component.getByTestId('password-input')).toHaveValue('')
  })

  test('🏷️ Має правильні атрибути доступності', async ({ mount }) => {
    const component = await mount(LoginForm)

    // Перевіряємо labels
    const usernameInput = component.getByTestId('username-input')
    const passwordInput = component.getByTestId('password-input')

    await expect(usernameInput).toHaveAttribute('id', 'username')
    await expect(passwordInput).toHaveAttribute('id', 'password')

    // Перевіряємо autocomplete атрибути
    await expect(usernameInput).toHaveAttribute('autocomplete', 'username')
    await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')

    // Перевіряємо required атрибути
    await expect(usernameInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')

    // Перевіряємо placeholder тексти
    await expect(usernameInput).toHaveAttribute('placeholder', "Введіть ім'я користувача")
    await expect(passwordInput).toHaveAttribute('placeholder', 'Введіть пароль')
  })
}) 