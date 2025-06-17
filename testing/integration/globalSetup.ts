import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// Глобальні змінні для контейнера
let redisContainer: StartedTestContainer | null = null

// Шлях до файлу конфігурації
const configPath = join(__dirname, 'redis-config.json')

/**
 * Глобальне налаштування для тестів
 * Запускає Redis контейнер один раз для всіх тестів
 */
export async function setup() {
  console.log('Глобальне налаштування: запуск Redis контейнера...')
  
  try {
    redisContainer = await new GenericContainer('redis:7.0-alpine')
      .withExposedPorts(6379)
      .withReuse() // Переважносте контейнера для покращення продуктивності
      .start()

    const redisHost = redisContainer.getHost()
    const redisPort = redisContainer.getMappedPort(6379)
    
    console.log(`Redis контейнер запущено на ${redisHost}:${redisPort}`)
    
    // Зберігаємо параметри підключення в файл
    const config = {
      host: redisHost,
      port: redisPort,
      timestamp: Date.now()
    }
    
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log(`Конфігурація збережена в ${configPath}`)
    
  } catch (error) {
    console.error('Помилка запуску Redis контейнера:', error)
    throw error
  }
}

/**
 * Глобальне очищення після тестів
 * Зупиняє Redis контейнер і видаляє файл конфігурації
 */
export async function teardown() {
  console.log('Глобальне очищення: зупинка Redis контейнера...')
  
  if (redisContainer) {
    try {
      await redisContainer.stop()
      console.log('Redis контейнер зупинено')
    } catch (error) {
      console.error('Помилка зупинки Redis контейнера:', error)
    }
  }
  
  // Видаляємо файл конфігурації
  try {
    if (existsSync(configPath)) {
      const { unlinkSync } = await import('fs')
      unlinkSync(configPath)
      console.log('Файл конфігурації видалено')
    }
  } catch (error) {
    console.error('Помилка видалення файлу конфігурації:', error)
  }
}

/**
 * 📦 Допоміжна функція для отримання параметрів Redis
 */
export function getRedisConfig() {
  const { readFileSync } = require('fs')
  
  if (!existsSync(configPath)) {
    throw new Error('Redis контейнер не налаштований. Переконайтеся що globalSetup виконався.')
  }
  
  try {
    const configData = readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configData)
    
    if (!config.host || !config.port) {
      throw new Error('Некоректна конфігурація Redis контейнера.')
    }
    
    return { host: config.host, port: config.port }
  } catch (error) {
    throw new Error(`Помилка читання конфігурації Redis: ${error}`)
  }
} 