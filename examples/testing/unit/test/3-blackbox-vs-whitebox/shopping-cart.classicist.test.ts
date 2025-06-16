import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ShoppingCart, 
  Product, 
  DiscountService, 
  TaxService, 
  NotificationService 
} from '../../src/3-blackbox-vs-whitebox/shopping-cart.js';

/**
 * КЛАСИЦИСТСЬКИЙ ПІДХІД (Blackbox Testing)
 * - Фокус на результаті роботи системи
 * - Використання реальних реалізацій або простих стабів
 * - Тестування стану, а не поведінки
 * - Мінімальне знання внутрішньої реалізації
 */

// Реальні (прості) реалізації сервісів
class SimpleDiscountService implements DiscountService {
  async calculateDiscount(totalAmount: number, customerId: string): Promise<number> {
    // Простий алгоритм знижок
    if (customerId.includes('vip')) return totalAmount * 0.1; // 10% для VIP
    if (totalAmount > 500) return 50; // Фіксована знижка для великих покупок
    return 0;
  }
}

class SimpleTaxService implements TaxService {
  calculateTax(amount: number, location: string): number {
    // Прості податкові ставки
    const taxRates: { [key: string]: number } = {
      'US': 0.08,
      'CA': 0.12,
      'EU': 0.20
    };
    return amount * (taxRates[location] || 0.05);
  }
}

class SimpleNotificationService implements NotificationService {
  private sentNotifications: Array<{ customerId: string; orderId: string }> = [];

  async sendOrderConfirmation(customerId: string, orderId: string): Promise<void> {
    // Просто зберігаємо для перевірки
    this.sentNotifications.push({ customerId, orderId });
  }

  // Допоміжний метод для тестів
  getSentNotifications() {
    return [...this.sentNotifications];
  }

  clearNotifications() {
    this.sentNotifications = [];
  }
}

describe('ShoppingCart - Classicist Style (Blackbox)', () => {
  let cart: ShoppingCart;
  let discountService: SimpleDiscountService;
  let taxService: SimpleTaxService;
  let notificationService: SimpleNotificationService;

  const products = {
    laptop: { id: 'laptop-1', name: 'Gaming Laptop', price: 1200 },
    mouse: { id: 'mouse-1', name: 'Wireless Mouse', price: 50 },
    keyboard: { id: 'keyboard-1', name: 'Mechanical Keyboard', price: 150 }
  };

  beforeEach(() => {
    // Використовуємо реальні реалізації
    discountService = new SimpleDiscountService();
    taxService = new SimpleTaxService();
    notificationService = new SimpleNotificationService();
    
    cart = new ShoppingCart(discountService, taxService, notificationService);
    notificationService.clearNotifications();
  });

  describe('Basic Cart Operations', () => {
    it('should start empty', () => {
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getItemCount()).toBe(0);
      expect(cart.getSubtotal()).toBe(0);
    });

    it('should add items to cart', () => {
      cart.addItem(products.laptop, 1);
      cart.addItem(products.mouse, 2);

      expect(cart.isEmpty()).toBe(false);
      expect(cart.getItemCount()).toBe(3); // 1 laptop + 2 mice
      expect(cart.getSubtotal()).toBe(1300); // 1200 + (50 * 2)

      const items = cart.getItems();
      expect(items).toHaveLength(2);
      expect(items[0].product).toEqual(products.laptop);
      expect(items[0].quantity).toBe(1);
      expect(items[1].product).toEqual(products.mouse);
      expect(items[1].quantity).toBe(2);
    });

    it('should update quantity when adding existing item', () => {
      cart.addItem(products.laptop, 1);
      cart.addItem(products.laptop, 1);

      expect(cart.getItemCount()).toBe(2);
      expect(cart.getSubtotal()).toBe(2400);

      const items = cart.getItems();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('should remove items from cart', () => {
      cart.addItem(products.laptop, 1);
      cart.addItem(products.mouse, 2);

      cart.removeItem('laptop-1');

      expect(cart.getItemCount()).toBe(2);
      expect(cart.getSubtotal()).toBe(100);
      expect(cart.getItems()).toHaveLength(1);
    });

    it('should update item quantities', () => {
      cart.addItem(products.mouse, 2);

      cart.updateQuantity('mouse-1', 5);

      expect(cart.getItemCount()).toBe(5);
      expect(cart.getSubtotal()).toBe(250);
    });

    it('should remove item when quantity updated to zero or negative', () => {
      cart.addItem(products.mouse, 2);

      cart.updateQuantity('mouse-1', 0);

      expect(cart.isEmpty()).toBe(true);
    });
  });

  describe('Checkout Process', () => {
    it('should calculate total with discount and tax for regular customer', async () => {
      // Arrange
      cart.addItem(products.laptop, 1); // $1200
      cart.addItem(products.mouse, 1);  // $50
      // Subtotal: $1250

      // Act
      const result = await cart.checkout('customer-123', 'US');

      // Assert - Фокус на результаті
      expect(result.subtotal).toBe(1250);
      expect(result.discount).toBe(50); // Знижка для покупки > $500
      expect(result.tax).toBe(96); // (1250 - 50) * 0.08
      expect(result.total).toBe(1296); // 1250 - 50 + 96
      expect(result.orderId).toMatch(/^ORDER-\d+-[a-z0-9]+$/);
    });

    it('should apply VIP discount', async () => {
      // Arrange
      cart.addItem(products.laptop, 1); // $1200

      // Act
      const result = await cart.checkout('vip-customer-456', 'EU');

      // Assert
      expect(result.subtotal).toBe(1200);
      expect(result.discount).toBe(120); // 10% VIP знижка
      expect(result.tax).toBe(216); // (1200 - 120) * 0.20
      expect(result.total).toBe(1296); // 1200 - 120 + 216
    });

    it('should handle different tax locations', async () => {
      // Arrange
      cart.addItem(products.keyboard, 2); // $300

      // Act
      const resultUS = await cart.checkout('customer-1', 'US');
      
      // Reset cart for second test
      cart.addItem(products.keyboard, 2);
      const resultCA = await cart.checkout('customer-2', 'CA');

      // Assert
      expect(resultUS.tax).toBe(24); // 300 * 0.08
      expect(resultCA.tax).toBe(36); // 300 * 0.12
    });

    it('should clear cart after successful checkout', async () => {
      // Arrange
      cart.addItem(products.laptop, 1);
      expect(cart.isEmpty()).toBe(false);

      // Act
      await cart.checkout('customer-123', 'US');

      // Assert - Стан після операції
      expect(cart.isEmpty()).toBe(true);
      expect(cart.getItemCount()).toBe(0);
      expect(cart.getSubtotal()).toBe(0);
    });

    it('should send notification after checkout', async () => {
      // Arrange
      cart.addItem(products.mouse, 1);

      // Act
      const result = await cart.checkout('customer-123', 'US');

      // Assert - Перевіряємо побічний ефект через спостереження стану
      const notifications = notificationService.getSentNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        customerId: 'customer-123',
        orderId: result.orderId
      });
    });

    it('should throw error for empty cart', async () => {
      await expect(cart.checkout('customer-123', 'US'))
        .rejects.toThrow('Cannot checkout empty cart');
    });

    it('should throw error for invalid quantity', () => {
      expect(() => cart.addItem(products.laptop, 0))
        .toThrow('Quantity must be positive');
      
      expect(() => cart.addItem(products.laptop, -1))
        .toThrow('Quantity must be positive');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle full shopping workflow', async () => {
      // Arrange - Складний сценарій покупок
      cart.addItem(products.laptop, 1);
      cart.addItem(products.mouse, 3);
      cart.addItem(products.keyboard, 1);
      
      // Modify cart
      cart.updateQuantity('mouse-1', 2);
      cart.removeItem('keyboard-1');

      // Act
      const result = await cart.checkout('vip-customer-999', 'CA');

      // Assert - Перевіряємо фінальний результат
      const expectedSubtotal = 1200 + (50 * 2); // $1300
      const expectedDiscount = 130; // 10% VIP
      const expectedTax = 140.4; // (1300 - 130) * 0.12
      const expectedTotal = 1310.4; // 1300 - 130 + 140.4

      expect(result.subtotal).toBe(expectedSubtotal);
      expect(result.discount).toBe(expectedDiscount);
      expect(result.tax).toBe(expectedTax);
      expect(result.total).toBe(expectedTotal);

      // Перевіряємо, що кошик очищений
      expect(cart.isEmpty()).toBe(true);

      // Перевіряємо, що відправлено сповіщення
      expect(notificationService.getSentNotifications()).toHaveLength(1);
    });
  });
}); 