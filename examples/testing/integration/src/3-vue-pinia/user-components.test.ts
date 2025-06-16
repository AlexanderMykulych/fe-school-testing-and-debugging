import { test, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import { useUserStore, type User } from './stores/user-store'
import UserProfile from './components/UserProfile.vue'
import UserList from './components/UserList.vue'

// Setup для кожного тесту
beforeEach(() => {
  // Створюємо новий Pinia instance для кожного тесту
  setActivePinia(createPinia())
})

// Mock для window.confirm
const mockConfirm = vi.fn()
Object.defineProperty(window, 'confirm', { value: mockConfirm })

// 👤 Тести UserProfile компонента

test('повинен показати "користувач не обраний" коли немає currentUser', () => {
  const wrapper = mount(UserProfile)
  
  expect(wrapper.find('[data-testid="no-user"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="no-user"]').text()).toContain('Користувач не обраний')
})

test('повинен відобразити дані користувача з store', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'admin'
  }

  // Встановлюємо поточного користувача
  store.setCurrentUser(mockUser)

  const wrapper = mount(UserProfile)
  
  expect(wrapper.find('[data-testid="profile-content"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="user-name"]').text()).toBe(mockUser.name)
  expect(wrapper.find('[data-testid="user-email"]').text()).toBe(mockUser.email)
  expect(wrapper.find('[data-testid="status-badge"]').text()).toBe('Активний')
  expect(wrapper.find('[data-testid="role-badge"]').text()).toBe('Адміністратор')
})

test('повинен відобразити користувача за userId prop', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 42,
    name: 'Користувач за ID',
    email: 'userid@example.com',
    active: false,
    role: 'user'
  }

  // Додаємо користувача в store
  store.addUser(mockUser)

  const wrapper = mount(UserProfile, {
    props: { userId: 42 }
  })
  
  expect(wrapper.find('[data-testid="user-name"]').text()).toBe(mockUser.name)
  expect(wrapper.find('[data-testid="status-badge"]').text()).toBe('Неактивний')
  expect(wrapper.find('[data-testid="role-badge"]').text()).toBe('Користувач')
})

test('повинен показати стан завантаження', async () => {
  const store = useUserStore()
  store.loading = true

  const wrapper = mount(UserProfile)
  
  expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="loading"]').text()).toContain('Завантаження')
})

test('повинен показати помилку та кнопку очищення', async () => {
  const store = useUserStore()
  store.error = 'Помилка завантаження користувача'

  const wrapper = mount(UserProfile)
  
  expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="error"]').text()).toContain('Помилка завантаження користувача')
  
  // Натискаємо кнопку очищення помилки
  await wrapper.find('[data-testid="clear-error-btn"]').trigger('click')
  
  expect(store.error).toBeNull()
})

test('повинен емітити події при взаємодії з користувачем', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.setCurrentUser(mockUser)

  const wrapper = mount(UserProfile)

  // Тест кнопки редагування
  await wrapper.find('[data-testid="edit-user-btn"]').trigger('click')
  
  const editEvents = wrapper.emitted('editRequested')
  expect(editEvents).toHaveLength(1)
  expect(editEvents![0]).toEqual([mockUser])
})

test('повинен оновити статус користувача', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.setCurrentUser(mockUser)

  // Мокаємо API відповідь для оновлення
  server.use(
    http.put('/api/users/1', () => {
      return HttpResponse.json({
        ...mockUser,
        active: false
      })
    })
  )

  const wrapper = mount(UserProfile)

  // Натискаємо кнопку деактивації
  await wrapper.find('[data-testid="toggle-active-btn"]').trigger('click')

  // Чекаємо оновлення
  await wrapper.vm.$nextTick()

  const updateEvents = wrapper.emitted('userUpdated')
  expect(updateEvents).toHaveLength(1)
})

test('повинен видалити користувача після підтвердження', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.setCurrentUser(mockUser)
  mockConfirm.mockReturnValue(true) // Підтверджуємо видалення

  const wrapper = mount(UserProfile)

  // Натискаємо кнопку видалення
  await wrapper.find('[data-testid="delete-user-btn"]').trigger('click')

  // Перевіряємо що confirm було викликано
  expect(mockConfirm).toHaveBeenCalledWith(
    expect.stringContaining('Ви впевнені, що хочете видалити користувача Тестовий Користувач?')
  )

  const deleteEvents = wrapper.emitted('userDeleted')
  expect(deleteEvents).toHaveLength(1)
  expect(deleteEvents![0]).toEqual([mockUser.id])
})

// 📋 Тести UserList компонента

test('повинен відобразити список користувачів з store', async () => {
  const store = useUserStore()
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Перший Користувач',
      email: 'first@example.com',
      active: true,
      role: 'admin'
    },
    {
      id: 2,
      name: 'Другий Користувач',
      email: 'second@example.com',
      active: false,
      role: 'user'
    }
  ]

  // Додаємо користувачів в store
  mockUsers.forEach(user => store.addUser(user))

  const wrapper = mount(UserList)
  
  expect(wrapper.find('[data-testid="user-cards"]').exists()).toBe(true)
  expect(wrapper.findAll('[data-testid^="user-card-"]')).toHaveLength(2)
  expect(wrapper.find('[data-testid="user-name-1"]').text()).toBe('Перший Користувач')
  expect(wrapper.find('[data-testid="user-name-2"]').text()).toBe('Другий Користувач')
})

test('повинен показати порожній стан коли немає користувачів', async () => {
  const wrapper = mount(UserList)
  
  expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="empty-state"]').text()).toContain('Користувачів не знайдено')
})

test('повинен фільтрувати користувачів за пошуковим запитом', async () => {
  const store = useUserStore()
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Іван Петров',
      email: 'ivan@example.com',
      active: true,
      role: 'user'
    },
    {
      id: 2,
      name: 'Марія Іванова',
      email: 'maria@example.com',
      active: true,
      role: 'user'
    }
  ]

  mockUsers.forEach(user => store.addUser(user))

  const wrapper = mount(UserList)

  // Вводимо пошуковий запит
  const searchInput = wrapper.find('[data-testid="search-input"]')
  await searchInput.setValue('Іван')

  // Чекаємо що фільтр застосувався
  await wrapper.vm.$nextTick()

  // Повинен показати тільки користувачів з "Іван" в імені
  expect(store.filteredUsers).toHaveLength(2) // Іван Петров та Марія Іванова (email)
})

test('повинен фільтрувати за роллю', async () => {
  const store = useUserStore()
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Адмін',
      email: 'admin@example.com',
      active: true,
      role: 'admin'
    },
    {
      id: 2,
      name: 'Користувач',
      email: 'user@example.com',
      active: true,
      role: 'user'
    }
  ]

  mockUsers.forEach(user => store.addUser(user))

  const wrapper = mount(UserList)

  // Вибираємо фільтр за роллю
  const roleFilter = wrapper.find('[data-testid="role-filter"]')
  await roleFilter.setValue('admin')

  await wrapper.vm.$nextTick()

  expect(store.filteredUsers).toHaveLength(1)
  expect(store.filteredUsers[0].role).toBe('admin')
})

test('повинен фільтрувати за статусом активності', async () => {
  const store = useUserStore()
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Активний',
      email: 'active@example.com',
      active: true,
      role: 'user'
    },
    {
      id: 2,
      name: 'Неактивний',
      email: 'inactive@example.com',
      active: false,
      role: 'user'
    }
  ]

  mockUsers.forEach(user => store.addUser(user))

  const wrapper = mount(UserList)

  // Фільтруємо тільки активних
  const activeFilter = wrapper.find('[data-testid="active-filter"]')
  await activeFilter.setValue('true')

  await wrapper.vm.$nextTick()

  expect(store.filteredUsers).toHaveLength(1)
  expect(store.filteredUsers[0].active).toBe(true)
})

test('повинен очистити всі фільтри', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тест',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.addUser(mockUser)

  const wrapper = mount(UserList)

  // Встановлюємо фільтри
  await wrapper.find('[data-testid="search-input"]').setValue('тест')
  await wrapper.find('[data-testid="role-filter"]').setValue('admin')

  // Очищуємо фільтри
  await wrapper.find('[data-testid="clear-filters-btn"]').trigger('click')

  // Перевіряємо що фільтри очищені
  expect((wrapper.find('[data-testid="search-input"]').element as HTMLInputElement).value).toBe('')
  expect((wrapper.find('[data-testid="role-filter"]').element as HTMLSelectElement).value).toBe('')
  expect(store.filters).toEqual({})
})

test('повинен вибрати користувача при кліку', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.addUser(mockUser)

  const wrapper = mount(UserList)

  // Клікаємо на картку користувача
  await wrapper.find('[data-testid="user-card-1"]').trigger('click')

  // Перевіряємо що користувач встановлений як поточний
  expect(store.currentUser).toEqual(mockUser)

  // Перевіряємо що емітнута подія
  const selectedEvents = wrapper.emitted('userSelected')
  expect(selectedEvents).toHaveLength(1)
  expect(selectedEvents![0]).toEqual([mockUser])
})

test('повинен перемикати статус користувача в списку', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Тестовий Користувач',
    email: 'test@example.com',
    active: true,
    role: 'user'
  }

  store.addUser(mockUser)

  // Мокаємо API відповідь
  server.use(
    http.put('/api/users/1', () => {
      return HttpResponse.json({
        ...mockUser,
        active: false
      })
    })
  )

  const wrapper = mount(UserList)

  // Клікаємо кнопку перемикання статусу
  await wrapper.find('[data-testid="toggle-btn-1"]').trigger('click')

  const updateEvents = wrapper.emitted('userUpdated')
  expect(updateEvents).toHaveLength(1)
})

test('повинен видалити користувача зі списку', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Користувач для видалення',
    email: 'delete@example.com',
    active: true,
    role: 'user'
  }

  store.addUser(mockUser)
  mockConfirm.mockReturnValue(true) // Підтверджуємо видалення

  const wrapper = mount(UserList)

  // Клікаємо кнопку видалення
  await wrapper.find('[data-testid="delete-btn-1"]').trigger('click')

  // Перевіряємо підтвердження
  expect(mockConfirm).toHaveBeenCalled()

  const deleteEvents = wrapper.emitted('userDeleted')
  expect(deleteEvents).toHaveLength(1)
  expect(deleteEvents![0]).toEqual([mockUser.id])
})

test('повинен показати стан завантаження в списку', async () => {
  const store = useUserStore()
  store.loading = true

  const wrapper = mount(UserList)
  
  expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="loading"]').text()).toContain('Завантаження користувачів')
})

test('повинен показати помилку з кнопкою повтору', async () => {
  const store = useUserStore()
  store.error = 'Помилка завантаження'

  const wrapper = mount(UserList)
  
  expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="retry-btn"]').exists()).toBe(true)
})

// 🔄 Інтеграційні тести store + компоненти

test('повинен синхронізувати дані між UserList та UserProfile', async () => {
  const store = useUserStore()
  const mockUser: User = {
    id: 1,
    name: 'Синхронізований Користувач',
    email: 'sync@example.com',
    active: true,
    role: 'user'
  }

  store.addUser(mockUser)

  const listWrapper = mount(UserList)
  const profileWrapper = mount(UserProfile)

  // Вибираємо користувача в списку
  await listWrapper.find('[data-testid="user-card-1"]').trigger('click')

  // Перевіряємо що профіль оновився
  expect(store.currentUser).toEqual(mockUser)
  expect(profileWrapper.find('[data-testid="user-name"]').text()).toBe(mockUser.name)
}) 