import { test, expect } from '../fixtures/auth-fixture'

test.beforeEach(async ({ page, ensureLoggedOut }) => {
  // Переконуємося що користувач вийшов перед кожним тестом
  await ensureLoggedOut()
})

test('successful admin login', async ({ page, loginAsAdmin }) => {
  await loginAsAdmin()

  // Перевіряємо що користувач на головній сторінці
  await expect(page).toHaveURL('/')

  // Перевіряємо що відображається правильне привітання
  await expect(page.getByTestId('user-greeting')).toContainText('admin')

  // Перевіряємо що кнопка логауту доступна
  await expect(page.getByTestId('logout-button')).toBeVisible()

  // Перевіряємо що кнопка логіну не відображається
  await expect(page.getByTestId('login-link')).not.toBeVisible()
})

test('successful regular user login', async ({ page, loginAsUser }) => {
  await loginAsUser()

  // Перевіряємо що користувач на головній сторінці
  await expect(page).toHaveURL('/')

  // Перевіряємо що відображається правильне привітання
  await expect(page.getByTestId('user-greeting')).toContainText('user')

  // Перевіряємо роль користувача
  await expect(page.getByTestId('user-section')).toBeVisible()
})

test('failed login with incorrect credentials', async ({ page }) => {
  await page.goto('/login')

  // Заповнюємо форму неправильними даними
  await page.getByTestId('username-input').fill('wrong_user')
  await page.getByTestId('password-input').fill('wrong_password')

  // Відправляємо форму
  await page.getByTestId('submit-button').click()

  // Перевіряємо що з'являється повідомлення про помилку
  await expect(page.getByTestId('error-message')).toBeVisible()
  await expect(page.getByTestId('error-message')).toContainText('Невірний логін або пароль')

  // Перевіряємо що залишались на сторінці логіну
  await expect(page).toHaveURL('/login')

  // Перевіряємо що користувач не залогінений
  await expect(page.getByTestId('user-greeting')).not.toBeVisible()
})

test('user logout', async ({ page, loginAsUser, logout }) => {
  // Спочатку логінимося
  await loginAsUser()

  // Перевіряємо що залогінені
  await expect(page.getByTestId('user-greeting')).toBeVisible()

  // Виконуємо логаут
  await logout()

  // Перевіряємо що перенаправило на головну сторінку
  await expect(page).toHaveURL('/')

  // Перевіряємо що користувач розлогінений
  await expect(page.getByTestId('login-link')).toBeVisible()
  await expect(page.getByTestId('user-greeting')).not.toBeVisible()

  // Перевіряємо що показується CTA для гостей
  await expect(page.getByTestId('guest-cta')).toBeVisible()
})

test('login form validation', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByTestId('submit-button')).toBeDisabled()

  await page.getByTestId('username-input').fill('test')
  await expect(page.getByTestId('submit-button')).toBeDisabled()

  await page.getByTestId('password-input').fill('test1234')
  await expect(page.getByTestId('submit-button')).toBeEnabled()
})

test('redirect from login page for authenticated users', async ({
  page,
  loginAsUser
}) => {
  // Логінимося
  await loginAsUser()

  // Пробуємо перейти на сторінку логіну
  await page.goto('/login')

  // Перевіряємо що перенаправило на головну сторінку
  await expect(page).toHaveURL('/')

  // Перевіряємо що користувач залишається залогіненим
  await expect(page.getByTestId('user-greeting')).toBeVisible()
})

test('preserve authentication state on page refresh', async ({
  page,
  loginAsAdmin
}) => {
  // Логінимося
  await loginAsAdmin()

  // Оновлюємо сторінку
  await page.reload()

  // Перевіряємо що користувач залишається залогіненим
  await expect(page.getByTestId('user-greeting')).toBeVisible()
  await expect(page.getByTestId('user-greeting')).toContainText('admin')
})

test('automatic session termination', async ({ page, loginAsUser }) => {
  await loginAsUser()

  // Симулюємо видалення токена з localStorage (автоматичний логаут)
  await page.evaluate(() => {
    localStorage.removeItem('user')
  })

  // Оновлюємо сторінку
  await page.reload()

  // Перевіряємо що користувач автоматично розлогінений
  await expect(page.getByTestId('login-link')).toBeVisible()
  await expect(page.getByTestId('user-greeting')).not.toBeVisible()
})

test('display different data for different roles', async ({ page, loginAsAdmin, logout, loginAsUser }) => {
  await loginAsAdmin()

  // Перевіряємо що для адміна показується правильна роль
  await expect(page.getByTestId('user-section')).toBeVisible()
  await expect(page.getByTestId('user-section')).toContainText('Адміністратор')

  // Виходимо з системи
  await logout()

  // Входимо як звичайний користувач
  await loginAsUser()

  // Перевіряємо що для користувача показується правильна роль
  await expect(page.getByTestId('user-section')).toBeVisible()
  await expect(page.getByTestId('user-section')).toContainText('Користувач')
})

test('multiple login attempts', async ({ page }) => {
  await page.goto('/login')

  // Декілька невдалих спроб
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('username-input').fill(`wrong_user_${i}`)
    await page.getByTestId('password-input').fill(`wrong_password_${i}`)
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('error-message')).toBeVisible()

    // Очищуємо поля для наступної спроби
    await page.getByTestId('username-input').clear()
    await page.getByTestId('password-input').clear()
  }

  // Після цього успішний логін
  await page.getByTestId('username-input').fill('admin')
  await page.getByTestId('password-input').fill('admin123')
  await page.getByTestId('submit-button').click()

  await expect(page.getByTestId('success-notification')).toBeVisible()
  await page.waitForURL('/')
}) 