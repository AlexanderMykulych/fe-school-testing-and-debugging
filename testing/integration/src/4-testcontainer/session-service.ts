import { createClient, RedisClientType } from 'redis'

// Типи для сесійних даних
export interface SessionData {
  userId: number
  username: string
  email: string
  role: string
  loginTime: number
  expiresAt: number
}

export interface SessionConfig {
  host: string
  port: number
  password?: string
  database?: number
}

// Сервіс для роботи з сесіями через Redis
export class SessionService {
  private client: RedisClientType
  private readonly keyPrefix = 'session:'

  constructor(config: SessionConfig) {
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port
      },
      password: config.password,
      database: config.database || 0
    })
  }

  /**
   * Підключитися до Redis
   */
  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  /**
   * Відключитися від Redis
   */
  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect()
    }
  }

  /**
   * Перевірити з'єднання
   */
  async ping(): Promise<string> {
    return await this.client.ping()
  }

  /**
   * Створити нову сесію
   */
  async createSession(sessionId: string, data: SessionData, ttlSeconds = 3600): Promise<void> {
    const key = this.getSessionKey(sessionId)
    const serializedData = JSON.stringify(data)
    
    await this.client.setEx(key, ttlSeconds, serializedData)
  }

  /**
   * Отримати дані сесії
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = this.getSessionKey(sessionId)
    const data = await this.client.get(key)
    
    if (!data) {
      return null
    }
    
    try {
      return JSON.parse(data) as SessionData
    } catch (error) {
      console.error('Failed to parse session data:', error)
      return null
    }
  }

  /**
   * Оновити дані сесії
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    const existingSession = await this.getSession(sessionId)
    if (!existingSession) {
      return false
    }

    const updatedSession = { ...existingSession, ...data }
    const key = this.getSessionKey(sessionId)
    const ttl = await this.client.ttl(key)
    
    // Зберігаємо з тим же TTL
    await this.client.setEx(key, ttl > 0 ? ttl : 3600, JSON.stringify(updatedSession))
    return true
  }

  /**
   * Видалити сесію
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const key = this.getSessionKey(sessionId)
    const result = await this.client.del(key)
    return result > 0
  }

  /**
   * Перевірити чи сесія існує
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    const key = this.getSessionKey(sessionId)
    const exists = await this.client.exists(key)
    return exists === 1
  }

  /**
   * Отримати всі активні сесії користувача
   */
  async getUserSessions(userId: number): Promise<string[]> {
    const pattern = `${this.keyPrefix}*`
    const keys = await this.client.keys(pattern)
    const userSessions: string[] = []

    for (const key of keys) {
      const data = await this.client.get(key)
      if (data) {
        try {
          const sessionData = JSON.parse(data) as SessionData
          if (sessionData.userId === userId) {
            userSessions.push(key.replace(this.keyPrefix, ''))
          }
        } catch (error) {
          // Ігноруємо помилки парсингу
        }
      }
    }

    return userSessions
  }

  /**
   * Видалити всі сесії користувача
   */
  async deleteUserSessions(userId: number): Promise<number> {
    const sessionIds = await this.getUserSessions(userId)
    
    if (sessionIds.length === 0) {
      return 0
    }

    const keys = sessionIds.map(id => this.getSessionKey(id))
    return await this.client.del(keys)
  }

  /**
   * Продовжити термін дії сесії
   */
  async extendSession(sessionId: string, ttlSeconds = 3600): Promise<boolean> {
    const key = this.getSessionKey(sessionId)
    const exists = await this.client.exists(key)
    
    if (exists === 0) {
      return false
    }

    const result = await this.client.expire(key, ttlSeconds)
    return result
  }

  /**
   * Отримати інформацію про сесію (TTL, розмір даних)
   */
  async getSessionInfo(sessionId: string): Promise<{
    exists: boolean
    ttl: number
    size: number
  } | null> {
    const key = this.getSessionKey(sessionId)
    const exists = await this.client.exists(key)
    
    if (exists === 0) {
      return null
    }

    const ttl = await this.client.ttl(key)
    const data = await this.client.get(key)
    const size = data ? Buffer.byteLength(data, 'utf8') : 0

    return {
      exists: true,
      ttl,
      size
    }
  }

  /**
   * Очистити всі сесії (для тестів)
   */
  async clearAllSessions(): Promise<number> {
    const keys = await this.client.keys(`${this.keyPrefix}*`)
    
    if (keys.length === 0) {
      return 0
    }

    return await this.client.del(keys)
  }

  /**
   * Отримати статистику сесій
   */
  async getSessionStats(): Promise<{
    totalSessions: number
    totalUsers: number
    averageSessionSize: number
  }> {
    const keys = await this.client.keys(`${this.keyPrefix}*`)
    const uniqueUsers = new Set<number>()
    let totalSize = 0

    for (const key of keys) {
      const data = await this.client.get(key)
      if (data) {
        totalSize += Buffer.byteLength(data, 'utf8')
        try {
          const sessionData = JSON.parse(data) as SessionData
          uniqueUsers.add(sessionData.userId)
        } catch (error) {
          // Ігноруємо помилки парсингу
        }
      }
    }

    return {
      totalSessions: keys.length,
      totalUsers: uniqueUsers.size,
      averageSessionSize: keys.length > 0 ? Math.round(totalSize / keys.length) : 0
    }
  }

  /**
   * Сформувати ключ для сесії
   */
  private getSessionKey(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`
  }
} 