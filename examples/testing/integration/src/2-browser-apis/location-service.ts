// Типи для роботи з геолокацією
export interface Position {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export interface LocationOptions {
  timeout?: number
  maximumAge?: number
  enableHighAccuracy?: boolean
}

export interface LocationError {
  code: number
  message: string
}

// Сервіс для роботи з Geolocation API
export class LocationService {
  private readonly geolocation: Geolocation

  constructor(geolocation = navigator.geolocation) {
    this.geolocation = geolocation
  }

  /**
   * Перевірити чи доступна геолокація
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator && !!this.geolocation
  }

  /**
   * Отримати поточну позицію користувача
   */
  async getCurrentPosition(options: LocationOptions = {}): Promise<Position> {
    if (!this.isGeolocationSupported()) {
      throw new Error('Geolocation не підтримується цим браузером')
    }

    const defaultOptions: PositionOptions = {
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 60000,
      enableHighAccuracy: options.enableHighAccuracy ?? false
    }

    return new Promise<Position>((resolve, reject) => {
      this.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          reject(this.createLocationError(error))
        },
        defaultOptions
      )
    })
  }

  /**
   * Отримати позицію з високою точністю
   */
  async getHighAccuracyPosition(): Promise<Position> {
    return this.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    })
  }

  /**
   * Отримати позицію швидко (менша точність)
   */
  async getQuickPosition(): Promise<Position> {
    return this.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000 // 5 хвилин
    })
  }

  /**
   * Спостерігати за змінами позиції
   */
  watchPosition(
    onSuccess: (position: Position) => void,
    onError: (error: LocationError) => void,
    options: LocationOptions = {}
  ): number {
    if (!this.isGeolocationSupported()) {
      onError({
        code: -1,
        message: 'Geolocation не підтримується цим браузером'
      })
      return -1
    }

    const defaultOptions: PositionOptions = {
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 60000,
      enableHighAccuracy: options.enableHighAccuracy ?? false
    }

    return this.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        onError(this.createLocationError(error))
      },
      defaultOptions
    )
  }

  /**
   * Зупинити спостереження за позицією
   */
  clearWatch(watchId: number): void {
    if (this.isGeolocationSupported()) {
      this.geolocation.clearWatch(watchId)
    }
  }

  /**
   * Обчислити відстань між двома точками (в метрах)
   */
  calculateDistance(pos1: Position, pos2: Position): number {
    const R = 6371e3 // Радіус Землі в метрах
    const φ1 = (pos1.latitude * Math.PI) / 180
    const φ2 = (pos2.latitude * Math.PI) / 180
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * Перевірити чи користувач знаходиться в межах певної області
   */
  isWithinArea(
    userPosition: Position,
    centerPosition: Position,
    radiusInMeters: number
  ): boolean {
    const distance = this.calculateDistance(userPosition, centerPosition)
    return distance <= radiusInMeters
  }

  /**
   * Отримати назву помилки геолокації
   */
  private createLocationError(error: GeolocationPositionError): LocationError {
    let message: string

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Користувач заборонив доступ до геолокації'
        break
      case error.POSITION_UNAVAILABLE:
        message = 'Інформація про місцезнаходження недоступна'
        break
      case error.TIMEOUT:
        message = 'Час очікування геолокації вичерпано'
        break
      default:
        message = 'Невідома помилка геолокації'
        break
    }

    return {
      code: error.code,
      message
    }
  }
} 