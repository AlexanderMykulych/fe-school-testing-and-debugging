import { test, expect, vi, Mock } from 'vitest';
import { UserService, ApiClient, User, CreateUserRequest } from '../../src/2-mocking/user-service.js';

/**
 * ДЕМОНСТРАЦІЯ MOCKING В VITEST
 * 
 * Цей файл показує:
 * - Створення моків з vi.fn()
 * - Налаштування поведінки моків (mockResolvedValue, mockRejectedValue)
 * - Перевірку викликів моків (toHaveBeenCalledWith, toHaveBeenCalledTimes)
 * - Мокинг зовнішніх залежностей
 */

// Функція для створення мок API клієнта
const createMockApiClient = (): ApiClient => ({
  baseUrl: 'http://test-api.com',
  get: vi.fn(),
  post: vi.fn(),
});

test('getUser should return user data from API', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date('2023-01-01')
  };

  (mockApiClient.get as Mock).mockResolvedValue(mockUser);

  // Act
  const result = await userService.getUser(1);

  // Assert
  expect(result).toEqual(mockUser);
  expect(mockApiClient.get).toHaveBeenCalledWith('/users/1');
  expect(mockApiClient.get).toHaveBeenCalledTimes(1);
});

test('getUser should handle API errors', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const apiError = new Error('User not found');
  (mockApiClient.get as Mock).mockRejectedValue(apiError);

  // Act & Assert
  await expect(userService.getUser(999)).rejects.toThrow('User not found');
  expect(mockApiClient.get).toHaveBeenCalledWith('/users/999');
});

test('createUser should create user with valid data', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const createRequest: CreateUserRequest = {
    name: 'Jane Doe',
    email: 'jane@example.com'
  };

  const mockApiResponse = {
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com'
  };

  (mockApiClient.post as Mock).mockResolvedValue(mockApiResponse);

  // Act
  const result = await userService.createUser(createRequest);

  // Assert
  expect(result).toEqual(expect.objectContaining({
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    createdAt: expect.any(Date)
  }));
  expect(mockApiClient.post).toHaveBeenCalledWith('/users', createRequest);
});

test('createUser should throw error for missing name', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const invalidRequest: CreateUserRequest = {
    name: '',
    email: 'test@example.com'
  };

  // Act & Assert
  await expect(userService.createUser(invalidRequest))
    .rejects.toThrow('Name and email are required');
  
  // Перевіряємо, що API не викликався
  expect(mockApiClient.post).not.toHaveBeenCalled();
});

test('createUser should throw error for invalid email', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const invalidRequest: CreateUserRequest = {
    name: 'John Doe',
    email: 'invalid-email'
  };

  // Act & Assert
  await expect(userService.createUser(invalidRequest))
    .rejects.toThrow('Invalid email format');
  
  expect(mockApiClient.post).not.toHaveBeenCalled();
});

test('getAllUsers should return list of users', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  const mockUsers: User[] = [
    { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() },
    { id: 2, name: 'Jane', email: 'jane@example.com', createdAt: new Date() }
  ];

  (mockApiClient.get as Mock).mockResolvedValue(mockUsers);

  // Act
  const result = await userService.getAllUsers();

  // Assert
  expect(result).toEqual(mockUsers);
  expect(mockApiClient.get).toHaveBeenCalledWith('/users');
});

test('getAllUsers should return empty array when no users exist', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  (mockApiClient.get as Mock).mockResolvedValue([]);

  // Act
  const result = await userService.getAllUsers();

  // Assert
  expect(result).toEqual([]);
  expect(result).toHaveLength(0);
});

// Демонстрація різних способів роботи з моками
test('should demonstrate different mock behaviors', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  // Тест з mockImplementation
  (mockApiClient.get as Mock).mockImplementation((url: string) => {
    if (url === '/users/1') {
      return Promise.resolve({ id: 1, name: 'John' });
    } else if (url === '/users/2') {
      return Promise.resolve({ id: 2, name: 'Jane' });
    }
    return Promise.reject(new Error('User not found'));
  });

  // Act & Assert
  const user1 = await userService.getUser(1);
  const user2 = await userService.getUser(2);
  
  expect(user1.name).toBe('John');
  expect(user2.name).toBe('Jane');
  
  await expect(userService.getUser(3)).rejects.toThrow('User not found');
});

test('should demonstrate mock function introspection', async () => {
  // Arrange
  const mockApiClient = createMockApiClient();
  const userService = new UserService(mockApiClient);
  
  (mockApiClient.get as Mock).mockResolvedValue([]);

  // Act
  await userService.getAllUsers();
  await userService.getUser(1);
  await userService.getUser(2);

  // Assert - детальна перевірка викликів
  const getMock = mockApiClient.get as Mock;
  
  expect(getMock).toHaveBeenCalledTimes(3);
  expect(getMock).toHaveBeenNthCalledWith(1, '/users');
  expect(getMock).toHaveBeenNthCalledWith(2, '/users/1');
  expect(getMock).toHaveBeenNthCalledWith(3, '/users/2');
  
  // Перевіряємо всі виклики
  expect(getMock.mock.calls).toEqual([
    ['/users'],
    ['/users/1'],
    ['/users/2']
  ]);
});

test('should demonstrate spy functionality', async () => {
  // Arrange - створюємо реальний об'єкт і шпигуємо за методом
  const realApiClient = {
    get: async (url: string) => ({ data: `Real data from ${url}` }),
    post: async (url: string, data: any) => ({ success: true })
  };
  
  const spyGet = vi.spyOn(realApiClient, 'get');
  spyGet.mockResolvedValue({ id: 1, name: 'Spied User' } as any);
  
  const userService = new UserService(realApiClient);

  // Act
  const result = await userService.getUser(1);

  // Assert
  expect(result.name).toBe('Spied User');
  expect(spyGet).toHaveBeenCalledWith('/users/1');
  
  // Відновлюємо оригінальну поведінку
  spyGet.mockRestore();
});

test('should demonstrate partial mocking', async () => {
  // Arrange - мокаємо тільки частину методів
  const partialMockApiClient = {
    get: vi.fn().mockResolvedValue({ id: 1, name: 'Partial Mock' }),
    post: async (url: string, data: any) => {
      // Реальна реалізація для post
      return { id: Date.now(), ...data };
    }
  };
  
  const userService = new UserService(partialMockApiClient);

  // Act
  const getResult = await userService.getUser(1);
  const createResult = await userService.createUser({
    name: 'Test User',
    email: 'test@example.com'
  });

  // Assert
  expect(getResult.name).toBe('Partial Mock'); // З мока
  expect(createResult.name).toBe('Test User');  // З реальної реалізації
  expect(typeof createResult.id).toBe('number');
}); 