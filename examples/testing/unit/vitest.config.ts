import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    
    // Демонстрація injected fixtures через проекти
    projects: [
      {
        name: 'development',
        test: {
          provide: {
            apiUrl: 'http://localhost:3000/api',
            dbUrl: 'sqlite://dev.db'
          }
        }
      },
      {
        name: 'production', 
        test: {
          provide: {
            apiUrl: 'https://api.production.com',
            dbUrl: 'postgresql://prod-db'
          }
        }
      }
    ]
  }
}); 