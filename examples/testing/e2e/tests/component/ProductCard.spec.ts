import { test, expect } from '@playwright/experimental-ct-vue'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/stores/cart'
import type { HooksConfig } from '../../playwright'

// Демонстраційний товар для тестування
const mockProduct: Product = {
  id: 1,
  name: 'Тестовий ноутбук',
  price: 25000,
  image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhcHRvcDwvdGV4dD48L3N2Zz4=',
  description: 'Потужний ноутбук для роботи та ігор',
  category: 'Електроніка',
  stock: 5
}

const outOfStockProduct: Product = {
  ...mockProduct,
  id: 2,
  name: 'Недоступний товар',
  stock: 0
}

test.describe('ProductCard Component', () => {
  test('displays product information', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      }
    })

    // Перевіряємо що відображається назва товару
    await expect(component.getByTestId('product-title')).toContainText('Тестовий ноутбук')

    // Перевіряємо опис
    await expect(component.getByTestId('product-description')).toContainText('Потужний ноутбук для роботи та ігор')

    // Перевіряємо категорію
    await expect(component.getByTestId('product-category')).toContainText('Електроніка')

    // Перевіряємо ціну
    await expect(component.getByTestId('product-price')).toContainText('25')

    // Перевіряємо кількість в наявності
    await expect(component.getByTestId('product-stock')).toContainText('Залишилось: 5')
  })

  test('displays product image', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      }
    })

    const productImage = component.getByTestId('product-image')
    await expect(productImage).toBeVisible()
    await expect(productImage).toHaveAttribute('alt', 'Тестовий ноутбук')
  })

  test('allows adding product to cart', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      }
    })

    // Перевіряємо що кнопка додавання доступна
    const addButton = component.getByTestId('add-to-cart-button')
    await expect(addButton).toBeVisible()
    await expect(addButton).toBeEnabled()
    await expect(addButton).toContainText('Додати до кошика')

    // Перевіряємо селектор кількості
    const quantitySelect = component.getByTestId('quantity-select')
    await expect(quantitySelect).toBeVisible()
    await expect(quantitySelect).toBeEnabled()
  })

  test('displays out of stock product', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: outOfStockProduct
      }
    })

    // Перевіряємо бейдж "Закінчився"
    await expect(component.getByTestId('out-of-stock-badge')).toBeVisible()
    await expect(component.getByTestId('out-of-stock-badge')).toContainText('Закінчився')

    // Перевіряємо що кнопка недоступна
    const addButton = component.getByTestId('add-to-cart-button')
    await expect(addButton).toBeDisabled()
    await expect(addButton).toContainText('Немає в наявності')

    // Селектор кількості також має бути недоступний
    const quantitySelect = component.getByTestId('quantity-select')
    await expect(quantitySelect).toBeDisabled()
  })

  test('displays low stock warning', async ({ mount }) => {
    const lowStockProduct = { ...mockProduct, stock: 2 }

    const component = await mount(ProductCard, {
      props: {
        product: lowStockProduct
      }
    })

    // Перевіряємо що stock відображається зі спеціальним стилем
    const stockElement = component.getByTestId('product-stock')
    await expect(stockElement).toHaveClass(/stock--low/)
  })

  test('allows selecting product quantity', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      }
    })

    const quantitySelect = component.getByTestId('quantity-select')

    // Вибираємо кількість
    await quantitySelect.selectOption('3')
    await expect(quantitySelect).toHaveValue('3')
  })

  test('formats price in UAH currency', async ({ mount }) => {
    const expensiveProduct = { ...mockProduct, price: 123456.78 }

    const component = await mount(ProductCard, {
      props: {
        product: expensiveProduct
      }
    })

    // Перевіряємо що ціна форматується у валюті України
    const priceElement = component.getByTestId('product-price')
    await expect(priceElement).toContainText('123')
  })

  test('emits events when adding to cart', async ({ mount }) => {
    let emittedProduct: Product | null = null
    let emittedQuantity = 0

    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      },
      on: {
        'addedToCart': (product: Product, quantity: number) => {
          emittedProduct = product
          emittedQuantity = quantity
        }
      }
    })

    // Вибираємо кількість 3
    await component.getByTestId('quantity-select').selectOption('3')

    // Додаємо до кошика
    await component.getByTestId('add-to-cart-button').click()

    // Чекаємо на завершення операції (симульована затримка)
    await expect(component.getByTestId('add-to-cart-button')).toContainText('Додавання...')

    // Через деякий час має з'явитися оригінальний текст
    await expect(component.getByTestId('in-cart-indicator')).toContainText('У кошику: 3')

    // Перевіряємо що події емітувалися правильно
    expect(emittedProduct).toEqual(mockProduct)
    expect(emittedQuantity).toBe(3)
  })

  test('ProductCard component screenshot', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: mockProduct
      }
    })

    // Очікуємо завантаження компонента
    await expect(component.getByTestId('product-title')).toBeVisible()

    // Робимо скріншот компонента
    await expect(component).toHaveScreenshot('product-card-default.png')
  })

  test('ProductCard component out of stock screenshot', async ({ mount }) => {
    const component = await mount(ProductCard, {
      props: {
        product: outOfStockProduct
      }
    })

    // Очікуємо завантаження компонента
    await expect(component.getByTestId('out-of-stock-badge')).toBeVisible()

    // Робимо скріншот компонента у стані "немає на складі"
    await expect(component).toHaveScreenshot('product-card-out-of-stock.png')
  })
}) 