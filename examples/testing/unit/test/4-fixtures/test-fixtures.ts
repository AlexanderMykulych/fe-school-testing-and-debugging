import { test as baseTest } from 'vitest';
import { RawUserData } from '../../src/4-fixtures/data-processor';

/**
 * VITEST FIXTURES через test.extend
 * 
 * Fixtures в Vitest - це потужний механізм для:
 * - Підготовки тестового контексту
 * - Переіспользування логіки між тестами
 * - Автоматичного setup/teardown
 * - Dependency injection в тести
 */

// Інтерфейс для наших fixtures
interface TestFixtures {
  // Базовий валідний користувач
  validUser: RawUserData;
  
  // Активний користувач (недавно логінився)
  activeUser: RawUserData;
  
  // Неактивний користувач
  inactiveUser: RawUserData;
  
  // Масив користувачів для batch тестування
  usersBatch: RawUserData[];
  
  // Невалідний користувач для тестування помилок
  invalidUser: RawUserData;
  
  // База даних користувачів (імітація)
  userDatabase: Map<string, RawUserData>;
  
  // Логгер для тестів
  testLogger: {
    logs: string[];
    log: (message: string) => void;
    clear: () => void;
  };
}

// Створюємо розширений test з fixtures
export const test = baseTest.extend<TestFixtures>({
  // Базовий валідний користувач
  validUser: async ({}, use) => {
    const user: RawUserData = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      birthDate: '1990-05-15T00:00:00.000Z',
      address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA',
        zipCode: '10001'
      },
      preferences: {
        language: 'en',
        newsletter: true,
        notifications: true
      },
      metadata: {
        createdAt: '2023-01-15T10:30:00.000Z',
        lastLoginAt: '2024-01-10T14:20:00.000Z',
        loginCount: 25
      }
    };
    
    await use(user);
    // Cleanup: у цьому випадку не потрібен
  },

  // Активний користувач
  activeUser: async ({}, use) => {
    const user: RawUserData = {
      id: 'active-user-456',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      birthDate: '1985-03-22T00:00:00.000Z',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        country: 'USA',
        zipCode: '90210'
      },
      preferences: {
        language: 'en',
        newsletter: true,
        notifications: true
      },
      metadata: {
        createdAt: '2023-06-01T08:00:00.000Z',
        lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Вчора
        loginCount: 50
      }
    };
    
    await use(user);
  },

  // Неактивний користувач
  inactiveUser: async ({}, use) => {
    const user: RawUserData = {
      id: 'inactive-user-789',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      birthDate: '1975-11-08T00:00:00.000Z',
      address: {
        street: '789 Pine St',
        city: 'Chicago',
        country: 'USA',
        zipCode: '60601'
      },
      preferences: {
        language: 'en',
        newsletter: false,
        notifications: false
      },
      metadata: {
        createdAt: '2022-03-10T15:45:00.000Z',
        lastLoginAt: '2023-10-01T12:00:00.000Z', // Давно
        loginCount: 5
      }
    };
    
    await use(user);
  },

  // Масив користувачів (залежить від інших fixtures)
  usersBatch: async ({ validUser, activeUser, inactiveUser }, use) => {
    const batch = [validUser, activeUser, inactiveUser];
    await use(batch);
  },

  // Невалідний користувач
  invalidUser: async ({}, use) => {
    const user: RawUserData = {
      id: '', // Відсутній ID
      firstName: '',
      lastName: 'InvalidUser',
      email: 'invalid-email', // Невалідний email
      birthDate: '2030-01-01T00:00:00.000Z', // Майбутня дата
      address: {
        street: '', // Відсутня адреса
        city: '',
        country: '',
        zipCode: ''
      },
      preferences: {
        language: 'en',
        newsletter: true,
        notifications: true
      },
      metadata: {
        createdAt: 'invalid-date', // Невалідна дата
        lastLoginAt: undefined,
        loginCount: -1 // Негативна кількість
      }
    };
    
    await use(user);
  },

  // База даних користувачів (імітація)
  userDatabase: async ({ validUser, activeUser, inactiveUser }, use) => {
    const db = new Map<string, RawUserData>();
    
    // Наповнюємо базу даних
    db.set(validUser.id, validUser);
    db.set(activeUser.id, activeUser);
    db.set(inactiveUser.id, inactiveUser);
    
    console.log(`🔧 Setup: Database initialized with ${db.size} users`);
    
    await use(db);
    
    // Cleanup
    db.clear();
    console.log('🧹 Teardown: Database cleared');
  },

  // Логгер для тестів
  testLogger: async ({}, use) => {
    const logger = {
      logs: [] as string[],
      log: (message: string) => {
        const timestamp = new Date().toISOString();
        logger.logs.push(`[${timestamp}] ${message}`);
      },
      clear: () => {
        logger.logs = [];
      }
    };
    
    logger.log('Test logger initialized');
    
    await use(logger);
    
    // Cleanup - показуємо всі лоаги
    if (logger.logs.length > 1) { // > 1 тому що є початковий лог
      console.log('📋 Test logs:', logger.logs);
    }
  }
});

// Додатковий test з автоматичним fixture
export const testWithAutoSetup = test.extend({
  // Автоматичний fixture - виконується навіть якщо не використовується в тесті
  autoSetup: [
    async ({}, use) => {
      console.log('🚀 Auto setup: Test environment prepared');
      
      // Тут можна робити глобальну підготовку
      // Наприклад, очищення стану, налаштування моків, тощо
      
      await use('setup-complete');
      
      console.log('✅ Auto teardown: Test environment cleaned');
    },
    { auto: true } // Марк як автоматичний fixture
  ]
});

const newTest = test.extend<{}>({
  testLogger: ({ testLogger }, use) => {

  }
})

// Per-file fixture - ініціалізується один раз на файл
export const testWithFileScope = baseTest.extend({
  sharedCounter: [
    async ({}, use) => {
      const counter = { value: 0 };
      console.log('📁 File-scoped fixture initialized');
      
      await use(counter);
      
      console.log(`📁 File-scoped fixture cleanup. Final counter: ${counter.value}`);
    },
    { scope: 'file' }
  ]
});

// Приклад injected fixture (може бути переизначений в конфігурації)
export const testWithConfig = baseTest.extend({
  apiUrl: [
    '/api/v1', // default значення
    { injected: true } // може бути переизначено в vitest.config.ts
  ],
  
  apiClient: async ({ apiUrl }, use) => {
    const client = {
      baseUrl: apiUrl,
      get: (path: string) => `GET ${apiUrl}${path}`,
      post: (path: string) => `POST ${apiUrl}${path}`
    };
    
    await use(client);
  }
}); 