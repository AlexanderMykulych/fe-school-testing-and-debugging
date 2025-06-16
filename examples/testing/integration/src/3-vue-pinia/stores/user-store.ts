import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Типи для користувача
export interface User {
  id: number
  name: string
  email: string
  active: boolean
  role: 'admin' | 'user' | 'moderator'
  avatar?: string
}

export interface CreateUserData {
  name: string
  email: string
  role?: User['role']
}

export interface UserFilters {
  active?: boolean
  role?: User['role']
  search?: string
}

// Composition API стиль store
export const useUserStore = defineStore('user', () => {
  // 📦 State
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<UserFilters>({})

  // 🔍 Getters
  const filteredUsers = computed(() => {
    let result = users.value

    if (filters.value.active !== undefined) {
      result = result.filter(user => user.active === filters.value.active)
    }

    if (filters.value.role) {
      result = result.filter(user => user.role === filters.value.role)
    }

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    }

    return result
  })

  const activeUsers = computed(() => 
    users.value.filter(user => user.active)
  )

  const usersByRole = computed(() => {
    const grouped: Record<string, User[]> = {}
    users.value.forEach(user => {
      if (!grouped[user.role]) {
        grouped[user.role] = []
      }
      grouped[user.role].push(user)
    })
    return grouped
  })

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const errorMessage = computed(() => error.value)
  const totalUsers = computed(() => users.value.length)

  // ⚡ Actions
  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // Симулюємо API виклик
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      users.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id: number): Promise<User | null> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/users/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const user = await response.json()
      
      // Оновлюємо в локальному списку якщо є
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = user
      }
      
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData: CreateUserData): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          role: userData.role || 'user'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newUser = await response.json()
      users.value.push(newUser)
      
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, userData: Partial<User>): Promise<User> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedUser = await response.json()
      
      // Оновлюємо в локальному списку
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Видаляємо з локального списку
      users.value = users.value.filter(u => u.id !== id)
      
      // Якщо це поточний користувач, очищуємо
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setCurrentUser(user: User | null): void {
    currentUser.value = user
  }

  function setFilters(newFilters: UserFilters): void {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters(): void {
    filters.value = {}
  }

  function clearError(): void {
    error.value = null
  }

  function addUser(user: User): void {
    users.value.push(user)
  }

  function removeUser(id: number): void {
    users.value = users.value.filter(u => u.id !== id)
    if (currentUser.value?.id === id) {
      currentUser.value = null
    }
  }

  // Утилітарні функції
  function getUserById(id: number): User | undefined {
    return users.value.find(u => u.id === id)
  }

  function toggleUserActive(id: number): void {
    const user = getUserById(id)
    if (user) {
      user.active = !user.active
    }
  }

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    filters,
    
    // Getters
    filteredUsers,
    activeUsers,
    usersByRole,
    isLoading,
    hasError,
    errorMessage,
    totalUsers,
    
    // Actions
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setCurrentUser,
    setFilters,
    clearFilters,
    clearError,
    addUser,
    removeUser,
    getUserById,
    toggleUserActive
  }
}) 