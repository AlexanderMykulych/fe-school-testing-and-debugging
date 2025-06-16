import { ApiClient } from './api-client'

// Типи для роботи з користувачами
export interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export interface CreateUserRequest {
  name: string
  email: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  active?: boolean
}

// Repository для роботи з користувачами
export class UserRepository {
  constructor(private readonly apiClient: ApiClient) {}

  /**
   * Отримати всіх користувачів
   */
  async getAllUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>('/api/users')
  }

  /**
   * Отримати користувача за ID
   */
  async getUserById(id: number): Promise<User> {
    return this.apiClient.get<User>(`/api/users/${id}`)
  }

  /**
   * Створити нового користувача
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    return this.apiClient.post<User, CreateUserRequest>('/api/users', userData)
  }

  /**
   * Оновити користувача
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    return this.apiClient.put<User, UpdateUserRequest>(`/api/users/${id}`, userData)
  }

  /**
   * Видалити користувача
   */
  async deleteUser(id: number): Promise<void> {
    await this.apiClient.delete<void>(`/api/users/${id}`)
  }

  /**
   * Отримати активних користувачів
   */
  async getActiveUsers(): Promise<User[]> {
    const allUsers = await this.getAllUsers()
    return allUsers.filter(user => user.active)
  }

  /**
   * Пошук користувачів за ім'ям
   */
  async searchUsersByName(name: string): Promise<User[]> {
    const allUsers = await this.getAllUsers()
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    )
  }

  /**
   * Перевірити чи користувач існує
   */
  async userExists(id: number): Promise<boolean> {
    try {
      await this.getUserById(id)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Отримати користувача з повтором при помилці
   */
  async getUserByIdWithRetry(id: number): Promise<User> {
    return this.apiClient.getWithRetry<User>(`/api/users/${id}`)
  }
} 