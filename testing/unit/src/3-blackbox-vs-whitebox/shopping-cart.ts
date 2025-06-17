// Система покупкового кошика для демонстрації різних підходів до тестування

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DiscountService {
  calculateDiscount(totalAmount: number, customerId: string): Promise<number>;
}

export interface TaxService {
  calculateTax(amount: number, location: string): number;
}

export interface NotificationService {
  sendOrderConfirmation(customerId: string, orderId: string): Promise<void>;
}

export class ShoppingCart {
  private items: CartItem[] = [];

  constructor(
    private discountService: DiscountService,
    private taxService: TaxService,
    private notificationService: NotificationService
  ) {}

  addItem(product: Product, quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }

  removeItem(productId: string): void {
    this.items = this.items.filter(item => item.product.id !== productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
    }
  }

  getItems(): CartItem[] {
    return [...this.items]; // Повертаємо копію для інкапсуляції
  }

  getSubtotal(): number {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  async checkout(customerId: string, location: string): Promise<CheckoutResult> {
    if (this.isEmpty()) {
      throw new Error('Cannot checkout empty cart');
    }

    const subtotal = this.getSubtotal();
    const discount = await this.discountService.calculateDiscount(subtotal, customerId);
    const discountedAmount = subtotal - discount;
    const tax = this.taxService.calculateTax(discountedAmount, location);
    const total = discountedAmount + tax;

    const orderId = this.generateOrderId();

    // Очищаємо кошик після успішного оформлення
    this.clear();

    // Відправляємо підтвердження (fire-and-forget)
    this.notificationService.sendOrderConfirmation(customerId, orderId)
      .catch(error => {
        console.error('Failed to send order confirmation:', error);
      });

    return {
      orderId,
      subtotal,
      discount,
      tax,
      total,
      itemCount: this.getItemCount()
    };
  }

  public generateOrderId(): string {
    return `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export interface CheckoutResult {
  orderId: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemCount: number;
} 