import { RawUserData } from '../../src/4-fixtures/data-processor.js';

/**
 * FIXTURES - Попередньо визначені тестові дані
 * 
 * Fixtures допомагають:
 * - Уникнути дублювання тестових даних
 * - Забезпечити консистентність тестів
 * - Спростити створення складних об'єктів для тестування
 * - Зробити тести більш читабельними
 */

// Базовий валідний користувач
export const validUserFixture: RawUserData = {
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

// Активний користувач (недавно логінився)
export const activeUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'active-user-456',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  metadata: {
    ...validUserFixture.metadata,
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Вчора
    loginCount: 50
  }
};

// Неактивний користувач (давно не логінився)
export const inactiveUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'inactive-user-789',
  firstName: 'Bob',
  lastName: 'Johnson',
  email: 'bob.johnson@example.com',
  metadata: {
    ...validUserFixture.metadata,
    lastLoginAt: '2023-10-01T12:00:00.000Z', // Давно
    loginCount: 5
  }
};

// Користувач без останнього логіну
export const neverLoggedInUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'new-user-999',
  firstName: 'Alice',
  lastName: 'Brown',
  email: 'alice.brown@example.com',
  metadata: {
    ...validUserFixture.metadata,
    lastLoginAt: undefined,
    loginCount: 0
  }
};

// Молодий користувач (під 18)
export const youngUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'young-user-111',
  firstName: 'Tommy',
  lastName: 'Young',
  email: 'tommy.young@example.com',
  birthDate: '2010-03-20T00:00:00.000Z' // 14 років
};

// Дуже молодий користувач (під 13) - для тестування попереджень
export const veryYoungUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'very-young-user-222',
  firstName: 'Timmy',
  lastName: 'VeryYoung',
  email: 'timmy.veryyoung@example.com',
  birthDate: '2015-06-10T00:00:00.000Z' // 9 років
};

// Користувач з мінімальними даними адреси
export const minimalAddressUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'minimal-address-user-333',
  address: {
    street: '456 Oak Ave',
    city: 'Los Angeles',
    country: 'USA',
    zipCode: '' // Без zip коду
  }
};

// Користувач з різними налаштуваннями
export const customPreferencesUserFixture: RawUserData = {
  ...validUserFixture,
  id: 'custom-prefs-user-444',
  preferences: {
    language: 'uk',
    newsletter: false,
    notifications: false
  }
};

// Масив валідних користувачів для batch тестування
export const validUsersArrayFixture: RawUserData[] = [
  validUserFixture,
  activeUserFixture,
  inactiveUserFixture,
  youngUserFixture
];

// НЕВАЛІДНІ FIXTURES для тестування помилок

// Користувач з відсутнім ID
export const noIdUserFixture: RawUserData = {
  ...validUserFixture,
  id: ''
};

// Користувач з відсутнім ім'ям
export const noFirstNameUserFixture: RawUserData = {
  ...validUserFixture,
  firstName: ''
};

// Користувач з невалідним email
export const invalidEmailUserFixture: RawUserData = {
  ...validUserFixture,
  email: 'invalid-email'
};

// Користувач з майбутньою датою народження
export const futureBirthDateUserFixture: RawUserData = {
  ...validUserFixture,
  birthDate: '2030-01-01T00:00:00.000Z'
};

// Користувач з невалідною датою народження
export const invalidBirthDateUserFixture: RawUserData = {
  ...validUserFixture,
  birthDate: 'invalid-date'
};

// Користувач з неповною адресою
export const incompleteAddressUserFixture: RawUserData = {
  ...validUserFixture,
  address: {
    street: '',
    city: 'New York',
    country: 'USA',
    zipCode: '10001'
  }
};

// Користувач з негативною кількістю логінів
export const negativeLoginCountUserFixture: RawUserData = {
  ...validUserFixture,
  metadata: {
    ...validUserFixture.metadata,
    loginCount: -5
  }
};

// Користувач з невалідною датою створення
export const invalidCreatedAtUserFixture: RawUserData = {
  ...validUserFixture,
  metadata: {
    ...validUserFixture.metadata,
    createdAt: 'invalid-date'
  }
};

// Масив з різними типами помилок для batch тестування
export const mixedValidationUsersFixture: RawUserData[] = [
  validUserFixture,           // Валідний
  noIdUserFixture,           // Помилка: немає ID
  activeUserFixture,         // Валідний
  invalidEmailUserFixture,   // Помилка: невалідний email
  youngUserFixture,          // Валідний
  incompleteAddressUserFixture // Помилка: неповна адреса
];

// Фабрика для створення користувачів з кастомними властивостями
export const createUserFixture = (overrides: Partial<RawUserData> = {}): RawUserData => {
  return {
    ...validUserFixture,
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    ...overrides
  };
};

// Фабрика для створення користувача з кастомною датою народження
export const createUserWithAge = (age: number): RawUserData => {
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - age);
  
  return createUserFixture({
    birthDate: birthDate.toISOString()
  });
};

// Фабрика для створення користувача з кастомною датою останнього логіну
export const createUserWithLastLogin = (daysAgo: number): RawUserData => {
  const lastLoginDate = new Date();
  lastLoginDate.setDate(lastLoginDate.getDate() - daysAgo);
  
  return createUserFixture({
    metadata: {
      ...validUserFixture.metadata,
      lastLoginAt: lastLoginDate.toISOString()
    }
  });
}; 