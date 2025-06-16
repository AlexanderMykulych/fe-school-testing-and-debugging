# 🎭 Frontend E2E Testing Demo

Приклад проекту з E2E та компонентним тестуванням за допомогою Playwright + TypeScript + Vue 3.

## 📦 Що включено

- ✅ **E2E тести** - тестування повного workflow додатку
- ✅ **Компонентні тести** - ізольоване тестування Vue компонентів
- ✅ **TypeScript** - строга типізація для всіх тестів
- ✅ **Fixtures** - перепередвизначені функції для автентифікації
- ✅ **Покрокові звіти** - детальна інформація про виконання тестів
- ✅ **Мокування** - імітація API викликів та даних

## 🚀 Швидкий старт

### Встановлення залежностей
```bash
npm install
```

### Встановлення браузерів Playwright
```bash
npm run install:browsers
```

### Запуск тестів

#### E2E тести
```bash
# Запуск всіх E2E тестів
npm run test:e2e

# Запуск в UI режимі
npm run test:ui

# Запуск в headed режимі (видимі браузери)
npm run test:headed

# Запуск в debug режимі
npm run test:debug
```

#### Компонентні тести
```bash
# Запуск компонентних тестів
npm run test:component
# або
npm run test:ct
```

#### Всі тести
```bash
npm test
```

### Перегляд звітів
```bash
npm run report
```

## 🧪 Структура тестів

```
tests/
├── e2e/                    # E2E тести
│   ├── auth.spec.ts       # Тести авторизації
│   └── products.spec.ts   # Тести продуктів
├── component/             # Компонентні тести
│   ├── ProductCard.spec.ts    # Тести карточки товару
│   ├── LoginForm.spec.ts      # Тести форми логіну
│   └── ShoppingCart.spec.ts   # Тести кошика
└── fixtures/              # Допоміжні функції
    └── auth-fixture.ts    # Fixtures для авторизації
```

## 🔧 Конфігурація

### E2E тести - `playwright.config.ts`
- Запуск на Chrome, Firefox, Safari
- Мобільні браузери (Chrome Mobile, Safari Mobile)
- Трейсування помилок
- Скріншоти та відео

### Компонентні тести - `playwright-ct.config.ts`
- Використання `@playwright/experimental-ct-vue`
- Підтримка Pinia для state management
- Vite конфігурація з алиасами
- Мокування localStorage

## 📋 Приклади тестів

### E2E тест авторизації
```typescript
test('✅ Успішний логін адміністратора', async ({ page, loginAsAdmin }) => {
  await loginAsAdmin()
  
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('user-greeting')).toContainText('admin')
  await expect(page.getByTestId('logout-button')).toBeVisible()
})
```

### Компонентний тест
```typescript
test('📦 Відображає інформацію про товар', async ({ mount }) => {
  const component = await mount(ProductCard, {
    props: { product: mockProduct }
  })

  await expect(component.getByTestId('product-title')).toContainText('Тестовий ноутбук')
  await expect(component.getByTestId('product-price')).toContainText('25')
})
```

## 🔌 Fixtures та Hooks

### Auth Fixtures
- `loginAsAdmin()` - вхід як адміністратор
- `loginAsUser()` - вхід як користувач
- `logout()` - вихід з системи
- `ensureLoggedOut()` - переконання що користувач не авторизований

### Component Hooks
```typescript
// playwright/index.ts
beforeMount<HooksConfig>(async ({ app, hooksConfig }) => {
  // Налаштування Pinia
  const pinia = createPinia()
  app.use(pinia)

  // Мокування авторизованого користувача
  if (hooksConfig?.mockAuthUser) {
    // localStorage мокування
  }
})
```

## 🎯 Best Practices

### Data Test IDs
Використовуйте `data-testid` атрибути для селекторів:
```html
<button data-testid="add-to-cart-button">Додати до кошика</button>
```

### Page Object Model
```typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async login(username: string, password: string) {
    await this.page.getByTestId('username-input').fill(username)
    await this.page.getByTestId('password-input').fill(password)
    await this.page.getByTestId('submit-button').click()
  }
}
```

### Тестування компонентів з пропсами
```typescript
const component = await mount(ProductCard, {
  props: {
    product: mockProduct
  },
  on: {
    'added-to-cart': (product, quantity) => {
      // Перевірка емітованих подій
    }
  }
})
```

## 🐛 Дебагінг

### Запуск одного тесту
```bash
npx playwright test --grep "назва тесту"
```

### Stepped режим
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## 📊 Звітність

Playwright генерує HTML звіти з:
- ✅ Результати тестів
- 📸 Скріншоти помилок
- 🎥 Відео записи
- 📋 Трейси виконання
- ⏱️ Метрики продуктивності

## 🔗 Корисні посилання

- [Playwright Documentation](https://playwright.dev/)
- [Component Testing Guide](https://playwright.dev/docs/test-components)
- [Vue.js Documentation](https://vuejs.org/)
- [Pinia State Management](https://pinia.vuejs.org/)

## 🤝 Contribution

Для додавання нових тестів:

1. Створіть новий `.spec.ts` файл
2. Використовуйте існуючі fixtures
3. Додайте `data-testid` атрибути в компоненти
4. Запустіть тести для перевірки

---

📝 **Примітка**: Компонентне тестування з Playwright знаходиться в експериментальній стадії. Деякі тести можуть потребувати адаптації під конкретні компоненти. 