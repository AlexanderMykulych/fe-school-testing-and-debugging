# 🎭 Frontend E2E Testing з Playwright + TypeScript

Демонстраційний проект для навчання E2E та компонентного тестування з використанням Playwright, Vue 3 та TypeScript.

## 📁 Структура проекту

```
examples/testing/e2e/
├── package.json                    # Залежності та скрипти
├── playwright.config.ts            # Конфігурація Playwright
├── vite.config.ts                  # Конфігурація Vite
├── tsconfig.json                   # Конфігурація TypeScript
├── src/                            # Вихідний код застосування
│   ├── components/                 # Vue компоненти
│   │   ├── LoginForm.vue           # Форма логіну
│   │   ├── ProductCard.vue         # Картка товару
│   │   └── ShoppingCart.vue        # Кошик покупок
│   ├── pages/                      # Сторінки застосування
│   │   ├── HomePage.vue            # Головна сторінка
│   │   ├── LoginPage.vue           # Сторінка логіну
│   │   └── ProductsPage.vue        # Каталог товарів
│   ├── stores/                     # Pinia stores
│   │   ├── auth.ts                 # Авторизація
│   │   └── cart.ts                 # Кошик покупок
│   ├── router/                     # Vue Router
│   │   └── index.ts                # Маршрути
│   ├── App.vue                     # Головний компонент
│   └── main.ts                     # Точка входу
├── tests/                          # Тести
│   ├── fixtures/                   # Playwright fixtures
│   ├── e2e/                        # E2E тести
│   └── component/                  # Компонентні тести
└── README.md                       # Документація
```

## 🚀 Встановлення та запуск

### Встановлення залежностей

```bash
npm install
```

### Встановлення браузерів Playwright

```bash
npm run install:browsers
```

### Запуск застосування

```bash
npm run dev
```

Застосування буде доступне за адресою: http://localhost:5173

## 🧪 Запуск тестів

### Усі тести

```bash
npm test
```

### Тільки E2E тести

```bash
npm run test:e2e
```

### Тільки компонентні тести

```bash
npm run test:component
```

### UI режим для зручного debugging

```bash
npm run test:ui
```

### Debug режим

```bash
npm run test:debug
```

### Перегляд звітів

```bash
npm run report
```

## 🏗️ Архітектура застосування

### Vue 3 + Composition API
- Використання `<script setup>` синтаксису
- Reactive змінні з `ref()` та `reactive()`
- Computed властивості та watchers

### Pinia State Management
- **Auth Store**: Управління авторизацією користувачів
- **Cart Store**: Управління кошиком покупок

### Vue Router
- Навігація між сторінками
- Navigation guards для захисту маршрутів

### TypeScript
- Типізація компонентів, stores та API
- Інтерфейси для даних

## 🎯 E2E тести

### 1. Тести авторизації (`auth.spec.ts`)
- ✅ Успішний логін з валідними даними
- ❌ Неуспішний логін з невалідними даними
- 🔒 Захищені маршрути
- 🚪 Логаут

### 2. Тести покупок (`shopping-flow.spec.ts`)
- 🛒 Додавання товарів до кошика
- 📦 Оформлення замовлення
- 💰 Перевірка загальної суми
- 🗑️ Видалення товарів з кошика

### 3. Тести навігації (`navigation.spec.ts`)
- 🧭 Переходи між сторінками
- 📱 Responsive дизайн
- ♿ Доступність (accessibility)

## 🔧 Компонентні тести

### 1. LoginForm (`LoginForm.spec.ts`)
- 📝 Валідація полів форми
- 📤 Відправка форми
- ⚠️ Обробка помилок
- 🎯 Інтеракція з формою

### 2. ProductCard (`ProductCard.spec.ts`)
- 📄 Відображення даних товару
- 🛒 Додавання до кошика
- 🔢 Зміна кількості
- 📷 Завантаження зображень

### 3. ShoppingCart (`ShoppingCart.spec.ts`)
- ➕ Додавання/видалення товарів
- 🧮 Підрахунок загальної суми
- 🧹 Очищення кошика
- 📊 Відображення статистики

## 🎭 Playwright Fixtures

### Auth Fixture (`auth-fixture.ts`)
```typescript
// Автоматичний логін тестових користувачів
await use(page, {
  loginAsAdmin: () => login('admin', 'admin123'),
  loginAsUser: () => login('user', 'user123')
});
```

### API Mock Fixture (`api-mock-fixture.ts`)
```typescript
// Мокування HTTP запитів
await page.route('/api/products', route => {
  route.fulfill({ json: mockProducts });
});
```

### Test Data Fixture (`test-data-fixture.ts`)
```typescript
// Генерація тестових даних
const testProduct = {
  id: faker.number.int(),
  name: faker.commerce.productName(),
  price: faker.commerce.price()
};
```

## 🛠️ Особливості тестування

### Data Attributes
Всі компоненти містять `data-testid` атрибути для стабільних селекторів:

```vue
<template>
  <button data-testid="add-to-cart-button">
    Додати до кошика
  </button>
</template>
```

### Page Object Model
Структурований підхід до E2E тестів:

```typescript
class ProductsPage {
  constructor(private page: Page) {}
  
  async addProductToCart(productName: string) {
    await this.page.getByTestId(`product-${productName}`).click();
    await this.page.getByTestId('add-to-cart-button').click();
  }
}
```

### Accessibility Testing
Інтеграція з axe-playwright для перевірки доступності:

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should not have accessibility violations', async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page);
});
```

## 📚 Навчальні цілі

### E2E Testing
- 🔍 Розуміння різниці між E2E та компонентними тестами
- 🎪 Використання Playwright для автоматизації браузера
- 📝 Написання надійних селекторів
- 🖼️ Візуальне тестування зі скріншотами

### Component Testing
- 🧩 Тестування ізольованих компонентів
- 📡 Мокування зовнішніх залежностей
- 🎯 Тестування користувацьких інтеракцій
- 📊 Перевірка стану компонента

### Best Practices
- 🏗️ Організація тестів з fixtures
- 📋 Стратегії тестування UI
- 🐛 Debugging та troubleshooting
- 📈 Паралельне виконання тестів

## 🔧 Конфігурація

### Playwright Config
```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
```

### Demo облікові записи

| Користувач | Логін | Пароль | Роль |
|------------|-------|--------|------|
| Адміністратор | `admin` | `admin123` | admin |
| Користувач | `user` | `user123` | user |

## 🚀 Розгортання

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 📖 Корисні ресурси

- [Playwright Documentation](https://playwright.dev/)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

**Цей проект створено для навчальних цілей в рамках курсу Frontend Testing & Debugging** 🎓 