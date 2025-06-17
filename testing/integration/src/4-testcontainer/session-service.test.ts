import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { SessionService, type SessionData } from './session-service'
import { getRedisConfig } from '../../globalSetup'

// 🐳 TestContainer setup з використанням глобального контейнера
let sessionService: SessionService

beforeAll(async () => {
  // Отримуємо параметри з глобального налаштування
  console.log('🔗 Підключення до глобального Redis контейнера...')
  
  const { host, port } = getRedisConfig()
  console.log(`📍 Використовуємо Redis на ${host}:${port}`)

  // Створюємо сервіс з параметрами глобального контейнера
  sessionService = new SessionService({
    host,
    port
  })

  // Підключаємося до Redis
  await sessionService.connect()
  
  // Перевіряємо з'єднання
  const pong = await sessionService.ping()
  expect(pong).toBe('PONG')
  
  console.log('✅ З\'єднання з Redis встановлено')
}, 30_000) // Скорочуємо час очікування, оскільки контейнер вже запущений

afterAll(async () => {
  // Відключаємося від Redis (контейнер зупиниться автоматично в globalSetup)
  if (sessionService) {
    console.log('🔌 Відключення від Redis...')
    await sessionService.disconnect()
  }
}, 10_000)

beforeEach(async () => {
  // Очищуємо всі сесії перед кожним тестом
  await sessionService.clearAllSessions()
})

// 📦 Базові операції з сесіями

test('повинен створити та отримати сесію', async () => {
  const sessionId = 'test-session-1'
  const sessionData: SessionData = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  }

  // Створюємо сесію
  await sessionService.createSession(sessionId, sessionData, 60) // 60 секунд TTL

  // Перевіряємо що сесія існує
  const exists = await sessionService.sessionExists(sessionId)
  expect(exists).toBe(true)

  // Отримуємо дані сесії
  const retrievedSession = await sessionService.getSession(sessionId)
  expect(retrievedSession).toEqual(sessionData)
})

test('повинен повернути null для неіснуючої сесії', async () => {
  const session = await sessionService.getSession('nonexistent-session')
  expect(session).toBeNull()
})

test('повинен видалити сесію', async () => {
  const sessionId = 'session-to-delete'
  const sessionData: SessionData = {
    userId: 2,
    username: 'deleteuser',
    email: 'delete@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  }

  // Створюємо сесію
  await sessionService.createSession(sessionId, sessionData)
  
  // Перевіряємо що існує
  expect(await sessionService.sessionExists(sessionId)).toBe(true)

  // Видаляємо
  const deleted = await sessionService.deleteSession(sessionId)
  expect(deleted).toBe(true)

  // Перевіряємо що більше не існує
  expect(await sessionService.sessionExists(sessionId)).toBe(false)
})

// 🔄 Оновлення сесій

test('повинен оновити існуючу сесію', async () => {
  const sessionId = 'session-to-update'
  const originalData: SessionData = {
    userId: 3,
    username: 'originaluser',
    email: 'original@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  }

  // Створюємо сесію
  await sessionService.createSession(sessionId, originalData)

  // Оновлюємо дані
  const updated = await sessionService.updateSession(sessionId, {
    username: 'updateduser',
    role: 'admin'
  })
  expect(updated).toBe(true)

  // Перевіряємо оновлені дані
  const updatedSession = await sessionService.getSession(sessionId)
  expect(updatedSession).toMatchObject({
    ...originalData,
    username: 'updateduser',
    role: 'admin'
  })
})

test('не повинен оновити неіснуючу сесію', async () => {
  const updated = await sessionService.updateSession('nonexistent', {
    username: 'newname'
  })
  expect(updated).toBe(false)
})

// ⏱️ TTL та expire

test('повинен продовжити термін дії сесії', async () => {
  const sessionId = 'session-to-extend'
  const sessionData: SessionData = {
    userId: 4,
    username: 'extenduser',
    email: 'extend@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  }

  // Створюємо сесію з коротким TTL
  await sessionService.createSession(sessionId, sessionData, 5) // 5 секунд

  // Продовжуємо термін дії
  const extended = await sessionService.extendSession(sessionId, 60) // 60 секунд
  expect(extended).toBe(true)

  // Перевіряємо інформацію про сесію
  const info = await sessionService.getSessionInfo(sessionId)
  expect(info).toBeDefined()
  expect(info!.exists).toBe(true)
  expect(info!.ttl).toBeGreaterThan(50) // Має бути близько 60 секунд
})

test('сесія повинна автоматично видалятися після TTL', async () => {
  const sessionId = 'short-lived-session'
  const sessionData: SessionData = {
    userId: 5,
    username: 'shortuser',
    email: 'short@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 1000
  }

  // Створюємо сесію з дуже коротким TTL
  await sessionService.createSession(sessionId, sessionData, 1) // 1 секунда

  // Перевіряємо що існує
  expect(await sessionService.sessionExists(sessionId)).toBe(true)

  // Чекаємо більше ніж TTL
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Перевіряємо що більше не існує
  expect(await sessionService.sessionExists(sessionId)).toBe(false)
})

// 👥 Операції з користувачами

test('повинен отримати всі сесії користувача', async () => {
  const userId = 10
  const sessions = [
    {
      id: 'user-session-1',
      data: {
        userId,
        username: 'multiuser',
        email: 'multi@example.com',
        role: 'user',
        loginTime: Date.now(),
        expiresAt: Date.now() + 3600000
      }
    },
    {
      id: 'user-session-2',
      data: {
        userId,
        username: 'multiuser',
        email: 'multi@example.com',
        role: 'user',
        loginTime: Date.now() + 1000,
        expiresAt: Date.now() + 3600000
      }
    }
  ]

  // Створюємо кілька сесій для одного користувача
  for (const session of sessions) {
    await sessionService.createSession(session.id, session.data)
  }

  // Створюємо сесію для іншого користувача
  await sessionService.createSession('other-user-session', {
    userId: 99,
    username: 'otheruser',
    email: 'other@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  })

  // Отримуємо сесії користувача
  const userSessions = await sessionService.getUserSessions(userId)
  
  expect(userSessions).toHaveLength(2)
  expect(userSessions).toContain('user-session-1')
  expect(userSessions).toContain('user-session-2')
})

test('повинен видалити всі сесії користувача', async () => {
  const userId = 11
  
  // Створюємо кілька сесій
  await sessionService.createSession('delete-session-1', {
    userId,
    username: 'deleteall',
    email: 'deleteall@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  })
  
  await sessionService.createSession('delete-session-2', {
    userId,
    username: 'deleteall',
    email: 'deleteall@example.com',
    role: 'user',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  })

  // Перевіряємо що сесії існують
  expect(await sessionService.getUserSessions(userId)).toHaveLength(2)

  // Видаляємо всі сесії користувача
  const deletedCount = await sessionService.deleteUserSessions(userId)
  expect(deletedCount).toBe(2)

  // Перевіряємо що сесій більше немає
  expect(await sessionService.getUserSessions(userId)).toHaveLength(0)
})

// 📊 Статистика

test('повинен надати статистику сесій', async () => {
  // Створюємо кілька сесій для різних користувачів
  const sessions = [
    { id: 'stats-1', userId: 20 },
    { id: 'stats-2', userId: 20 },
    { id: 'stats-3', userId: 21 },
    { id: 'stats-4', userId: 22 }
  ]

  for (const session of sessions) {
    await sessionService.createSession(session.id, {
      userId: session.userId,
      username: `user${session.userId}`,
      email: `user${session.userId}@example.com`,
      role: 'user',
      loginTime: Date.now(),
      expiresAt: Date.now() + 3600000
    })
  }

  // Отримуємо статистику
  const stats = await sessionService.getSessionStats()
  
  expect(stats.totalSessions).toBe(4)
  expect(stats.totalUsers).toBe(3) // userId: 20, 21, 22
  expect(stats.averageSessionSize).toBeGreaterThan(0)
})

// 🧹 Очищення

test('повинен очистити всі сесії', async () => {
  // Створюємо кілька сесій
  for (let i = 1; i <= 3; i++) {
    await sessionService.createSession(`clear-session-${i}`, {
      userId: i,
      username: `clearuser${i}`,
      email: `clear${i}@example.com`,
      role: 'user',
      loginTime: Date.now(),
      expiresAt: Date.now() + 3600000
    })
  }

  // Перевіряємо що сесії створені
  const statsBefore = await sessionService.getSessionStats()
  expect(statsBefore.totalSessions).toBe(3)

  // Очищуємо всі сесії
  const clearedCount = await sessionService.clearAllSessions()
  expect(clearedCount).toBe(3)

  // Перевіряємо що все очищено
  const statsAfter = await sessionService.getSessionStats()
  expect(statsAfter.totalSessions).toBe(0)
})

// 🔍 Інформація про сесію

test('повинен надати детальну інформацію про сесію', async () => {
  const sessionId = 'info-session'
  const sessionData: SessionData = {
    userId: 30,
    username: 'infouser',
    email: 'info@example.com',
    role: 'admin',
    loginTime: Date.now(),
    expiresAt: Date.now() + 3600000
  }

  // Створюємо сесію
  await sessionService.createSession(sessionId, sessionData, 120) // 2 хвилини TTL

  // Отримуємо інформацію
  const info = await sessionService.getSessionInfo(sessionId)
  
  expect(info).toBeDefined()
  expect(info!.exists).toBe(true)
  expect(info!.ttl).toBeGreaterThan(110) // Має бути близько 120 секунд
  expect(info!.ttl).toBeLessThanOrEqual(120)
  expect(info!.size).toBeGreaterThan(0) // Розмір даних у байтах
})

test('повинен повернути null для інформації про неіснуючу сесію', async () => {
  const info = await sessionService.getSessionInfo('nonexistent-info-session')
  expect(info).toBeNull()
}) 