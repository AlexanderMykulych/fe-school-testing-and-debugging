# Unit Testing Examples - Лекція з Тестування 🧪

Цей проект містить приклади для демонстрації ключових концепцій unit тестування у фронтенд розробці з використанням **Vitest** і **TypeScript**.

## 📋 Покриті Теми

### 1. **Чисті Функції (Pure Functions)**
- Що таке чисті функції і чому їх легко тестувати
- Приклади детермінованих функцій
- Порівняння з нечистими функціями

### 2. **Моки (Mocking)**
- Як створювати і використовувати моки
- Тестування асинхронних операцій
- Ізоляція зовнішніх залежностей

### 3. **Blackbox vs Whitebox Testing**
- **Мокісти vs Класицисти** - два підходи до тестування
- Демонстрація різниці в стилях тестування
- Переваги і недоліки кожного підходу

### 4. **Fixtures**
- Організація тестових даних
- Фабрики для створення об'єктів
- Переваги використання fixtures

### 5. **Snapshot Testing**
- Тестування складних виводів (HTML, JSON)
- Регресивне тестування
- Коли використовувати snapshot тести

## 🚀 Швидкий Старт

### Встановлення залежностей
```bash
npm install
```

### Запуск тестів
```bash
# Запустити всі тести
npm test

# Запустити тести у watch режимі
npm run test:watch

# Запустити тести з UI
npm run test:ui

# Запустити тести з coverage
npm run test:coverage
```

## 📁 Структура Проекту

```
examples/testing/unit/
├── src/
│   ├── 1-pure-functions/
│   │   └── math.ts                    # Приклади чистих функцій
│   ├── 2-mocking/
│   │   └── user-service.ts            # Сервіси для демонстрації моків
│   ├── 3-blackbox-vs-whitebox/
│   │   └── shopping-cart.ts           # Система для порівняння підходів
│   ├── 4-fixtures/
│   │   └── data-processor.ts          # Обробник даних для fixtures
│   └── 5-snapshot-testing/
│       └── report-generator.ts        # Генератор звітів для snapshots
└── test/
    ├── 1-pure-functions/
    │   └── math.test.ts               # Тести чистих функцій
    ├── 2-mocking/
    │   └── user-service.test.ts       # Приклади використання моків
    ├── 3-blackbox-vs-whitebox/
    │   ├── shopping-cart.mockist.test.ts    # Мокістський підхід
    │   └── shopping-cart.classicist.test.ts # Класицистський підхід
    ├── 4-fixtures/
    │   ├── user-data.fixtures.ts      # Тестові fixtures
    │   └── data-processor.test.ts     # Тести з fixtures
    └── 5-snapshot-testing/
        └── report-generator.test.ts   # Snapshot тести
```

## 📖 Детальний Розбір Прикладів

### 1. Чисті Функції 🧮

**Файли:** `src/1-pure-functions/math.ts`, `test/1-pure-functions/math.test.ts`

Чисті функції - це функції, які:
- Завжди повертають однаковий результат для однакових вхідних параметрів
- Не мають побічних ефектів
- Не залежать від зовнішнього стану

**Переваги тестування чистих функцій:**
- Прості для написання тестів
- Детерміновані результати
- Не потребують мокування
- Легко тестувати edge cases

```typescript
// ✅ Чиста функція
function add(a: number, b: number): number {
  return a + b;
}

// ❌ Нечиста функція
let counter = 0;
function impureIncrement(): number {
  return ++counter; // Побічний ефект
}
```

### 2. Мокування 🎭

**Файли:** `src/2-mocking/user-service.ts`, `test/2-mocking/user-service.test.ts`

Моки дозволяють:
- Ізолювати компонент від зовнішніх залежностей
- Тестувати асинхронні операції
- Контролювати поведінку залежностей
- Перевіряти взаємодії між об'єктами

```typescript
// Створення мока
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
} as any;

// Налаштування поведінки мока
(mockApiClient.get as Mock).mockResolvedValue(mockUser);

// Перевірка викликів
expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
```

### 3. Мокісти vs Класицисти ⚔️

**Файли:** `src/3-blackbox-vs-whitebox/shopping-cart.ts`

#### Мокістський підхід (Whitebox Testing)
**Файл:** `test/3-blackbox-vs-whitebox/shopping-cart.mockist.test.ts`

- Фокус на **взаємодії** між об'єктами
- Використання моків для всіх залежностей
- Тестування **поведінки**
- Знання внутрішньої реалізації

```typescript
// Мокістський стиль
it('should call discount service with correct parameters', async () => {
  await cart.checkout(customerId, location);
  
  expect(mockDiscountService.calculateDiscount)
    .toHaveBeenCalledWith(200, customerId);
});
```

#### Класицистський підхід (Blackbox Testing)
**Файл:** `test/3-blackbox-vs-whitebox/shopping-cart.classicist.test.ts`

- Фокус на **результаті** роботи системи
- Використання реальних реалізацій
- Тестування **стану**
- Мінімальне знання внутрішньої реалізації

```typescript
// Класицистський стиль
it('should calculate total with discount and tax', async () => {
  const result = await cart.checkout('customer-123', 'US');
  
  expect(result.total).toBe(1296); // 1250 - 50 + 96
  expect(result.discount).toBe(50);
});
```

**Порівняння підходів:**

| Аспект | Мокісти | Класицисти |
|--------|---------|------------|
| Фокус | Взаємодії | Результат |
| Залежності | Моки | Реальні об'єкти |
| Швидкість тестів | Дуже швидкі | Швидкі |
| Стійкість до рефакторингу | Низька | Висока |
| Виявлення помилок інтеграції | Погано | Добре |

### 4. Fixtures 📦

**Файли:** `test/4-fixtures/user-data.fixtures.ts`, `test/4-fixtures/data-processor.test.ts`

Fixtures допомагають:
- Уникнути дублювання тестових даних
- Забезпечити консистентність
- Спростити створення складних об'єктів
- Зробити тести читабельнішими

```typescript
// Базовий fixture
export const validUserFixture: RawUserData = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  // ... інші поля
};

// Фабрика fixtures
export const createUserFixture = (overrides: Partial<RawUserData> = {}): RawUserData => {
  return {
    ...validUserFixture,
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides
  };
};

// Використання в тестах
it('should process valid user data', () => {
  const result = processor.processUserData(validUserFixture);
  expect(result.fullName).toBe('John Doe');
});
```

### 5. Snapshot Testing 📸

**Файли:** `src/5-snapshot-testing/report-generator.ts`, `test/5-snapshot-testing/report-generator.test.ts`

Snapshot тести корисні для:
- Тестування складних виводів (HTML, JSON, XML)
- Регресивного тестування
- Виявлення неочікуваних змін
- Тестування форматування

```typescript
it('should generate HTML report', () => {
  const result = generator.generateUserActivityReport(sampleData);
  
  // Snapshot зберігає весь HTML і порівнює з попередніми запусками
  expect(result).toMatchSnapshot();
});
```

**Коли використовувати snapshots:**
- ✅ Складні об'єкти або рядки (HTML, JSON)
- ✅ Перевірка форматування
- ✅ Регресивне тестування
- ❌ Прості значення
- ❌ Часто змінювані дані

## 🛠️ Налаштування Vitest

**Файл:** `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,          // Глобальні функції (describe, it, expect)
    environment: 'node',    // Середовище виконання
    coverage: {
      provider: 'v8',       // Провайдер coverage
      reporter: ['text', 'json', 'html']
    }
  }
});
```

## 📊 Корисні Команди

```bash
# Оновити snapshots
npm test -- --update-snapshots

# Запустити конкретний файл тестів
npm test -- math.test.ts

# Запустити тести з фільтром
npm test -- --grep "pure functions"

# Показати coverage в браузері
npm run test:coverage && open coverage/index.html
```

## 🎯 Ключові Висновки

### Чисті функції
- Найлегші для тестування
- Завжди використовуйте їх, коли можливо
- Винесіть логіку в чисті функції

### Мокування
- Використовуйте для ізоляції компонентів
- Мокайте нестабільні залежності (API, файлова система)
- Не мокайте все підряд

### Підходи до тестування
- **Мокісти**: для unit тестів з фокусом на взаємодії
- **Класицисти**: для більш інтеграційних тестів
- Комбінуйте обидва підходи залежно від ситуації

### Fixtures
- Створюють консистентність в тестах
- Спрощують налаштування тестових даних
- Використовуйте фабрики для варіацій

### Snapshots
- Відмінні для складних виводів
- Регулярно переглядайте і оновлюйте
- Не зловживайте ними для простих значень

## 🤔 Питання для Обговорення

1. Коли краще використовувати мокістський підхід, а коли класицистський?
2. Як balance між швидкістю тестів і їх надійністю?
3. Які типи коду найскладніші для тестування і чому?
4. Як організувати тестові дані у великих проектах?
5. Коли snapshot тести можуть зашкодити, а не допомогти?

## 📚 Додаткові Ресурси

- [Vitest Documentation](https://vitest.dev/)
- [Martin Fowler - Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)
- [Kent C. Dodds - Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Happy Testing! 🚀** 