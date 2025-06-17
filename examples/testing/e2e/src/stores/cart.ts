import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  category: string
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
}

/**
 * Store для управління кошиком покупок
 */
export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const totalPrice = computed(() => 
    items.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  )

  const itemsCount = computed(() => items.value.length)

  const isEmpty = computed(() => items.value.length === 0)

  const getItemById = computed(() => (productId: number) =>
    items.value.find(item => item.product.id === productId)
  )

  // Actions
  const addItem = (product: Product, quantity: number = 1) => {
    const existingItem = items.value.find(item => item.product.id === product.id)
    
    if (existingItem) {
      // Збільшуємо кількість існуючого товару
      existingItem.quantity += quantity
    } else {
      // Додаємо новий товар
      items.value.push({
        product,
        quantity
      })
    }
    
    // Зберігаємо в localStorage
    saveToStorage()
  }

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(item => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
      saveToStorage()
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
        saveToStorage()
      }
    }
  }

  const clearCart = () => {
    items.value = []
    saveToStorage()
  }

  const saveToStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  const loadFromStorage = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        items.value = JSON.parse(savedCart)
      } catch (err) {
        console.error('Помилка завантаження кошика:', err)
        localStorage.removeItem('cart')
      }
    }
  }

  const checkout = async (): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // Симуляція оформлення замовлення
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Очищуємо кошик після успішного оформлення
      clearCart()
      return true
    } catch (err) {
      console.error('Помилка оформлення замовлення:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Демонстраційні товари
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: 'Ноутбук MacBook Pro',
      price: 50000,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hY0Jvb2s8L3RleHQ+PC9zdmc+',
      description: 'Потужний ноутбук для професіоналів',
      category: 'Електроніка',
      stock: 5
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      price: 35000,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPmlQaG9uZTwvdGV4dD48L3N2Zz4=',
      description: 'Новітній смартфон від Apple',
      category: 'Електроніка',
      stock: 10
    },
    {
      id: 3,
      name: 'Бездротові навушники',
      price: 3000,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFpclBvZHM8L3RleHQ+PC9zdmc+',
      description: 'Якісний звук без проводів',
      category: 'Аксесуари',
      stock: 15
    },
    {
      id: 4,
      name: 'Механічна клавіатура',
      price: 2500,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktleWJvYXJkPC90ZXh0Pjwvc3ZnPg==',
      description: 'Професійна клавіатура для програмістів',
      category: 'Аксесуари',
      stock: 8
    },
    {
      id: 5,
      name: 'Ігрова миша',
      price: 1200,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vdXNlPC90ZXh0Pjwvc3ZnPg==',
      description: 'Точна миша для геймерів',
      category: 'Аксесуари',
      stock: 20
    },
    {
      id: 6,
      name: 'Монітор 4K',
      price: 12000,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vbml0b3I8L3RleHQ+PC9zdmc+',
      description: 'Високоякісний монітор для роботи',
      category: 'Електроніка',
      stock: 3
    }
  ]

  const getProducts = (): Product[] => {
    return sampleProducts
  }

  const getProductById = (id: number): Product | undefined => {
    return sampleProducts.find(product => product.id === id)
  }

  return {
    // State
    items,
    isLoading,
    
    // Getters
    totalItems,
    totalPrice,
    itemsCount,
    isEmpty,
    getItemById,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadFromStorage,
    checkout,
    getProducts,
    getProductById
  }
}) 