import { test, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import { ApiClient } from './api-client'
import { UserRepository, type User, type CreateUserRequest } from './user-repository'

// Setup
let apiClient: ApiClient
let userRepository: UserRepository

beforeEach(() => {
  apiClient = new ApiClient({
    baseURL: 'http://localhost:3000'
  })
  userRepository = new UserRepository(apiClient)
})

// 📋 CRUD операції

test('повинен отримати список всіх користувачів', async () => {
  const users = await userRepository.getAllUsers()
  
  expect(users).toHaveLength(3)
  expect(users[0]).toEqual({
    id: 1,
    name: 'Іван Петренко',
    email: 'ivan@example.com',
    active: true
  })
})

test('повинен отримати користувача за ID', async () => {
  const user = await userRepository.getUserById(1)
  
  expect(user).toEqual({
    id: 1,
    name: 'Користувач 1',
    email: 'user1@example.com',
    active: true
  })
})

test('повинен створити нового користувача', async () => {
  const newUserData: CreateUserRequest = {
    name: 'Новий Користувач',
    email: 'new@example.com'
  }
  
  const createdUser = await userRepository.createUser(newUserData)
  
  expect(createdUser).toMatchObject({
    name: 'Новий Користувач',
    email: 'new@example.com',
    active: true
  })
  expect(createdUser.id).toBeTypeOf('number')
})

test('повинен оновити користувача', async () => {
  const updateData = {
    name: 'Оновлене Ім\'я',
    active: false
  }
  
  const updatedUser = await userRepository.updateUser(1, updateData)
  
  expect(updatedUser).toMatchObject({
    id: 1,
    name: 'Оновлене Ім\'я',
    active: false
  })
})

test('повинен видалити користувача', async () => {
  await expect(userRepository.deleteUser(1)).resolves.toBeUndefined()
})

// 🚨 Обробка помилок

test('повинен викинути помилку при отриманні неіснуючого користувача', async () => {
  await expect(userRepository.getUserById(999))
    .rejects
    .toThrow()
})

test('повинен викинути помилку при створенні користувача з неправильними даними', async () => {
  const invalidUserData = {
    name: '',
    email: ''
  } as CreateUserRequest
  
  await expect(userRepository.createUser(invalidUserData))
    .rejects
    .toThrow()
})

test('повинен повернути false якщо користувач не існує', async () => {
  const exists = await userRepository.userExists(999)
  expect(exists).toBe(false)
})

test('повинен повернути true якщо користувач існує', async () => {
  const exists = await userRepository.userExists(1)
  expect(exists).toBe(true)
})

// 🔍 Бізнес логіка

test('повинен отримати тільки активних користувачів', async () => {
  const activeUsers = await userRepository.getActiveUsers()
  
  expect(activeUsers).toHaveLength(2)
  expect(activeUsers.every(user => user.active)).toBe(true)
})

test('повинен знайти користувачів за ім\'ям', async () => {
  const users = await userRepository.searchUsersByName('Іван')
  
  expect(users).toHaveLength(1)
  expect(users[0].name).toBe('Іван Петренко')
})

test('повинен повернути порожній масив якщо користувачів не знайдено', async () => {
  const users = await userRepository.searchUsersByName('Неіснуючий')
  
  expect(users).toHaveLength(0)
})

// 🔄 Retry логіка

test('повинен повторити запит при помилці сервера', async () => {
  let attempts = 0
  
  // Перевизначаємо обробник для тестування retry
  server.use(
    http.get('/api/users/500', () => {
      attempts++
      if (attempts < 3) {
        return new HttpResponse(null, { status: 500 })
      }
      return HttpResponse.json({
        id: 500,
        name: 'Користувач після retry',
        email: 'retry@example.com',
        active: true
      } as User)
    })
  )
  
  const user = await userRepository.getUserByIdWithRetry(500)
  
  expect(attempts).toBe(3)
  expect(user.name).toBe('Користувач після retry')
})

// 🌐 Тестування з різними HTTP статусами

test('повинен обробити timeout помилку', async () => {
  server.use(
    http.get('/api/users/timeout', async () => {
      await new Promise(resolve => setTimeout(resolve, 6000)) // Більше ніж timeout
      return HttpResponse.json({ id: 1 })
    })
  )
  
  await expect(userRepository.getUserById('timeout' as any))
    .rejects
    .toThrow()
})

// 📊 Тестування з реальними даними

test('повинен правильно обробити великий список користувачів', async () => {
  const largeUserList = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Користувач ${i + 1}`,
    email: `user${i + 1}@example.com`,
    active: i % 2 === 0
  }))
  
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json(largeUserList)
    })
  )
  
  const users = await userRepository.getAllUsers()
  const activeUsers = await userRepository.getActiveUsers()
  
  expect(users).toHaveLength(100)
  expect(activeUsers).toHaveLength(50)
}) 