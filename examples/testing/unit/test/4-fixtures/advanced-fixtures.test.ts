import { test as baseTest, expect, vi } from 'vitest';

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

// Основний тест з injected fixtures
const testWithConfig = baseTest.extend({
  // Injected fixture - може бути переизначений в vitest.config.ts
  apiUrl: [
    'http://localhost:3000/api', // default значення
    { injected: true }
  ],
  
  // Database URL також може бути переизначений
  dbUrl: [
    'sqlite://test.db',
    { injected: true }
  ],
  
  // HTTP клієнт залежить від API URL
  httpClient: async ({ apiUrl }, use) => {
    const client = {
      baseUrl: apiUrl,
      async get(path: string) {
        return { data: `GET ${apiUrl}${path}` };
      },
      async post(path: string, data: any) {
        return { data: `POST ${apiUrl}${path}`, body: data };
      }
    };
    
    console.log(`🔧 HTTP client configured for: ${apiUrl}`);
    await use(client);
    console.log('🧹 HTTP client cleanup');
  },
  
  // Database client
  dbClient: async ({ dbUrl }, use) => {
    const client = {
      url: dbUrl,
      async query(sql: string) {
        return { query: sql, from: dbUrl };
      }
    };
    
    console.log(`💾 Database client connected to: ${dbUrl}`);
    await use(client);
    console.log('💾 Database client disconnected');
  }
});

// File-scoped fixture - ініціалізується раз на файл
const testWithFileCache = baseTest.extend({
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
const testWithAutoLogger = baseTest.extend({
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

// Композиція fixtures
const testWithAll = testWithConfig
  .extend(testWithFileCache.fixtures)
  .extend(testWithAutoLogger.fixtures);

// Тести з injected fixtures
testWithConfig('should use injected API URL', ({ apiUrl, httpClient }) => {
  expect(apiUrl).toBe('http://localhost:3000/api'); // default в тесті
  expect(httpClient.baseUrl).toBe(apiUrl);
});

testWithConfig('should use injected database URL', ({ dbUrl, dbClient }) => {
  expect(dbUrl).toBe('sqlite://test.db'); // default в тесті
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
const testWithScopedOverrides = baseTest.extend({
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
const productionTests = testWithScopedOverrides.extend({
  environment: 'production' // override default
});

productionTests('should use production environment', ({ config }) => {
  expect(config.env).toBe('production');
  expect(config.debug).toBe(false);
});

const testingTests = testWithScopedOverrides.extend({
  environment: 'testing'
});

testingTests('should use testing environment', ({ config }) => {
  expect(config.env).toBe('testing');
  expect(config.debug).toBe(false);
});

// Демонстрація fixture cleanup order
const testWithCleanupOrder = baseTest.extend({
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
const testWithMocks = baseTest.extend({
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
const testWithAsyncResources = baseTest.extend({
  asyncResource: async ({}, use) => {
    // Імітуємо підключення до зовнішнього ресурсу
    const resource = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'resource-123',
          status: 'connected',
          data: { initialized: true }
        });
      }, 10);
    });
    
    console.log('🔗 Async resource connected:', (resource as any).id);
    
    await use(resource);
    
    // Імітуємо відключення
    await new Promise(resolve => setTimeout(resolve, 5));
    console.log('🔗 Async resource disconnected');
  }
});

testWithAsyncResources('should work with async resources', async ({ asyncResource }) => {
  expect((asyncResource as any).status).toBe('connected');
  expect((asyncResource as any).data.initialized).toBe(true);
}); 