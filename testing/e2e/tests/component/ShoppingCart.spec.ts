import { test, expect } from '@playwright/experimental-ct-vue'
import ShoppingCart from '@/components/ShoppingCart.vue'
import type { Product } from '@/stores/cart'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop',
    price: 1000,
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhcHRvcDwvdGV4dD48L3N2Zz4=',
    description: 'Laptop',
    category: 'Electronics',
    stock: 10
  },
  {
    id: 2,
    name: 'Mouse',
    price: 25,
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vdXNlPC90ZXh0Pjwvc3ZnPg==',
    description: 'Mouse',
    category: 'Electronics',
    stock: 5
  }
]

const cartItems = [
  { product: mockProducts[0], quantity: 2 },
  { product: mockProducts[1], quantity: 1 }
]

test('displays cart items correctly', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Перевіряємо що відображаються всі товари
  await expect(component.getByTestId('cart-item')).toHaveCount(2)

  // Перевіряємо перший товар
  const firstItem = component.getByTestId('cart-item').first()
  await expect(firstItem.getByTestId('item-name')).toContainText('Laptop')
  await expect(firstItem.getByTestId('item-quantity')).toContainText('2')
  await expect(firstItem.getByTestId('item-price')).toContainText('$1,000')

  // Перевіряємо другий товар
  const secondItem = component.getByTestId('cart-item').nth(1)
  await expect(secondItem.getByTestId('item-name')).toContainText('Mouse')
  await expect(secondItem.getByTestId('item-quantity')).toContainText('1')
  await expect(secondItem.getByTestId('item-price')).toContainText('$25')
})

test('displays correct total price', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Перевіряємо загальну суму (1000 * 2 + 25 * 1 = 2025)
  await expect(component.getByTestId('cart-total')).toContainText('$2,025')
})

test('shows empty cart message when no items', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: []
    }
  })

  // Перевіряємо повідомлення про порожній кошик
  await expect(component.getByTestId('empty-cart-message')).toBeVisible()
  await expect(component.getByTestId('empty-cart-message')).toContainText('Your cart is empty')

  // Перевіряємо що загальна сума не відображається
  await expect(component.getByTestId('cart-total')).not.toBeVisible()
})

test('allows removing items from cart', async ({ mount }) => {
  let removedItemId: number | null = null

  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    },
    on: {
      'remove-item': (itemId: number) => {
        removedItemId = itemId
      }
    }
  })

  // Видаляємо перший товар
  await component.getByTestId('remove-button').first().click()

  // Перевіряємо що подія емітувалася з правильним ID
  expect(removedItemId).toBe(1)
})

test('allows updating item quantities', async ({ mount }) => {
  let updatedItem: { id: number; quantity: number } | null = null

  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    },
    on: {
      'update-quantity': (item: { id: number; quantity: number }) => {
        updatedItem = item
      }
    }
  })

  // Змінюємо кількість першого товару
  const quantityInput = component.getByTestId('quantity-input').first()
  await quantityInput.fill('5')

  // Перевіряємо що подія емітувалася з правильними даними
  expect(updatedItem).toEqual({ id: 1, quantity: 5 })
})

test('disables checkout button for empty cart', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: []
    }
  })

  // Перевіряємо що кнопка checkout неактивна
  await expect(component.getByTestId('checkout-button')).toBeDisabled()
})

test('enables checkout button for cart with items', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Перевіряємо що кнопка checkout активна
  await expect(component.getByTestId('checkout-button')).toBeEnabled()
})

test('emits checkout event when button clicked', async ({ mount }) => {
  let checkoutEmitted = false

  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    },
    on: {
      'checkout': () => {
        checkoutEmitted = true
      }
    }
  })

  // Клікаємо на кнопку checkout
  await component.getByTestId('checkout-button').click()

  // Перевіряємо що подія емітувалася
  expect(checkoutEmitted).toBe(true)
})

test('displays item subtotals correctly', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Перевіряємо субтотали для кожного товару
  const firstItemSubtotal = component.getByTestId('cart-item').first().getByTestId('item-subtotal')
  await expect(firstItemSubtotal).toContainText('$2,000') // 1000 * 2

  const secondItemSubtotal = component.getByTestId('cart-item').nth(1).getByTestId('item-subtotal')
  await expect(secondItemSubtotal).toContainText('$25') // 25 * 1
})

test('displays shipping information', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Перевіряємо інформацію про доставку
  await expect(component.getByTestId('shipping-info')).toBeVisible()
  await expect(component.getByTestId('shipping-cost')).toContainText('Free shipping on orders over $50')
})

test('takes visual snapshot of cart', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: cartItems
    }
  })

  // Очікуємо завантаження компонента
  await expect(component.getByTestId('cart-total')).toBeVisible()

  // Робимо скріншот
  await expect(component).toHaveScreenshot('shopping-cart-with-items.png')
})

test('takes visual snapshot of empty cart', async ({ mount }) => {
  const component = await mount(ShoppingCart, {
    props: {
      items: []
    }
  })

  // Очікуємо завантаження компонента
  await expect(component.getByTestId('empty-cart-message')).toBeVisible()

  // Робимо скріншот порожнього кошика
  await expect(component).toHaveScreenshot('shopping-cart-empty.png')
}) 