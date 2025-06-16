import { test, expect } from '../fixtures/auth-fixture'

test.describe('🔐 Авторизація користувачів', () => {
  test.beforeEach(async ({ page, ensureLoggedOut }) => {
    // Переконуємося що користувач вийшов перед кожним тестом
    await ensureLoggedOut()
  })

  test('✅ Успішний логін адміністратора', async ({ page, loginAsAdmin }) => {
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

  test('✅ Успішний логін звичайного користувача', async ({ page, loginAsUser }) => {
    await loginAsUser()
    
    // Перевіряємо що користувач на головній сторінці
    await expect(page).toHaveURL('/')
    
    // Перевіряємо що відображається правильне привітання
    await expect(page.getByTestId('user-greeting')).toContainText('user')
    
    // Перевіряємо роль користувача
    await expect(page.getByTestId('user-section')).toBeVisible()
  })

  test('❌ Невдалий логін з неправильними даними', async ({ page }) => {
    await page.goto('/login')
    
    // Заповнюємо форму неправильними даними
    await page.getByTestId('username-input').fill('wrong_user')
    await page.getByTestId('password-input').fill('wrong_password')
    
    // Відправляємо форму
    await page.getByTestId('submit-button').click()
    
    // Перевіряємо що з'являється повідомлення про помилку
    await expect(page.getByTestId('error-message')).toBeVisible()
    await expect(page.getByTestId('error-message')).toContainText('Невірний логін або пароль')
    
    // Перевіряємо що залишились на сторінці логіну
    await expect(page).toHaveURL('/login')
    
    // Перевіряємо що користувач не залогінений
    await expect(page.getByTestId('user-greeting')).not.toBeVisible()
  })

  test('🔄 Логаут користувача', async ({ page, loginAsUser, logout }) => {
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
    
    // Перевіряємо що показується CTA для гостів
    await expect(page.getByTestId('guest-cta')).toBeVisible()
  })

  test('📝 Валідація форми логіну', async ({ page }) => {
    await page.goto('/login')
    
    // Перевіряємо валідацію пустих полів
    await page.getByTestId('submit-button').click()
    
    await expect(page.getByTestId('username-error')).toBeVisible()
    await expect(page.getByTestId('password-error')).toBeVisible()
    
    // Заповнюємо тільки логін
    await page.getByTestId('username-input').fill('test')
    await page.getByTestId('submit-button').click()
    
    // Логін повинен бути валідним, але пароль ще порожній
    await expect(page.getByTestId('username-error')).not.toBeVisible()
    await expect(page.getByTestId('password-error')).toBeVisible()
  })

  test('🚪 Перенаправлення з сторінки логіну для авторизованих користувачів', async ({ 
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

  test('🔒 Збереження стану авторизації при оновленні сторінки', async ({ 
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

  test('⚡ Автоматичне завершення сесії', async ({ page, loginAsUser }) => {
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

  test('👤 Відображення різних даних для різних ролей', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin()
    
    // Перевіряємо що для адміна показується правильна роль
    await expect(page.getByTestId('user-section')).toBeVisible()
    await expect(page.getByTestId('user-section')).toContainText('Адміністратор')
    
    // Виходимо та входимо як звичайний користувач
    await page.getByTestId('logout-button').click()
    
    await page.goto('/login')
    await page.getByTestId('username-input').fill('user')
    await page.getByTestId('password-input').fill('user123')
    await page.getByTestId('submit-button').click()
    
    await expect(page.getByTestId('success-notification')).toBeVisible()
    await page.waitForURL('/')
    
    // Перевіряємо що для користувача показується правильна роль
    await expect(page.getByTestId('user-section')).toBeVisible()
    await expect(page.getByTestId('user-section')).toContainText('Користувач')
  })

  test('🔄 Множинні спроби логіну', async ({ page }) => {
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
}) 