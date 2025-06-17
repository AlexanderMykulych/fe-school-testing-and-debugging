// Типи для роботи з нотифікаціями
export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  renotify?: boolean
  requireInteraction?: boolean
  silent?: boolean
  timestamp?: number
  data?: any
}

export type NotificationPermission = 'default' | 'granted' | 'denied'

export interface NotificationResult {
  success: boolean
  notification?: Notification
  error?: string
}

// Сервіс для роботи з Notification API
export class NotificationService {
  private readonly Notification: typeof window.Notification

  constructor(NotificationConstructor = window.Notification) {
    this.Notification = NotificationConstructor
  }

  /**
   * Перевірити чи підтримуються нотифікації
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window && !!this.Notification
  }

  /**
   * Отримати поточний статус дозволу
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied'
    }
    return this.Notification.permission as NotificationPermission
  }

  /**
   * Запросити дозвіл на показ нотифікацій
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) {
      return 'denied'
    }

    if (this.Notification.permission === 'granted') {
      return 'granted'
    }

    if (this.Notification.permission === 'denied') {
      return 'denied'
    }

    try {
      const permission = await this.Notification.requestPermission()
      return permission as NotificationPermission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  /**
   * Показати нотифікацію
   */
  async showNotification(options: NotificationOptions): Promise<NotificationResult> {
    // Перевірити підтримку
    if (!this.isNotificationSupported()) {
      return {
        success: false,
        error: 'Нотифікації не підтримуються цим браузером'
      }
    }

    // Перевірити дозвіл
    const permission = this.getPermissionStatus()
    if (permission !== 'granted') {
      return {
        success: false,
        error: 'Дозвіл на показ нотифікацій не надано'
      }
    }

    try {
      const notification = new this.Notification(options.title, {
        body: options.body,
        icon: options.icon,
        badge: options.badge,
        image: options.image,
        tag: options.tag,
        renotify: options.renotify,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
        timestamp: options.timestamp,
        data: options.data
      })

      return {
        success: true,
        notification
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Помилка при створенні нотифікації'
      }
    }
  }

  /**
   * Показати просту нотифікацію
   */
  async showSimpleNotification(title: string, body?: string): Promise<NotificationResult> {
    return this.showNotification({
      title,
      body
    })
  }

  /**
   * Показати нотифікацію з іконкою
   */
  async showNotificationWithIcon(
    title: string,
    body: string,
    icon: string
  ): Promise<NotificationResult> {
    return this.showNotification({
      title,
      body,
      icon
    })
  }

  /**
   * Показати важливу нотифікацію (потребує взаємодії)
   */
  async showImportantNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<NotificationResult> {
    return this.showNotification({
      title,
      body,
      requireInteraction: true,
      timestamp: Date.now(),
      data
    })
  }

  /**
   * Показати тиху нотифікацію
   */
  async showSilentNotification(
    title: string,
    body: string
  ): Promise<NotificationResult> {
    return this.showNotification({
      title,
      body,
      silent: true
    })
  }

  /**
   * Показати нотифікацію з можливістю оновлення
   */
  async showUpdatableNotification(
    tag: string,
    title: string,
    body: string
  ): Promise<NotificationResult> {
    return this.showNotification({
      title,
      body,
      tag,
      renotify: true
    })
  }

  /**
   * Перевірити чи можна показувати нотифікації
   */
  async canShowNotifications(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      return false
    }

    const permission = this.getPermissionStatus()
    if (permission === 'granted') {
      return true
    }

    if (permission === 'denied') {
      return false
    }

    // Якщо дозвіл не надано, спробувати запросити
    const requestedPermission = await this.requestPermission()
    return requestedPermission === 'granted'
  }

  /**
   * Показати нотифікацію з автоматичним запитом дозволу
   */
  async showNotificationWithPermission(
    options: NotificationOptions
  ): Promise<NotificationResult> {
    const canShow = await this.canShowNotifications()
    
    if (!canShow) {
      return {
        success: false,
        error: 'Не вдалося отримати дозвіл на показ нотифікацій'
      }
    }

    return this.showNotification(options)
  }

  /**
   * Створити нотифікацію з обробниками подій
   */
  async createNotificationWithHandlers(
    options: NotificationOptions,
    handlers: {
      onClick?: () => void
      onShow?: () => void
      onClose?: () => void
      onError?: (error: Event) => void
    }
  ): Promise<NotificationResult> {
    const result = await this.showNotification(options)

    if (result.success && result.notification) {
      const notification = result.notification

      if (handlers.onClick) {
        notification.onclick = handlers.onClick
      }
      if (handlers.onShow) {
        notification.onshow = handlers.onShow
      }
      if (handlers.onClose) {
        notification.onclose = handlers.onClose
      }
      if (handlers.onError) {
        notification.onerror = handlers.onError
      }
    }

    return result
  }
} 