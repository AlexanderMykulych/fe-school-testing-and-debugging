import { test, expect, vi } from 'vitest';

/**
 * ПРОДВИНУТІ VITEST FIXTURES
 * 
 * Цей файл демонструє:
 * - Injected fixtures (які можна переизначити в конфігурації)
 * - Per-file та per-worker scoped fixtures
 * - Scoped values для override contexts
 * - Автоматичні fixtures
 * - Композицію fixtures
 */

// Базовий test з розширеними можливостями
const baseTest = test;

/**
 * Injected fixtures - значення доступні в тестах
 * 
 * @param apiUrl - API URL
 * @param dbUrl - Database URL
 * @param httpClient - HTTP клиент
 * @param dbClient - Database клиент
 */
const testWithConfig = baseTest.extend<{
  apiUrl: string;
  dbUrl: string;
  httpClient: {
    baseUrl: string;
    get: (path: string) => Promise<{ data: string }>;
    post: (path: string, data: any) => Promise<{ body: any }>;
  };
  dbClient: {
    url: string;
    query: (sql: string) => Promise<any[]>;
  };
}>({
  // Injected values - доступні без setup/teardown
  apiUrl: ['http://localhost:3000/api', { injected: true }],
  dbUrl: ['sqlite://test.db', { injected: true }],
  
  // Computed fixtures - залежать від injected values
  httpClient: ({ apiUrl }, use) => use({
    baseUrl: apiUrl,
    async get(path: string) {
      return { data: `GET ${path} from ${apiUrl}` };
    },
    async post(path: string, data: any) {
      return { body: data };
    }
  }),

  dbClient: ({ dbUrl }, use) => use({
    url: dbUrl,
    async query(sql: string) {
      return [{ result: `Query: ${sql} on ${dbUrl}` }];
    }
  })
});

// File-scoped fixture - ініціалізується раз на файл
const testWithFileCache = baseTest.extend<{
  fileCache: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    size: () => number;
    clear: () => void;
  };
}>({
  fileCache: [
    async ({}, use) => {
      const cache = new Map<string, any>();
      console.log('🗃️ File cache initialized');
      
      await use({
        set: (key: string, value: any) => cache.set(key, value),
        get: (key: string) => cache.get(key),
        size: () => cache.size,
        clear: () => cache.clear()
      });
      
      console.log(`🗃️ File cache cleanup. Final size: ${cache.size}`);
    },
    { scope: 'file' }
  ]
});

// Автоматичний fixture - виконується завжди
const testWithAutoLogger = baseTest.extend<{
  autoLogger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    getLogs: () => string[];
  };
}>({
  autoLogger: [
    async ({}, use) => {
      const logs: string[] = [];
      const logger = {
        info: (msg: string) => logs.push(`[INFO] ${msg}`),
        error: (msg: string) => logs.push(`[ERROR] ${msg}`),
        getLogs: () => [...logs]
      };
      
      logger.info('Auto logger started');
      await use(logger);
      logger.info('Auto logger finished');
      
      console.log('📝 Auto logs:', logs);
    },
    { auto: true } // Виконується навіть якщо не використовується
  ]
});

// Композиція fixtures - об'єднуємо всі fixtures в один тест
const testWithAll = baseTest.extend<{
  apiUrl: string;
  dbUrl: string;
  httpClient: {
    baseUrl: string;
    get: (path: string) => Promise<{ data: string }>;
    post: (path: string, data: any) => Promise<{ body: any }>;
  };
  dbClient: {
    url: string;
    query: (sql: string) => Promise<any[]>;
  };
  fileCache: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
    size: () => number;
    clear: () => void;
  };
  autoLogger: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    getLogs: () => string[];
  };
}>({
  // Копіюємо всі fixtures
  apiUrl: ['http://localhost:3000/api', { injected: true }],
  dbUrl: ['sqlite://test.db', { injected: true }],

  httpClient: ({ apiUrl }, use) => use({
    baseUrl: apiUrl,
    async get(path: string) {
      return { data: `GET ${path} from ${apiUrl}` };
    },
    async post(path: string, data: any) {
      return { body: data };
    }
  }),

  dbClient: ({ dbUrl }, use) => use({
    url: dbUrl,
    async query(sql: string) {
      return [{ result: `Query: ${sql} on ${dbUrl}` }];
    }
  }),

  fileCache: [
    async ({ }, use) => {
      const cache = new Map<string, any>();
      console.log('🗃️ File cache initialized');

      await use({
        set: (key: string, value: any) => cache.set(key, value),
        get: (key: string) => cache.get(key),
        size: () => cache.size,
        clear: () => cache.clear()
      });

      console.log(`🗃️ File cache cleanup. Final size: ${cache.size}`);
    },
    { scope: 'file' }
  ],

  autoLogger: [
    async ({ }, use) => {
      const logs: string[] = [];
      const logger = {
        info: (msg: string) => logs.push(`[INFO] ${msg}`),
        error: (msg: string) => logs.push(`[ERROR] ${msg}`),
        getLogs: () => [...logs]
      };

      logger.info('Auto logger started');
      await use(logger);
      logger.info('Auto logger finished');

      console.log('📝 Auto logs:', logs);
    },
    { auto: true }
  ]
});

// Тести з injected fixtures
testWithConfig('should use injected API URL', ({ apiUrl, httpClient }) => {
  // Перевіряємо, що значення отримано (може бути з конфігурації або дефолтне)
  expect(apiUrl).toBeDefined();
  expect(httpClient.baseUrl).toBe(apiUrl);
});

testWithConfig('should use injected database URL', ({ dbUrl, dbClient }) => {
  // Перевіряємо, що значення отримано (може бути з конфігурації або дефолтне)
  expect(dbUrl).toBeDefined();
  expect(dbClient.url).toBe(dbUrl);
});

testWithConfig('should make HTTP requests', async ({ httpClient }) => {
  const getResult = await httpClient.get('/users');
  const postResult = await httpClient.post('/users', { name: 'John' });
  
  expect(getResult.data).toContain('GET');
  expect(postResult.body).toEqual({ name: 'John' });
});

// Тести з file-scoped cache
testWithFileCache('should initialize file cache - test 1', ({ fileCache }) => {
  expect(fileCache.size()).toBe(0);
  fileCache.set('key1', 'value1');
  expect(fileCache.size()).toBe(1);
});

testWithFileCache('should persist file cache - test 2', ({ fileCache }) => {
  // Cache зберігається між тестами в файлі
  expect(fileCache.size()).toBe(1);
  expect(fileCache.get('key1')).toBe('value1');
  
  fileCache.set('key2', 'value2');
  expect(fileCache.size()).toBe(2);
});

testWithFileCache('should still have file cache - test 3', ({ fileCache }) => {
  expect(fileCache.size()).toBe(2);
  expect(fileCache.get('key1')).toBe('value1');
  expect(fileCache.get('key2')).toBe('value2');
});

// Тест з автоматичним fixture
testWithAutoLogger('should work with auto logger', ({ autoLogger }) => {
  // autoLogger вже запущений
  autoLogger.info('Test message');
  autoLogger.error('Test error');
  
  const logs = autoLogger.getLogs();
  expect(logs).toContain('[INFO] Auto logger started');
  expect(logs).toContain('[INFO] Test message');
  expect(logs).toContain('[ERROR] Test error');
});

// Тест БЕЗ використання автологгера, але він все одно спрацює
testWithAutoLogger('should auto log even without using logger', () => {
  // autoLogger не використовується явно, але fixture все одно виконається
  expect(true).toBe(true);
});

// Тести з комбінованими fixtures
testWithAll('should use all fixtures together', ({ 
  apiUrl, 
  httpClient, 
  fileCache, 
  autoLogger 
}) => {
  autoLogger.info('Using combined fixtures');
  
  expect(apiUrl).toBeDefined();
  expect(httpClient.baseUrl).toBe(apiUrl);
  
  fileCache.set('test', 'combined');
  expect(fileCache.get('test')).toBe('combined');
  
  autoLogger.info('All fixtures working together');
});

// Демонстрація scoped values (override)
const testWithScopedOverrides = baseTest.extend<{
  environment: string;
  config: {
    env: string;
    debug: boolean;
  };
}>({
  environment: 'development',
  config: ({ environment }, use) => use({
    env: environment,
    debug: environment === 'development'
  })
});

// Використання базового environment
testWithScopedOverrides('should use default environment', ({ config }) => {
  expect(config.env).toBe('development');
  expect(config.debug).toBe(true);
});

// Групи тестів з override (імітуємо describe без вкладеності)
const productionTests = baseTest.extend<{
  environment: string;
  config: {
    env: string;
    debug: boolean;
  };
}>({
  environment: 'production', // override default
  config: ({ environment }, use) => use({
    env: environment,
    debug: environment === 'development'
  })
});

productionTests('should use production environment', ({ config }) => {
  expect(config.env).toBe('production');
  expect(config.debug).toBe(false);
});

const testingTests = baseTest.extend<{
  environment: string;
  config: {
    env: string;
    debug: boolean;
  };
}>({
  environment: 'testing',
  config: ({ environment }, use) => use({
    env: environment,
    debug: environment === 'development'
  })
});

testingTests('should use testing environment', ({ config }) => {
  expect(config.env).toBe('testing');
  expect(config.debug).toBe(false);
});

// Демонстрація fixture cleanup order
const testWithCleanupOrder = baseTest.extend<{
  first: string;
  second: string;
  third: string;
}>({
  first: async ({}, use) => {
    console.log('🚀 First fixture setup');
    await use('first-value');
    console.log('🧹 First fixture cleanup');
  },
  
  second: async ({ first }, use) => {
    console.log('🚀 Second fixture setup, depends on:', first);
    await use('second-value');
    console.log('🧹 Second fixture cleanup');
  },
  
  third: async ({ first, second }, use) => {
    console.log('🚀 Third fixture setup, depends on:', first, second);
    await use('third-value');
    console.log('🧹 Third fixture cleanup');
  }
});

testWithCleanupOrder('should demonstrate cleanup order', ({ first, second, third }) => {
  // Cleanup відбувається у зворотному порядку: third -> second -> first
  expect(first).toBe('first-value');
  expect(second).toBe('second-value');
  expect(third).toBe('third-value');
});

// Тест з мок fixtures
const testWithMocks = baseTest.extend<{
  mockDate: Date;
  mockConsole: {
    getLogs: () => string[];
  };
}>({
  mockDate: async ({}, use) => {
    const fixedDate = new Date('2024-01-15T12:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
    
    await use(fixedDate);
    
    vi.useRealTimers();
  },
  
  mockConsole: async ({}, use) => {
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = vi.fn((message) => {
      logs.push(message);
    });
    
    await use({
      getLogs: () => [...logs]
    });
    
    console.log = originalLog;
  }
});

testWithMocks('should work with mocked time and console', ({ mockDate, mockConsole }) => {
  console.log('Test message');
  
  expect(new Date()).toEqual(mockDate);
  expect(mockConsole.getLogs()).toContain('Test message');
});

// Асинхронний fixture з ресурсами
const testWithAsyncResources = baseTest.extend<{
  asyncResource: {
    id: string;
    status: string;
    data: { initialized: boolean };
  };
}>({
  asyncResource: async ({}, use) => {
    // Імітуємо підключення до зовнішнього ресурсу
    const resource = await new Promise<{
      id: string;
      status: string;
      data: { initialized: boolean };
    }>(resolve => {
      setTimeout(() => {
        resolve({
          id: 'resource-123',
          status: 'connected',
          data: { initialized: true }
        });
      }, 10);
    });
    
    console.log('🔗 Async resource connected:', resource.id);
    
    await use(resource);
    
    // Імітуємо відключення
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log('🔌 Async resource disconnected:', resource.id);
  }
});

testWithAsyncResources('should work with async resources', async ({ asyncResource }) => {
  expect(asyncResource.id).toBe('resource-123');
  expect(asyncResource.status).toBe('connected');
  expect(asyncResource.data.initialized).toBe(true);
}); 