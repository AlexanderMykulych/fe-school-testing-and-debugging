import { test, expect } from '@playwright/test'

test.describe('📸 E2E Скріншоти', () => {
  test('Скріншот головної сторінки з товарами', async ({ page }) => {
    // Переходимо на головну сторінку
    await page.goto('/')

    // Очікуємо завантаження товарів
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    // Очікуємо завантаження заголовка
    await expect(page.locator('h1')).toBeVisible()

    // Робимо скріншот всієї сторінки
    await expect(page).toHaveScreenshot('homepage-with-products.png', {
      fullPage: true
    })
  })

  test('Скріншот сторінки кошика', async ({ page }) => {
    // Переходимо на головну сторінку
    await page.goto('/')

    // Очікуємо завантаження товарів
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    // Додаємо товар до кошика
    await page.locator('[data-testid="add-to-cart-button"]').first().click()

    // Очікуємо завершення додавання
    await expect(page.locator('[data-testid="in-cart-indicator"]').first()).toBeVisible()

    // Переходимо до кошика
    await page.locator('[data-testid="cart-button"]').click()

    // Очікуємо завантаження сторінки кошика
    await expect(page.locator('[data-testid="cart-page"]')).toBeVisible()

    // Робимо скріншот сторінки кошика
    await expect(page).toHaveScreenshot('cart-page-with-items.png', {
      fullPage: true
    })
  })

  test('Скріншот мобільної версії головної сторінки', async ({ page }) => {
    // Встановлюємо мобільний viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Переходимо на головну сторінку
    await page.goto('/')

    // Очікуємо завантаження товарів
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    // Робимо скріншот мобільної версії
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    })
  })

  test('Скріншот модального вікна деталей товару', async ({ page }) => {
    // Переходимо на головну сторінку
    await page.goto('/')

    // Очікуємо завантаження товарів
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible()

    // Клікаємо на товар щоб відкрити деталі
    await page.locator('[data-testid="product-title"]').first().click()

    // Очікуємо відкриття модального вікна (якщо воно є)
    const modal = page.locator('[data-testid="product-modal"]')
    if (await modal.isVisible()) {
      // Робимо скріншот модального вікна
      await expect(modal).toHaveScreenshot('product-modal.png')
    } else {
      // Якщо модальне вікно не відкривається, робимо скріншот сторінки деталей
      await expect(page).toHaveScreenshot('product-details-page.png', {
        fullPage: true
      })
    }
  })
}) 