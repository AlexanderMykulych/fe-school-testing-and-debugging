# 🔗 Інтеграційні тести для фронтенду

Цей проект демонструє різні підходи до інтеграційного тестування для фронтенд-розробників з використанням **Vitest**, **TypeScript**, **Vue 3** та **Pinia**.

## 📚 Що таке інтеграційні тести?

**Інтеграційні тести** перевіряють як різні частини вашого додатку працюють разом. На відміну від unit-тестів, які тестують ізольовані функції, інтеграційні тести:

- 🔗 Перевіряють взаємодію між компонентами
- 🌐 Тестують роботу з зовнішніми сервісами
- 🏗️ Валідують архітектурні рішення
- 🎯 Виявляють проблеми на рівні системи

## 🎯 Кейси, що розглядаються

### 1. [Network Mocking](src/1-network-mocking/) 📡
**Мета**: Показати як тестувати HTTP-клієнти та API інтеграцію

**Що демонструється**:
- Використання MSW (Mock Service Worker) для перехоплення запитів
- Тестування різних HTTP статусів (200, 404, 500)
- Обробка помилок мережі
- Retry логіка
- Timeout scenarios

**Ключові файли**:
- `api-client.ts` - HTTP клієнт з axios
- `user-repository.ts` - Repository pattern для API
- `user-repository.test.ts` - Інтеграційні тести

```typescript
// Приклад тестування з MSW
test('повинен отримати користувача за ID', async () => {
  const user = await userRepository.getUserById(1)
  expect(user.name).toBe('Користувач 1')
})
```

### 2. [Browser APIs Mocking](src/2-browser-apis/) 🌐
**Мета**: Показати як тестувати браузерні API

**Що демонструється**:
- Мокування localStorage/sessionStorage
- Тестування Geolocation API
- Робота з Notification API
- Обробка permissions та помилок
- Cross-browser сумісність

**Ключові файли**:
- `storage-service.ts` - Обгортка для Web Storage
- `location-service.ts` - Сервіс геолокації
- `notification-service.ts` - Управління сповіщеннями
- `browser-services.test.ts` - Тести всіх API

```typescript
// Приклад мокування localStorage
const mockStorage = {
  data: {},
  setItem: vi.fn((key, value) => mockStorage.data[key] = value),
  getItem: vi.fn(key => mockStorage.data[key] || null)
}
```

### 3. [Vue3 + Pinia Integration](src/3-vue-pinia/) ⚡
**Мета**: Показати тестування Vue компонентів з Pinia store

**Що демонструється**:
- Тестування компонентів з залежностями
- Pinia store інтеграція
- Props та events
- Computed properties та watchers
- Lifecycle hooks

**Ключові файли**:
- `stores/user-store.ts` - Pinia store з async actions
- `components/UserProfile.vue` - Компонент профілю
- `components/UserList.vue` - Компонент списку
- `user-components.test.ts` - Інтеграційні тести

```typescript
// Приклад тестування Vue + Pinia
test('повинен відобразити дані користувача з store', async () => {
  const store = useUserStore()
  store.setCurrentUser(mockUser)
  
  const wrapper = mount(UserProfile)
  expect(wrapper.find('[data-testid="user-name"]').text()).toBe(mockUser.name)
})
```

### 4. [TestContainer + Redis](src/4-testcontainer/) 🐳
**Мета**: Показати роботу з реальними зовнішніми сервісами

**Що демонструється**:
- Запуск Docker контейнерів в тестах
- Інтеграція з Redis
- Lifecycle управління контейнерами
- Real vs Mock testing
- Cleanup та ізоляція

**Ключові файли**:
- `session-service.ts` - Сервіс для роботи з Redis
- `session-service.test.ts` - Тести з TestContainer

```typescript
// Приклад з TestContainer
test('повинен зберегти та отримати сесію з Redis', async () => {
  const redisContainer = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start()
    
  // Тест з реальним Redis...
})
```

## 🚀 Запуск тестів

### Встановлення залежностей
```bash
pnpm install
```

### Запуск всіх тестів
```bash
pnpm test
```

### Запуск тестів з UI
```bash
pnpm test:ui
```

### Запуск з покриттям коду
```bash
pnpm test:coverage
```

### Запуск окремих кейсів
```bash
# Network mocking
pnpm test src/1-network-mocking

# Browser APIs
pnpm test src/2-browser-apis

# Vue + Pinia
pnpm test src/3-vue-pinia

# TestContainer
pnpm test src/4-testcontainer
```

## 🔧 Налаштування проекту

### Vitest конфігурація
```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000 // Для TestContainers
  }
})
```

### MSW налаштування
```typescript
// test/setup.ts
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 💡 Найкращі практики

### ✅ Що робити

1. **Ізолюйте тести** - кожен тест повинен бути незалежним
2. **Використовуйте data-testid** - для стабільних селекторів
3. **Тестуйте реальні сценарії** - користувацькі workflow
4. **Мокайте зовнішні залежності** - для стабільності
5. **Очищуйте після тестів** - cleanup функції
6. **Тестуйте помилки** - error scenarios
7. **Використовуйте типи** - TypeScript для безпеки

### ❌ Чого уникати

1. **Не тестуйте implementation details** - внутрішню логіку
2. **Не робіть тести залежними** - один від одного
3. **Не ігноруйте async операції** - використовуйте await
4. **Не забувайте про cleanup** - memory leaks
5. **Не тестуйте стороння библиотеки** - тільки вашу логіку

## 🎓 Навчальні цілі

Після вивчення цих прикладів ви зможете:

- 🧪 Писати ефективні інтеграційні тести
- 🎭 Використовувати різні стратегії мокування
- 🔗 Тестувати взаємодію компонентів
- 🌐 Працювати з браузерними API в тестах
- ⚡ Інтегрувати state management (Pinia)
- 🐳 Використовувати TestContainers
- 📊 Розуміти різницю між unit та інтеграційними тестами

## 📖 Додаткові ресурси

- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [TestContainers](https://testcontainers.com/)

## 🤝 Порівняння підходів

| Підхід | Переваги | Недоліки | Коли використовувати |
|--------|----------|----------|---------------------|
| **MSW** | Реалістичні HTTP тести | Складніше налаштування | API інтеграція |
| **Browser API Mocks** | Швидкі тести | Не тестує реальний API | localStorage, geolocation |
| **Component Integration** | Повна інтеграція UI | Повільніші тести | User workflows |
| **TestContainer** | Реальне середовище | Потребує Docker | Database, Redis |

## 🔍 Debugging тестів

### Логування в тестах
```typescript
// Включити логи MSW
server.use(
  http.get('/api/users', ({ request }) => {
    console.log('Request:', request.url)
    return HttpResponse.json(users)
  })
)
```

### Виводити DOM в тестах
```typescript
// Vue компоненти
console.log(wrapper.html())

// Browser APIs
console.log(localStorage.getItem('test'))
```

### Використання Vitest UI
```bash
npm run test:ui
```

---

**Автори**: Команда фронтенд розробки  
**Версія**: 1.0.0  
**Дата**: 2024

> 💡 **Підказка**: Почніть з простих прикладів (Network Mocking) і поступово переходьте до складніших (TestContainer) 