import { test, expect, vi, beforeEach, Mock } from 'vitest';
import { 
  ShoppingCart, 
  Product, 
  DiscountService, 
  TaxService, 
  NotificationService 
} from '../../src/3-blackbox-vs-whitebox/shopping-cart.js';

/**
 * МОКІСТСЬКИЙ ПІДХІД (Whitebox Testing)
 * - Фокус на взаємодії між об'єктами
 * - Використання моків для всіх залежностей
 * - Тестування поведінки, а не стану
 * - Знання внутрішньої реалізації
 */

let cart: ShoppingCart;
let mockDiscountService: DiscountService;
let mockTaxService: TaxService;
let mockNotificationService: NotificationService;

const sampleProduct: Product = {
  id: 'product-1',
  name: 'Test Product',
  price: 100
};

beforeEach(() => {
  // Створюємо моки для всіх залежностей
  mockDiscountService = {
    calculateDiscount: vi.fn()
  };

  mockTaxService = {
    calculateTax: vi.fn()
  };

  mockNotificationService = {
    sendOrderConfirmation: vi.fn()
  };

  cart = new ShoppingCart(
    mockDiscountService,
    mockTaxService,
    mockNotificationService
  );
});

test('should call discount service with correct parameters', async () => {
  // Arrange
  cart.addItem(sampleProduct, 2);
  const customerId = 'customer-123';
  const location = 'US';

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(10);
  (mockTaxService.calculateTax as Mock).mockReturnValue(18);
  (mockNotificationService.sendOrderConfirmation as Mock).mockResolvedValue(undefined);

  // Act
  await cart.checkout(customerId, location);

  // Assert - Фокус на взаємодії
  expect(mockDiscountService.calculateDiscount).toHaveBeenCalledWith(200, customerId);
  expect(mockDiscountService.calculateDiscount).toHaveBeenCalledTimes(1);
});

test('should call tax service with discounted amount', async () => {
  // Arrange
  cart.addItem(sampleProduct, 1);
  const customerId = 'customer-123';
  const location = 'US';

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(20);
  (mockTaxService.calculateTax as Mock).mockReturnValue(8);
  (mockNotificationService.sendOrderConfirmation as Mock).mockResolvedValue(undefined);

  // Act
  await cart.checkout(customerId, location);

  // Assert - Перевіряємо, що tax розраховується від суми після знижки
  expect(mockTaxService.calculateTax).toHaveBeenCalledWith(80, location); // 100 - 20 = 80
  expect(mockTaxService.calculateTax).toHaveBeenCalledTimes(1);
});

test('should call notification service after successful checkout', async () => {
  // Arrange  
  cart.addItem(sampleProduct, 1);
  const customerId = 'customer-123';
  const location = 'US';

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(0);
  (mockTaxService.calculateTax as Mock).mockReturnValue(10);
  (mockNotificationService.sendOrderConfirmation as Mock).mockResolvedValue(undefined);

  // Act
  const result = await cart.checkout(customerId, location);

  // Assert - Перевіряємо взаємодію з notification service
  expect(mockNotificationService.sendOrderConfirmation).toHaveBeenCalledWith(
    customerId,
    result.orderId
  );
  expect(mockNotificationService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
});

test('should handle notification service errors gracefully', async () => {
  // Arrange
  cart.addItem(sampleProduct, 1);
  const customerId = 'customer-123';
  const location = 'US';

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(0);
  (mockTaxService.calculateTax as Mock).mockReturnValue(10);
  (mockNotificationService.sendOrderConfirmation as Mock).mockRejectedValue(
    new Error('Email service down')
  );

  // Мокаємо console.error, щоб перевірити обробку помилки
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

  // Act
  const result = await cart.checkout(customerId, location);

  // Assert - Checkout все ще має бути успішним, навіть якщо notification падає
  expect(result).toBeDefined();
  expect(result.orderId).toBeDefined();

  // Використовуємо setTimeout для перевірки асинхронної обробки помилки
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(consoleSpy).toHaveBeenCalledWith(
    'Failed to send order confirmation:',
    expect.any(Error)
  );

  consoleSpy.mockRestore();
});

test('should not call services when cart is empty', async () => {
  // Arrange - порожній кошик
  const customerId = 'customer-123';
  const location = 'US';

  // Act & Assert
  await expect(cart.checkout(customerId, location))
    .rejects.toThrow('Cannot checkout empty cart');

  // Перевіряємо, що жодний сервіс не викликався
  expect(mockDiscountService.calculateDiscount).not.toHaveBeenCalled();
  expect(mockTaxService.calculateTax).not.toHaveBeenCalled();
  expect(mockNotificationService.sendOrderConfirmation).not.toHaveBeenCalled();
});

test('should clear cart after successful checkout', async () => {
  // Arrange
  cart.addItem(sampleProduct, 2);
  expect(cart.isEmpty()).toBe(false);

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(10);
  (mockTaxService.calculateTax as Mock).mockReturnValue(18);
  (mockNotificationService.sendOrderConfirmation as Mock).mockResolvedValue(undefined);

  // Act
  await cart.checkout('customer-123', 'US');

  // Assert - Перевіряємо стан після операції (whitebox знання)
  expect(cart.isEmpty()).toBe(true);
  expect(cart.getItems()).toHaveLength(0);
});


test('should use spyOn for generateOrderId (whitebox: internal method spy)', async () => {
  cart.addItem(sampleProduct, 1);
  const customerId = 'customer-123';
  const location = 'US';

  (mockDiscountService.calculateDiscount as Mock).mockResolvedValue(0);
  (mockTaxService.calculateTax as Mock).mockReturnValue(10);
  (mockNotificationService.sendOrderConfirmation as Mock).mockResolvedValue(undefined);

  const fakeOrderId = 'ORDER-SPY-456';
  // spyOn прототипу ShoppingCart
  const spy = vi.spyOn(cart, 'generateOrderId').mockReturnValue(fakeOrderId);

  const result = await cart.checkout(customerId, location);

  expect(result.orderId).toBe(fakeOrderId);
  expect(mockNotificationService.sendOrderConfirmation).toHaveBeenCalledWith(
    customerId,
    fakeOrderId
  );
  expect(spy).toHaveBeenCalledTimes(1);

  spy.mockRestore();
}); 