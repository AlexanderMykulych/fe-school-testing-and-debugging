import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Інтерфейс для конфігурації клієнта
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  retries?: number
}

// Базовий HTTP клієнт
export class ApiClient {
  private readonly client: AxiosInstance
  private readonly retries: number

  constructor(config: ApiClientConfig) {
    this.retries = config.retries ?? 3
    
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error(`❌ ${error.response?.status || 'Network Error'} ${error.config?.url}`)
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url)
    return response.data
  }

  async post<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data)
    return response.data
  }

  async put<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data)
    return response.data
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url)
    return response.data
  }

  // Метод з retry логікою
  async getWithRetry<T>(url: string, currentAttempt = 1): Promise<T> {
    try {
      return await this.get<T>(url)
    } catch (error) {
      if (currentAttempt < this.retries) {
        console.log(`🔄 Retry ${currentAttempt}/${this.retries} for ${url}`)
        await this.delay(1000 * currentAttempt) // Експоненційна затримка
        return this.getWithRetry<T>(url, currentAttempt + 1)
      }
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
} 