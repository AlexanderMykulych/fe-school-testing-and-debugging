import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Запускаємо MSW сервер перед тестами
beforeAll(() => {
  server.listen()
})

// Очищуємо обробники після кожного тесту
afterEach(() => {
  server.resetHandlers()
})

// Закриваємо сервер після всіх тестів
afterAll(() => {
  server.close()
}) 