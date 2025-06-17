import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

/**
 * 🔐 Store для управління авторизацією
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.username || 'Гість')

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // Симуляція API запиту
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Простий mock авторизації
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        user.value = {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          avatar: 'https://via.placeholder.com/64x64'
        }
        
        // Зберігаємо в localStorage
        localStorage.setItem('user', JSON.stringify(user.value))
        return true
      } else if (credentials.username === 'user' && credentials.password === 'user123') {
        user.value = {
          id: 2,
          username: 'user',
          email: 'user@example.com',
          role: 'user',
          avatar: 'https://via.placeholder.com/64x64'
        }
        
        localStorage.setItem('user', JSON.stringify(user.value))
        return true
      } else {
        error.value = 'Невірний логін або пароль'
        return false
      }
    } catch (err) {
      error.value = 'Помилка під час входу в систему'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    error.value = null
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (err) {
        console.error('Помилка парсингу збереженого користувача:', err)
        localStorage.removeItem('user')
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError
  }
}) 