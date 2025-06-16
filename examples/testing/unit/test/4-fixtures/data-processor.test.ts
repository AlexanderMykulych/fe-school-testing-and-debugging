import { expect, vi } from 'vitest';
import { DataProcessor } from '../../src/4-fixtures/data-processor.js';
import { test, testWithAutoSetup, testWithFileScope } from './test-fixtures.js';

/**
 * ДЕМОНСТРАЦІЯ VITEST FIXTURES через test.extend
 * 
 * Цей файл показує, як Vitest fixtures допомагають:
 * - Автоматично підготувати тестовий контекст
 * - Переіспользувати логіку між тестами
 * - Управляти життєвим циклом тестових даних
 * - Створювати залежності між fixtures
 */

// Фіксуємо час для детермінованих тестів
vi.useFakeTimers();
vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));

// Базові тести з fixtures
test('should process valid user data', ({ validUser, testLogger }) => {
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
    accountAge: 365, // Від 2023-01-15 до 2024-01-15
    lastLoginFormatted: '10/01/2024 14:20'
  });
  
  testLogger.log('Valid user processed successfully');
});

test('should handle active user correctly', ({ activeUser, testLogger }) => {
  testLogger.log('Processing active user');
  
  const processor = new DataProcessor();
  const result = processor.processUserData(activeUser);

  expect(result.isActive).toBe(true);
  expect(result.fullName).toBe('Jane Smith');
  expect(result.email).toBe('jane.smith@example.com');
  
  testLogger.log(`Active user processed: ${result.fullName}`);
});

test('should handle inactive user correctly', ({ inactiveUser, testLogger }) => {
  testLogger.log('Processing inactive user');
  
  const processor = new DataProcessor();
  const result = processor.processUserData(inactiveUser);

  expect(result.isActive).toBe(false);
  expect(result.fullName).toBe('Bob Johnson');
  
  testLogger.log(`Inactive user processed: ${result.fullName}`);
});

test('should process batch of users', ({ usersBatch, testLogger }) => {
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

test('should validate invalid user and return errors', ({ invalidUser, testLogger }) => {
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

test('should use database fixture for lookup operations', ({ userDatabase, testLogger }) => {
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

test('should handle complex validation scenario', ({ validUser, invalidUser, testLogger }) => {
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

// Тест з автоматичним setup
testWithAutoSetup('should work with automatic setup', ({ validUser, autoSetup }) => {
  // autoSetup виконався автоматично перед цим тестом
  expect(autoSetup).toBe('setup-complete');
  
  const processor = new DataProcessor();
  const result = processor.processUserData(validUser);
  
  expect(result.fullName).toBe('John Doe');
});

// Тести з file-scoped fixture
testWithFileScope('should increment shared counter - test 1', ({ sharedCounter }) => {
  expect(sharedCounter.value).toBe(0);
  sharedCounter.value += 1;
  expect(sharedCounter.value).toBe(1);
});

testWithFileScope('should increment shared counter - test 2', ({ sharedCounter }) => {
  // Лічильник зберігається між тестами в файлі
  expect(sharedCounter.value).toBe(1);
  sharedCounter.value += 2;
  expect(sharedCounter.value).toBe(3);
});

testWithFileScope('should increment shared counter - test 3', ({ sharedCounter }) => {
  // Лічильник продовжує збільшуватися
  expect(sharedCounter.value).toBe(3);
  sharedCounter.value += 5;
  expect(sharedCounter.value).toBe(8);
});

// Тест, який демонструє роботу з залежностями між fixtures
test('should demonstrate fixture dependencies', ({ usersBatch, userDatabase, testLogger }) => {
  testLogger.log('Testing fixture dependencies');
  
  // usersBatch залежить від validUser, activeUser, inactiveUser
  // userDatabase також залежить від тих же fixtures
  expect(usersBatch).toHaveLength(3);
  expect(userDatabase.size).toBe(3);
  
  // Перевіряємо, що дані консистентні
  usersBatch.forEach(user => {
    const dbUser = userDatabase.get(user.id);
    expect(dbUser).toEqual(user);
  });
  
  testLogger.log('Fixture dependencies work correctly');
});

// Тест для демонстрації cleanup behavior
test('should demonstrate fixture cleanup', ({ testLogger }) => {
  testLogger.log('This test will show cleanup in action');
  
  // Після завершення цього тесту, testLogger fixture
  // виконає cleanup і покаже всі логи
  
  testLogger.log('First log entry');
  testLogger.log('Second log entry');
  testLogger.log('Third log entry');
  
  expect(testLogger.logs.length).toBe(4); // Включно з початковим логом
});

// Очищаємо fake timers після всіх тестів
vi.useRealTimers(); 