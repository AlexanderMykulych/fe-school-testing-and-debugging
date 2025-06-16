// Типи для роботи з даними
export interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'uk' | 'en'
  notifications: boolean
}

export interface SessionData {
  token: string
  userId: number
  expiresAt: number
}

// Сервіс для роботи з localStorage та sessionStorage
export class StorageService {
  private readonly localStorage: Storage
  private readonly sessionStorage: Storage

  constructor(
    localStorage = window.localStorage,
    sessionStorage = window.sessionStorage
  ) {
    this.localStorage = localStorage
    this.sessionStorage = sessionStorage
  }

  // 📦 LocalStorage методи (для постійного зберігання)

  /**
   * Зберегти об'єкт в localStorage
   */
  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value)
      this.localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  /**
   * Отримати об'єкт з localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const item = this.localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  }

  /**
   * Видалити елемент з localStorage
   */
  removeItem(key: string): boolean {
    try {
      this.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
      return false
    }
  }

  /**
   * Очистити весь localStorage
   */
  clearStorage(): boolean {
    try {
      this.localStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
      return false
    }
  }

  // 🎯 SessionStorage методи (для тимчасового зберігання)

  /**
   * Зберегти об'єкт в sessionStorage
   */
  setSessionItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value)
      this.sessionStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error)
      return false
    }
  }

  /**
   * Отримати об'єкт з sessionStorage
   */
  getSessionItem<T>(key: string): T | null {
    try {
      const item = this.sessionStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Failed to read from sessionStorage:', error)
      return null
    }
  }

  /**
   * Видалити елемент з sessionStorage
   */
  removeSessionItem(key: string): boolean {
    try {
      this.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to remove from sessionStorage:', error)
      return false
    }
  }

  // 👤 Спеціальні методи для користувацьких налаштувань

  /**
   * Зберегти налаштування користувача
   */
  saveUserPreferences(preferences: UserPreferences): boolean {
    return this.setItem('userPreferences', preferences)
  }

  /**
   * Отримати налаштування користувача
   */
  getUserPreferences(): UserPreferences | null {
    return this.getItem<UserPreferences>('userPreferences')
  }

  /**
   * Отримати налаштування з значеннями за замовчуванням
   */
  getUserPreferencesWithDefaults(): UserPreferences {
    const preferences = this.getUserPreferences()
    return preferences ?? {
      theme: 'light',
      language: 'uk',
      notifications: true
    }
  }

  // 🔐 Методи для роботи з сесією

  /**
   * Зберегти дані сесії
   */
  saveSession(sessionData: SessionData): boolean {
    return this.setSessionItem('session', sessionData)
  }

  /**
   * Отримати дані сесії
   */
  getSession(): SessionData | null {
    return this.getSessionItem<SessionData>('session')
  }

  /**
   * Перевірити чи сесія ще дійсна
   */
  isSessionValid(): boolean {
    const session = this.getSession()
    if (!session) return false
    
    return Date.now() < session.expiresAt
  }

  /**
   * Очистити сесію
   */
  clearSession(): boolean {
    return this.removeSessionItem('session')
  }

  // 📊 Утилітарні методи

  /**
   * Отримати розмір localStorage (наближено)
   */
  getStorageSize(): number {
    let total = 0
    for (let key in this.localStorage) {
      if (this.localStorage.hasOwnProperty(key)) {
        total += this.localStorage[key].length + key.length
      }
    }
    return total
  }

  /**
   * Перевірити чи доступний localStorage
   */
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__'
      this.localStorage.setItem(test, test)
      this.localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Отримати всі ключі localStorage
   */
  getStorageKeys(): string[] {
    return Object.keys(this.localStorage)
  }
} 