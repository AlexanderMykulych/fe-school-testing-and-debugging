import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataProcessor, RawUserData } from '../../src/4-fixtures/data-processor.js';

/**
 * ДЕМОНСТРАЦІЯ СТАНДАРТНИХ МЕХАНІЗМІВ ТЕСТУВАННЯ
 * 
 * Цей файл показує, як використовувати стандартні механізми замість Vitest fixtures:
 * - beforeEach/afterEach для підготовки та очищення тестового контексту
 * - Створення helper функцій для підготовки тестових даних
 * - Управління станом через змінні модуля
 * - Ручне створення та очищення тестових об'єктів
 */

// Фіксуємо час для детермінованих тестів
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

// Глобальні змінні для тестових даних
let validUser: RawUserData;
let activeUser: RawUserData;
let inactiveUser: RawUserData;
let usersBatch: RawUserData[];
let invalidUser: RawUserData;
let userDatabase: Map<string, RawUserData>;
let testLogger: {
  logs: string[];
  log: (message: string) => void;
  clear: () => void;
};

// Змінна для file-scoped функціональності
let sharedCounter = { value: 0 };
let autoSetupFlag = '';

// Helper функції для створення тестових даних
function createValidUser(): RawUserData {
  return {
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
}

function createActiveUser(): RawUserData {
  return {
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
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      loginCount: 50
    }
  };
}

function createInactiveUser(): RawUserData {
  return {
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
      lastLoginAt: '2023-10-01T12:00:00.000Z',
      loginCount: 5
    }
  };
}

function createInvalidUser(): RawUserData {
  return {
    id: '',
    firstName: '',
    lastName: 'InvalidUser',
    email: 'invalid-email',
    birthDate: '2030-01-01T00:00:00.000Z',
    address: {
      street: '',
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
      createdAt: 'invalid-date',
      lastLoginAt: undefined,
      loginCount: -1
    }
  };
}

function createTestLogger() {
  return {
    logs: [] as string[],
    log: (message: string) => {
      const timestamp = new Date().toISOString();
      testLogger.logs.push(`[${timestamp}] ${message}`);
    },
    clear: () => {
      testLogger.logs = [];
    }
  };
}

// Підготовка перед кожним тестом
beforeEach(() => {
  // Створюємо тестові дані
  validUser = createValidUser();
  activeUser = createActiveUser();
  inactiveUser = createInactiveUser();
  invalidUser = createInvalidUser();
  usersBatch = [validUser, activeUser, inactiveUser];

  // Створюємо базу даних
  userDatabase = new Map();
  userDatabase.set(validUser.id, validUser);
  userDatabase.set(activeUser.id, activeUser);
  userDatabase.set(inactiveUser.id, inactiveUser);

  // Створюємо логгер
  testLogger = createTestLogger();
  testLogger.log('Test setup completed');
});

// Очищення після кожного тесту
afterEach(() => {
  // Очищаємо базу даних
  userDatabase.clear();

  // Показуємо логи якщо потрібно
  if (testLogger.logs.length > 1) {
    console.log('Test logs:', testLogger.logs);
  }

  // Очищаємо логгер
  testLogger.clear();
});

// Базові тести
test('should process valid user data', () => {
  testLogger.log('Processing valid user');

  const processor = new DataProcessor();
  const result = processor.processUserData(validUser);

  expect(result).toEqual({
    id: 'user-123',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    age: 33, // Розраховано від 1990 до 2024
    formattedAddress: '123 Main St, New York, USA, 10001',
    isActive: true,
    preferences: {
      language: 'en',
      newsletter: true,
      notifications: true
    },
    accountAge: 366, // Від 2023-01-15 до 2024-01-15
    lastLoginFormatted: '10/01/2024 16:20'
  });

  testLogger.log('Valid user processed successfully');
});

test('should handle active user correctly', () => {
  testLogger.log('Processing active user');

  const processor = new DataProcessor();
  const result = processor.processUserData(activeUser);

  expect(result.isActive).toBe(true);
  expect(result.fullName).toBe('Jane Smith');
  expect(result.email).toBe('jane.smith@example.com');

  testLogger.log(`Active user processed: ${result.fullName}`);
});

test('should handle inactive user correctly', () => {
  testLogger.log('Processing inactive user');

  const processor = new DataProcessor();
  const result = processor.processUserData(inactiveUser);

  expect(result.isActive).toBe(false);
  expect(result.fullName).toBe('Bob Johnson');

  testLogger.log(`Inactive user processed: ${result.fullName}`);
});

test('should process batch of users', () => {
  testLogger.log(`Processing batch of ${usersBatch.length} users`);

  const processor = new DataProcessor();
  const { processed, errors } = processor.processBatch(usersBatch);

  expect(processed).toHaveLength(3);
  expect(errors).toHaveLength(0);

  // Перевіряємо, що всі користувачі оброблені
  expect(processed[0].fullName).toBe('John Doe');
  expect(processed[1].fullName).toBe('Jane Smith');
  expect(processed[2].fullName).toBe('Bob Johnson');

  testLogger.log(`Batch processed: ${processed.length} successful, ${errors.length} errors`);
});

test('should validate invalid user and return errors', () => {
  testLogger.log('Validating invalid user');

  const processor = new DataProcessor();
  const result = processor.validateUserData(invalidUser);

  expect(result.isValid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);

  // Перевіряємо деякі очікувані помилки
  expect(result.errors).toContain('User ID is required');
  expect(result.errors).toContain('First name is required');
  expect(result.errors).toContain('Invalid email format');

  testLogger.log(`Validation errors found: ${result.errors.length}`);
});

test('should use database for lookup operations', () => {
  testLogger.log('Testing database operations');

  // Перевіряємо, що база даних ініціалізована
  expect(userDatabase.size).toBe(3);

  // Перевіряємо пошук користувачів
  const johnUser = userDatabase.get('user-123');
  expect(johnUser).toBeDefined();
  expect(johnUser?.firstName).toBe('John');

  const janeUser = userDatabase.get('active-user-456');
  expect(janeUser).toBeDefined();
  expect(janeUser?.firstName).toBe('Jane');

  testLogger.log(`Database contains ${userDatabase.size} users`);
});

test('should handle complex validation scenario', () => {
  testLogger.log('Testing mixed validation');

  const processor = new DataProcessor();
  const mixedUsers = [validUser, invalidUser];

  const { processed, errors } = processor.processBatch(mixedUsers);

  expect(processed).toHaveLength(1); // Тільки валідний користувач
  expect(errors).toHaveLength(1);     // Один невалідний

  // Перевіряємо деталі помилки
  expect(errors[0].index).toBe(1);
  expect(errors[0].error).toContain('Invalid user data');

  testLogger.log(`Mixed validation: ${processed.length} valid, ${errors.length} invalid`);
});

// Тест з імітацією автоматичного setup
test('should work with manual setup', () => {
  // Виконуємо setup вручну
  autoSetupFlag = 'setup-complete';

  const processor = new DataProcessor();
  const result = processor.processUserData(validUser);

  expect(result.fullName).toBe('John Doe');
  expect(autoSetupFlag).toBe('setup-complete');
});

// Тести з file-scoped змінними
test('should increment shared counter - test 1', () => {
  expect(sharedCounter.value).toBe(0);
  sharedCounter.value += 1;
  expect(sharedCounter.value).toBe(1);
});

test('should increment shared counter - test 2', () => {
  // Лічильник зберігається між тестами в файлі
  expect(sharedCounter.value).toBe(1);
  sharedCounter.value += 2;
  expect(sharedCounter.value).toBe(3);
});

test('should increment shared counter - test 3', () => {
  // Лічильник продовжує збільшуватися
  expect(sharedCounter.value).toBe(3);
  sharedCounter.value += 5;
  expect(sharedCounter.value).toBe(8);
});

// Тест, який демонструє роботу з залежностями між тестовими даними
test('should demonstrate data dependencies', () => {
  testLogger.log('Testing data dependencies');

  // usersBatch залежить від validUser, activeUser, inactiveUser
  // userDatabase також залежить від тих же даних
  expect(usersBatch).toHaveLength(3);
  expect(userDatabase.size).toBe(3);

  // Перевіряємо, що дані консистентні
  usersBatch.forEach(user => {
    const dbUser = userDatabase.get(user.id);
    expect(dbUser).toEqual(user);
  });

  testLogger.log('Data dependencies work correctly');
});

// Тест для демонстрації ручного cleanup
test('should demonstrate manual cleanup', () => {
  testLogger.log('This test will show manual cleanup in action');

  // Додаємо додаткові дані
  const tempUser = createValidUser();
  tempUser.id = 'temp-user';
  userDatabase.set(tempUser.id, tempUser);

  expect(userDatabase.size).toBe(4);

  testLogger.log('First log entry');
  testLogger.log('Second log entry');
  testLogger.log('Third log entry');

  expect(testLogger.logs.length).toBe(5); // Включно з початковими логами

  // Ручне очищення
  userDatabase.delete('temp-user');
  expect(userDatabase.size).toBe(3);
});

// Очищаємо fake timers після всіх тестів
afterEach(() => {
  vi.useRealTimers();
}); 