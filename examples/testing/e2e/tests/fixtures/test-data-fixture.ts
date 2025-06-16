import { test as base } from '@playwright/test'

// Інтерфейси для тестових даних
interface TestProduct {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  image: string
}

interface TestUser {
  username: string
  password: string
  email: string
  role: 'admin' | 'user'
  firstName: string
  lastName: string
}

interface TestCart {
  items: Array<{
    productId: number
    quantity: number
  }>
  total: number
}

// Інтерфейс для test data fixture
interface TestDataFixture {
  generateProduct: () => TestProduct
  generateUser: () => TestUser
  generateCartItems: (count?: number) => TestCart
  getProductCategories: () => string[]
  getTestScenarios: () => TestScenarios
}

// Сценарії для тестування
interface TestScenarios {
  happyPath: {
    user: TestUser
    products: TestProduct[]
    expectedTotal: number
  }
  errorCases: {
    invalidLogin: { username: string; password: string }
    outOfStock: TestProduct
    networkError: { delay: number; errorCode: number }
  }
  edgeCases: {
    largeCart: TestCart
    specialCharacters: { productName: string; userName: string }
    boundaries: { minPrice: number; maxPrice: number; maxStock: number }
  }
}

// Розширюємо базовий тест з test data fixture
export const test = base.extend<TestDataFixture>({
  /**
   * 🏭 Генератор тестових товарів
   */
  generateProduct: async ({}, use) => {
    const generateProduct = (): TestProduct => {
      const productId = Math.floor(Math.random() * 1000) + 1
      const categories = ['Електроніка', 'Аксесуари', 'Одяг', 'Дім і сад', 'Спорт']
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      const productNames = {
        'Електроніка': ['Ноутбук', 'Телефон', 'Планшет', 'Монітор', 'Клавіатура'],
        'Аксесуари': ['Навушники', 'Миша', 'Зарядка', 'Кабель', 'Чохол'],
        'Одяг': ['Футболка', 'Джинси', 'Кросівки', 'Куртка', 'Шапка'],
        'Дім і сад': ['Лампа', 'Ваза', 'Подушка', 'Рослина', 'Свічка'],
        'Спорт': ['М\'яч', 'Гантелі', 'Велосипед', 'Ракетка', 'Кроссівки']
      }
      
      const names = productNames[category as keyof typeof productNames]
      const baseName = names[Math.floor(Math.random() * names.length)]
      const brand = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony'][Math.floor(Math.random() * 5)]
      
      return {
        id: productId,
        name: `${brand} ${baseName} Test ${productId}`,
        price: Math.floor(Math.random() * 50000) + 1000, // 1000-51000 грн
        description: `Високоякісний ${baseName.toLowerCase()} від ${brand} для тестування`,
        category,
        stock: Math.floor(Math.random() * 20) + 1, // 1-20 штук
        image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(baseName)}`
      }
    }
    await use(generateProduct)
  },

  /**
   * 👤 Генератор тестових користувачів
   */
  generateUser: async ({}, use) => {
    const generateUser = (): TestUser => {
      const userId = Math.floor(Math.random() * 1000) + 1
      const firstNames = ['Олександр', 'Марія', 'Іван', 'Катерина', 'Дмитро', 'Анна']
      const lastNames = ['Петренко', 'Іваненко', 'Коваленко', 'Ткаченко', 'Бондаренко']
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const username = `test_user_${userId}`
      
      return {
        username,
        password: `password${userId}`,
        email: `${username}@test.com`,
        role: Math.random() > 0.8 ? 'admin' : 'user', // 20% админів
        firstName,
        lastName
      }
    }
    await use(generateUser)
  },

  /**
   * 🛒 Генератор тестових кошиків
   */
  generateCartItems: async ({ generateProduct }, use) => {
    const generateCartItems = (count: number = 3): TestCart => {
      const items = []
      let total = 0
      
      for (let i = 0; i < count; i++) {
        const product = generateProduct()
        const quantity = Math.floor(Math.random() * 5) + 1 // 1-5 штук
        
        items.push({
          productId: product.id,
          quantity
        })
        
        total += product.price * quantity
      }
      
      return { items, total }
    }
    await use(generateCartItems)
  },

  /**
   * 📂 Список категорій товарів
   */
  getProductCategories: async ({}, use) => {
    const getProductCategories = (): string[] => {
      return ['Електроніка', 'Аксесуари', 'Одяг', 'Дім і сад', 'Спорт']
    }
    await use(getProductCategories)
  },

  /**
   * 🎭 Комплексні тестові сценарії
   */
  getTestScenarios: async ({ generateUser, generateProduct, generateCartItems }, use) => {
    const getTestScenarios = (): TestScenarios => {
      const products = Array.from({ length: 5 }, () => generateProduct())
      
      return {
        happyPath: {
          user: {
            username: 'happy_user',
            password: 'password123',
            email: 'happy@test.com',
            role: 'user',
            firstName: 'Тестовий',
            lastName: 'Користувач'
          },
          products,
          expectedTotal: products.reduce((sum, p) => sum + p.price, 0)
        },
        
        errorCases: {
          invalidLogin: {
            username: 'invalid_user',
            password: 'wrong_password'
          },
          outOfStock: {
            ...generateProduct(),
            stock: 0,
            name: 'Out of Stock Product'
          },
          networkError: {
            delay: 5000,
            errorCode: 500
          }
        },
        
        edgeCases: {
          largeCart: generateCartItems(50), // Великий кошик
          specialCharacters: {
            productName: 'Товар з спец символами !@#$%^&*()',
            userName: 'user_with_спеціальні_символи'
          },
          boundaries: {
            minPrice: 1,
            maxPrice: 999999,
            maxStock: 1000
          }
        }
      }
    }
    await use(getTestScenarios)
  }
})

/**
 * 🎲 Утиліти для генерації випадкових даних
 */

// Генерація випадкової дати
export function randomDate(start: Date = new Date(2024, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Генерація випадкового рядка
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Генерація випадкового email
export function randomEmail(domain: string = 'test.com'): string {
  return `${randomString(8)}@${domain}`
}

// Генерація випадкового номера телефону
export function randomPhone(): string {
  const prefix = '+380'
  const number = Math.floor(Math.random() * 900000000) + 100000000
  return `${prefix}${number}`
}

// Вибір випадкового елемента з масиву
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 📊 Предвизначені набори тестових даних
 */

// Стандартні тестові користувачі
export const standardTestUsers: TestUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@test.com',
    role: 'admin',
    firstName: 'Адмін',
    lastName: 'Адмінський'
  },
  {
    username: 'user',
    password: 'user123',
    email: 'user@test.com',
    role: 'user',
    firstName: 'Юзер',
    lastName: 'Юзерський'
  }
]

// Стандартні тестові товари
export const standardTestProducts: TestProduct[] = [
  {
    id: 1,
    name: 'Test Laptop Pro',
    price: 45000,
    description: 'Потужний ноутбук для розробки',
    category: 'Електроніка',
    stock: 10,
    image: 'https://via.placeholder.com/300x300?text=Laptop'
  },
  {
    id: 2,
    name: 'Test Smartphone',
    price: 25000,
    description: 'Сучасний смартфон з великим екраном',
    category: 'Електроніка',
    stock: 15,
    image: 'https://via.placeholder.com/300x300?text=Phone'
  },
  {
    id: 3,
    name: 'Test Headphones',
    price: 3500,
    description: 'Бездротові навушники з шумозаглушенням',
    category: 'Аксесуари',
    stock: 25,
    image: 'https://via.placeholder.com/300x300?text=Headphones'
  }
]

/**
 * 🔧 Валідатори для тестових даних
 */

// Перевірка валідності email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Перевірка валідності номера телефону
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+380\d{9}$/
  return phoneRegex.test(phone)
}

// Перевірка мінімальної довжини пароля
export function isValidPassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength
}

// Експорт типів
export type { TestProduct, TestUser, TestCart, TestScenarios } 