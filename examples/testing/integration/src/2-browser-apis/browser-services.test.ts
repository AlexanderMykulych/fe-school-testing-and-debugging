import { test, expect, beforeEach, vi } from 'vitest'
import { StorageService, type UserPreferences, type SessionData } from './storage-service'
import { LocationService, type Position, type LocationError } from './location-service'
import { NotificationService, type NotificationOptions } from './notification-service'

// 📦 Тести для StorageService

test('повинен зберегти та отримати об\'єкт з localStorage', () => {
  // Мокаємо localStorage
  const mockLocalStorage = {
    data: {} as Record<string, string>,
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage.data[key] = value
    }),
    getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage.data[key]
    }),
    clear: vi.fn(() => {
      mockLocalStorage.data = {}
    })
  }

  const storageService = new StorageService(
    mockLocalStorage as any,
    mockLocalStorage as any
  )

  const testData = { name: 'Тест', value: 123 }
  
  // Тест збереження
  const saveResult = storageService.setItem('test', testData)
  expect(saveResult).toBe(true)
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(testData))

  // Тест отримання
  const retrievedData = storageService.getItem('test')
  expect(retrievedData).toEqual(testData)
})

test('повинен повернути null для неіснуючого ключа', () => {
  const mockStorage = {
    getItem: vi.fn(() => null)
  }

  const storageService = new StorageService(mockStorage as any, mockStorage as any)
  const result = storageService.getItem('nonexistent')
  
  expect(result).toBeNull()
})

test('повинен обробити помилку при збереженні в localStorage', () => {
  const mockStorage = {
    setItem: vi.fn(() => {
      throw new Error('Storage quota exceeded')
    })
  }

  const storageService = new StorageService(mockStorage as any, mockStorage as any)
  const result = storageService.setItem('test', { data: 'test' })
  
  expect(result).toBe(false)
})

test('повинен зберегти та отримати налаштування користувача', () => {
  const mockStorage = {
    data: {} as Record<string, string>,
    setItem: vi.fn((key: string, value: string) => {
      mockStorage.data[key] = value
    }),
    getItem: vi.fn((key: string) => mockStorage.data[key] || null)
  }

  const storageService = new StorageService(mockStorage as any, mockStorage as any)
  
  const preferences: UserPreferences = {
    theme: 'dark',
    language: 'en',
    notifications: false
  }

  storageService.saveUserPreferences(preferences)
  const retrieved = storageService.getUserPreferences()
  
  expect(retrieved).toEqual(preferences)
})

test('повинен повернути налаштування за замовчуванням', () => {
  const mockStorage = {
    getItem: vi.fn(() => null)
  }

  const storageService = new StorageService(mockStorage as any, mockStorage as any)
  const preferences = storageService.getUserPreferencesWithDefaults()
  
  expect(preferences).toEqual({
    theme: 'light',
    language: 'uk',
    notifications: true
  })
})

test('повинен працювати з сесійними даними', () => {
  const mockSessionStorage = {
    data: {} as Record<string, string>,
    setItem: vi.fn((key: string, value: string) => {
      mockSessionStorage.data[key] = value
    }),
    getItem: vi.fn((key: string) => mockSessionStorage.data[key] || null),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStorage.data[key]
    })
  }

  const storageService = new StorageService({} as any, mockSessionStorage as any)
  
  const sessionData: SessionData = {
    token: 'abc123',
    userId: 42,
    expiresAt: Date.now() + 3600000 // 1 година
  }

  // Зберегти сесію
  storageService.saveSession(sessionData)
  expect(mockSessionStorage.setItem).toHaveBeenCalled()

  // Отримати сесію
  const retrieved = storageService.getSession()
  expect(retrieved).toEqual(sessionData)

  // Перевірити валідність
  expect(storageService.isSessionValid()).toBe(true)

  // Очистити сесію
  storageService.clearSession()
  expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('session')
})

test('повинен визначити що сесія не валідна', () => {
  const expiredSession: SessionData = {
    token: 'expired',
    userId: 1,
    expiresAt: Date.now() - 1000 // Минула секунда
  }

  const mockStorage = {
    getItem: vi.fn(() => JSON.stringify(expiredSession))
  }

  const storageService = new StorageService({} as any, mockStorage as any)
  
  expect(storageService.isSessionValid()).toBe(false)
})

// 📍 Тести для LocationService

test('повинен перевірити підтримку геолокації', () => {
  // Мокаємо підтримку геолокації
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }

  const locationService = new LocationService(mockGeolocation)
  
  expect(locationService.isGeolocationSupported()).toBe(true)
})

test('повинен отримати поточну позицію', async () => {
  const mockPosition: Position = {
    latitude: 50.4501,
    longitude: 30.5234,
    accuracy: 10,
    timestamp: Date.now()
  }

  const mockGeolocation = {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: mockPosition.latitude,
          longitude: mockPosition.longitude,
          accuracy: mockPosition.accuracy
        },
        timestamp: mockPosition.timestamp
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }

  const locationService = new LocationService(mockGeolocation)
  const position = await locationService.getCurrentPosition()
  
  expect(position).toEqual(mockPosition)
  expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
})

test('повинен обробити помилку геолокації', async () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: 'User denied Geolocation'
      })
    }),
    watchPosition: vi.fn(),
    clearWatch: vi.fn()
  }

  const locationService = new LocationService(mockGeolocation)
  
  await expect(locationService.getCurrentPosition()).rejects.toMatchObject({
    code: 1,
    message: 'Користувач заборонив доступ до геолокації'
  })
})

test('повинен обчислити відстань між точками', () => {
  const locationService = new LocationService({} as any)
  
  const kyiv: Position = {
    latitude: 50.4501,
    longitude: 30.5234,
    accuracy: 10,
    timestamp: Date.now()
  }
  
  const lviv: Position = {
    latitude: 49.8397,
    longitude: 24.0297,
    accuracy: 10,
    timestamp: Date.now()
  }

  const distance = locationService.calculateDistance(kyiv, lviv)
  
  // Приблизна відстань між Києвом та Львовом ~470км
  expect(distance).toBeGreaterThan(450000)
  expect(distance).toBeLessThan(500000)
})

test('повинен перевірити чи позиція в межах області', () => {
  const locationService = new LocationService({} as any)
  
  const center: Position = {
    latitude: 50.4501,
    longitude: 30.5234,
    accuracy: 10,
    timestamp: Date.now()
  }
  
  const nearby: Position = {
    latitude: 50.4510, // Трохи північніше
    longitude: 30.5240, // Трохи східніше
    accuracy: 10,
    timestamp: Date.now()
  }

  const isWithin = locationService.isWithinArea(nearby, center, 1000) // 1км радіус
  expect(isWithin).toBe(true)
})

test('повинен спостерігати за позицією', () => {
  let successCallback: any
  let errorCallback: any
  
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn((success, error) => {
      successCallback = success
      errorCallback = error
      return 12345 // watchId
    }),
    clearWatch: vi.fn()
  }

  const locationService = new LocationService(mockGeolocation)
  
  const onSuccess = vi.fn()
  const onError = vi.fn()
  
  const watchId = locationService.watchPosition(onSuccess, onError)
  
  expect(watchId).toBe(12345)
  expect(mockGeolocation.watchPosition).toHaveBeenCalled()
  
  // Симулюємо успішний колбек
  successCallback({
    coords: { latitude: 50, longitude: 30, accuracy: 10 },
    timestamp: Date.now()
  })
  
  expect(onSuccess).toHaveBeenCalled()
})

// 🔔 Тести для NotificationService

test('повинен перевірити підтримку нотифікацій', () => {
  const mockNotification = vi.fn()
  const notificationService = new NotificationService(mockNotification as any)
  
  // В тестовому середовищі Notification може не бути доступним
  // Тому ми можемо мокати це
  Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true
  })
  
  expect(notificationService.isNotificationSupported()).toBe(true)
})

test('повинен отримати статус дозволу', () => {
  const mockNotification = {
    permission: 'granted'
  }
  
  const notificationService = new NotificationService(mockNotification as any)
  
  expect(notificationService.getPermissionStatus()).toBe('granted')
})

test('повинен створити просту нотифікацію', async () => {
  const mockNotificationInstance = {
    onclick: null,
    onshow: null,
    onclose: null,
    onerror: null
  }
  
  const mockNotification = vi.fn(() => mockNotificationInstance)
  mockNotification.permission = 'granted'
  
  const notificationService = new NotificationService(mockNotification as any)
  
  const result = await notificationService.showSimpleNotification(
    'Тест заголовок',
    'Тест повідомлення'
  )
  
  expect(result.success).toBe(true)
  expect(result.notification).toBe(mockNotificationInstance)
  expect(mockNotification).toHaveBeenCalledWith('Тест заголовок', {
    body: 'Тест повідомлення'
  })
})

test('повинен обробити відсутність дозволу', async () => {
  const mockNotification = {
    permission: 'denied'
  }
  
  const notificationService = new NotificationService(mockNotification as any)
  
  const result = await notificationService.showSimpleNotification(
    'Тест',
    'Повідомлення'
  )
  
  expect(result.success).toBe(false)
  expect(result.error).toBe('Дозвіл на показ нотифікацій не надано')
})

test('повинен запросити дозвіл на нотифікації', async () => {
  const mockNotification = {
    permission: 'default',
    requestPermission: vi.fn().mockResolvedValue('granted')
  }
  
  const notificationService = new NotificationService(mockNotification as any)
  
  const permission = await notificationService.requestPermission()
  
  expect(permission).toBe('granted')
  expect(mockNotification.requestPermission).toHaveBeenCalled()
})

test('повинен створити нотифікацію з обробниками подій', async () => {
  const mockNotificationInstance = {
    onclick: null,
    onshow: null,
    onclose: null,
    onerror: null
  }
  
  const mockNotification = vi.fn(() => mockNotificationInstance)
  mockNotification.permission = 'granted'
  
  const notificationService = new NotificationService(mockNotification as any)
  
  const onClick = vi.fn()
  const onShow = vi.fn()
  
  const result = await notificationService.createNotificationWithHandlers(
    { title: 'Тест', body: 'Повідомлення' },
    { onClick, onShow }
  )
  
  expect(result.success).toBe(true)
  expect(mockNotificationInstance.onclick).toBe(onClick)
  expect(mockNotificationInstance.onshow).toBe(onShow)
}) 