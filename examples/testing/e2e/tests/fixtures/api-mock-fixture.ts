import { test as base, Page, Route, Request } from '@playwright/test'

// Типи для мокованих даних
interface MockProduct {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  image: string
}

interface MockOrder {
  id: string
  items: Array<{
    productId: number
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

// Інтерфейс для API mock fixture
interface ApiMockFixture {
  mockProducts: () => Promise<void>
  mockSlowProducts: () => Promise<void>
  mockProductsError: () => Promise<void>
  mockCheckoutSuccess: () => Promise<void>
  mockCheckoutError: () => Promise<void>
  mockOrders: () => Promise<void>
  interceptRequests: () => Promise<RequestInterceptor>
}

// Клас для перехоплення запитів
class RequestInterceptor {
  private intercepted: Array<{ url: string; method: string; body?: any }> = []

  constructor(private page: Page) {}

  async startIntercepting() {
    await this.page.route('**/*', (route: Route, request: Request) => {
      // Логуємо всі запити
      this.intercepted.push({
        url: request.url(),
        method: request.method(),
        body: request.postData()
      })
      
      // Продовжуємо з оригінальним запитом
      route.continue()
    })
  }

  getInterceptedRequests() {
    return [...this.intercepted]
  }

  getRequestsByMethod(method: string) {
    return this.intercepted.filter(req => req.method === method)
  }

  getRequestsByUrl(urlPattern: string) {
    return this.intercepted.filter(req => req.url.includes(urlPattern))
  }

  clear() {
    this.intercepted = []
  }
}

// Тестові дані
const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: 'Test Laptop',
    price: 25000,
    description: 'Тестовий ноутбук для E2E тестів',
    category: 'Електроніка',
    stock: 10,
    image: 'https://via.placeholder.com/300x300?text=Test+Laptop'
  },
  {
    id: 2,
    name: 'Test Phone',
    price: 15000,
    description: 'Тестовий телефон для E2E тестів',
    category: 'Електроніка',
    stock: 5,
    image: 'https://via.placeholder.com/300x300?text=Test+Phone'
  },
  {
    id: 3,
    name: 'Test Headphones',
    price: 2000,
    description: 'Тестові навушники для E2E тестів',
    category: 'Аксесуари',
    stock: 0, // Немає в наявності
    image: 'https://via.placeholder.com/300x300?text=Test+Headphones'
  }
]

// Розширюємо базовий тест з API mock fixture
export const test = base.extend<ApiMockFixture>({
  /**
   * 🌐 Мокування успішного отримання товарів
   */
  mockProducts: async ({ page }, use) => {
    const mockProducts = async () => {
      await page.route('/api/products', (route: Route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockProducts
          })
        })
      })
    }
    await use(mockProducts)
  },

  /**
   * ⏳ Мокування повільного отримання товарів
   */
  mockSlowProducts: async ({ page }, use) => {
    const mockSlowProducts = async () => {
      await page.route('/api/products', async (route: Route) => {
        // Затримка 3 секунди
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockProducts
          })
        })
      })
    }
    await use(mockSlowProducts)
  },

  /**
   * ❌ Мокування помилки при отриманні товарів
   */
  mockProductsError: async ({ page }, use) => {
    const mockProductsError = async () => {
      await page.route('/api/products', (route: Route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Внутрішня помилка сервера'
          })
        })
      })
    }
    await use(mockProductsError)
  },

  /**
   * ✅ Мокування успішного оформлення замовлення
   */
  mockCheckoutSuccess: async ({ page }, use) => {
    const mockCheckoutSuccess = async () => {
      await page.route('/api/checkout', (route: Route) => {
        const orderId = `order_${Date.now()}`
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              orderId,
              status: 'completed',
              total: 42000,
              message: 'Замовлення успішно оформлено'
            }
          })
        })
      })
    }
    await use(mockCheckoutSuccess)
  },

  /**
   * ❌ Мокування помилки оформлення замовлення
   */
  mockCheckoutError: async ({ page }, use) => {
    const mockCheckoutError = async () => {
      await page.route('/api/checkout', (route: Route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Недостатньо товару на складі'
          })
        })
      })
    }
    await use(mockCheckoutError)
  },

  /**
   * 📦 Мокування списку замовлень
   */
  mockOrders: async ({ page }, use) => {
    const mockOrders = async () => {
      const orders: MockOrder[] = [
        {
          id: 'order_1',
          items: [
            { productId: 1, quantity: 1, price: 25000 },
            { productId: 2, quantity: 2, price: 15000 }
          ],
          total: 55000,
          status: 'completed',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'order_2',
          items: [
            { productId: 3, quantity: 1, price: 2000 }
          ],
          total: 2000,
          status: 'pending',
          createdAt: '2024-01-16T14:30:00Z'
        }
      ]

      await page.route('/api/orders', (route: Route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: orders
          })
        })
      })
    }
    await use(mockOrders)
  },

  /**
   * 🕵️ Перехоплення всіх HTTP запитів
   */
  interceptRequests: async ({ page }, use) => {
    const interceptRequests = async (): Promise<RequestInterceptor> => {
      const interceptor = new RequestInterceptor(page)
      await interceptor.startIntercepting()
      return interceptor
    }
    await use(interceptRequests)
  }
})

/**
 * 🛠️ Допоміжні функції для роботи з мокованими даними
 */

// Створення мокованого товару
export function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  return {
    id: Math.floor(Math.random() * 1000) + 100,
    name: 'Mock Product',
    price: 10000,
    description: 'Тестовий товар',
    category: 'Тестова категорія',
    stock: 5,
    image: 'https://via.placeholder.com/300x300?text=Mock+Product',
    ...overrides
  }
}

// Створення мокованого замовлення
export function createMockOrder(overrides: Partial<MockOrder> = {}): MockOrder {
  return {
    id: `order_${Date.now()}`,
    items: [
      { productId: 1, quantity: 1, price: 10000 }
    ],
    total: 10000,
    status: 'completed',
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

/**
 * 🎯 Utility функції для специфічних сценаріїв
 */

// Мокування товару, який закінчився
export async function mockOutOfStockProduct(page: Page, productId: number) {
  await page.route(`/api/products/${productId}`, (route: Route) => {
    const product = createMockProduct({
      id: productId,
      stock: 0,
      name: 'Out of Stock Product'
    })

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: product
      })
    })
  })
}

// Мокування повільної відповіді для тестування loading станів
export async function mockSlowResponse(page: Page, url: string, delay: number = 2000) {
  await page.route(url, async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delay))
    route.continue()
  })
}

// Експортуємо тестові дані
export { mockProducts, MockProduct, MockOrder } 