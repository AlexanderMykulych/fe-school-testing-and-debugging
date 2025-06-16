<template>
  <div class="shopping-cart" data-testid="shopping-cart">
    <!-- Cart header -->
    <div class="cart-header">
      <h2 class="cart-title" data-testid="cart-title">
        🛒 Кошик покупок
        <span 
          class="cart-count" 
          :class="{ 'cart-count--hidden': cartStore.isEmpty }"
          data-testid="cart-items-count"
        >
          ({{ cartStore.totalItems }})
        </span>
      </h2>
      
      <button
        v-if="!cartStore.isEmpty"
        @click="clearCart"
        class="clear-cart-button"
        data-testid="clear-cart-button"
      >
        Очистити кошик
      </button>
    </div>

    <!-- Empty cart state -->
    <div 
      v-if="cartStore.isEmpty" 
      class="empty-cart"
      data-testid="empty-cart"
    >
      <div class="empty-cart-icon">🛒</div>
      <h3>Ваш кошик порожній</h3>
      <p>Додайте товари для продовження покупок</p>
      
      <!-- Empty cart total -->
      <div class="empty-cart-total">
        <span>Загальна сума: </span>
        <span 
          class="total-price"
          data-testid="total-price"
        >
          {{ formatPrice(0) }}
        </span>
      </div>
      
      <router-link 
        to="/" 
        class="continue-shopping-link"
        data-testid="continue-shopping-link"
      >
        Почати покупки
      </router-link>
    </div>

    <!-- Cart items -->
    <div v-else class="cart-content">
      <div class="cart-items" data-testid="cart-items-list">
        <div
          v-for="item in cartStore.items"
          :key="item.product.id"
          class="cart-item"
          data-testid="cart-item"
        >
          <!-- Product image -->
          <div class="cart-item__image">
            <img
              :src="item.product.image"
              :alt="item.product.name"
              data-testid="cart-item-image"
            />
          </div>

          <!-- Product info -->
          <div class="cart-item__info">
            <h4 
              class="cart-item__name"
              data-testid="cart-item-name"
            >
              {{ item.product.name }}
            </h4>
            <p 
              class="cart-item__price"
              data-testid="cart-item-price"
            >
              {{ formatPrice(item.product.price) }}
            </p>
            <span 
              class="cart-item__category"
              data-testid="cart-item-category"
            >
              {{ item.product.category }}
            </span>
          </div>

          <!-- Quantity controls -->
          <div class="cart-item__quantity">
            <label class="sr-only">Кількість для {{ item.product.name }}</label>
            <div class="quantity-controls">
              <button
                @click="decreaseQuantity(item.product.id)"
                class="quantity-button quantity-button--decrease"
                data-testid="decrease-quantity"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              
              <input
                :value="item.quantity"
                @input="updateQuantity(item.product.id, $event)"
                class="quantity-input"
                data-testid="quantity-input"
                type="number"
                min="1"
                :max="item.product.stock"
              />
              
              <button
                @click="increaseQuantity(item.product.id)"
                class="quantity-button quantity-button--increase"
                data-testid="increase-quantity"
                :disabled="item.quantity >= item.product.stock"
              >
                +
              </button>
            </div>
            
            <div 
              class="cart-item__subtotal"
              data-testid="cart-item-subtotal"
            >
              {{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>

          <!-- Remove button -->
          <button
            @click="removeItem(item.product.id)"
            class="remove-item-button"
            data-testid="remove-item-button"
            :aria-label="`Видалити ${item.product.name} з кошика`"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Cart summary -->
      <div class="cart-summary" data-testid="cart-summary">
        <div class="summary-row">
          <span>Кількість товарів:</span>
          <span data-testid="total-items">{{ cartStore.totalItems }}</span>
        </div>
        
        <div class="summary-row">
          <span>Різних товарів:</span>
          <span data-testid="unique-items">{{ cartStore.itemsCount }}</span>
        </div>
        
        <div class="summary-row summary-row--total">
          <span>Загальна сума:</span>
          <span 
            class="total-price"
            data-testid="total-price"
          >
            {{ formatPrice(cartStore.totalPrice) }}
          </span>
        </div>

        <!-- Checkout button -->
        <button
          @click="checkout"
          class="checkout-button"
          :class="{ 'checkout-button--loading': cartStore.isLoading }"
          :disabled="cartStore.isLoading || cartStore.isEmpty"
          data-testid="checkout-button"
        >
          <span v-if="cartStore.isLoading">Оформлення...</span>
          <span v-else>Оформити замовлення</span>
        </button>
        
        <!-- Loading indicator -->
        <div
          v-if="cartStore.isLoading"
          class="loading-indicator"
          data-testid="loading-indicator"
        >
          <div class="loading-spinner"></div>
          <span>Оформлення замовлення...</span>
        </div>
      </div>
    </div>

    <!-- Success message -->
    <div
      v-if="showSuccessMessage"
      class="success-message"
      data-testid="success-message"
    >
      ✅ Замовлення успішно оформлено!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

// Props & Emits
interface Emits {
  itemRemoved: [productId: number]
  quantityChanged: [productId: number, newQuantity: number]
  cartCleared: []
  checkoutCompleted: [total: number]
}

const emit = defineEmits<Emits>()

// Store
const cartStore = useCartStore()

// State
const showSuccessMessage = ref(false)

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

const increaseQuantity = (productId: number) => {
  const item = cartStore.items.find(item => item.product.id === productId)
  if (item && item.quantity < item.product.stock) {
    const newQuantity = item.quantity + 1
    cartStore.updateQuantity(productId, newQuantity)
    emit('quantityChanged', productId, newQuantity)
  }
}

const decreaseQuantity = (productId: number) => {
  const item = cartStore.items.find(item => item.product.id === productId)
  if (item && item.quantity > 1) {
    const newQuantity = item.quantity - 1
    cartStore.updateQuantity(productId, newQuantity)
    emit('quantityChanged', productId, newQuantity)
  }
}

const updateQuantity = (productId: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const newQuantity = parseInt(target.value)
  
  if (newQuantity && newQuantity > 0) {
    const item = cartStore.items.find(item => item.product.id === productId)
    if (item && newQuantity <= item.product.stock) {
      cartStore.updateQuantity(productId, newQuantity)
      emit('quantityChanged', productId, newQuantity)
    } else {
      // Повертаємо попереднє значення якщо перевищено запас
      target.value = item?.quantity.toString() || '1'
    }
  }
}

const removeItem = (productId: number) => {
  cartStore.removeItem(productId)
  emit('itemRemoved', productId)
}

const clearCart = () => {
  cartStore.clearCart()
  emit('cartCleared')
}

const checkout = async () => {
  const total = cartStore.totalPrice
  const success = await cartStore.checkout()
  
  if (success) {
    showSuccessMessage.value = true
    emit('checkoutCompleted', total)
    
    // Приховуємо повідомлення через 3 секунди
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

// Lifecycle
onMounted(() => {
  // Завантажуємо кошик з localStorage при монтуванні
  cartStore.loadFromStorage()
})

// Expose for testing
defineExpose({
  showSuccessMessage,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  removeItem,
  clearCart,
  checkout
})
</script>

<style scoped>
.shopping-cart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.cart-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-count {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.cart-count--hidden {
  opacity: 0.5;
}

.clear-cart-button {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.clear-cart-button:hover {
  background: #c82333;
}

.empty-cart {
  text-align: center;
  padding: 3rem 1.5rem;
  color: #6c757d;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-cart h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.empty-cart p {
  margin: 0;
  font-size: 0.9rem;
}

.empty-cart-total {
  margin: 1rem 0;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #495057;
}

.empty-cart-total .total-price {
  color: #007bff;
  font-weight: 600;
}

.continue-shopping-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s;
}

.continue-shopping-link:hover {
  background: #0056b3;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
}

.cart-item__image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__info {
  flex: 1;
  min-width: 0;
}

.cart-item__name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.cart-item__price {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #007bff;
  font-weight: 500;
}

.cart-item__category {
  background: #e9ecef;
  color: #495057;
  padding: 0.125rem 0.375rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 500;
}

.cart-item__quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  color: #495057;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.quantity-button:hover:not(:disabled) {
  background: #e9ecef;
}

.quantity-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 50px;
  height: 32px;
  border: none;
  text-align: center;
  font-weight: 500;
  color: #333;
}

.quantity-input:focus {
  outline: none;
  background: #fff3cd;
}

.cart-item__subtotal {
  font-weight: 600;
  color: #007bff;
  font-size: 0.9rem;
}

.remove-item-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background 0.2s;
}

.remove-item-button:hover {
  background: #c82333;
}

.cart-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.summary-row--total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #dee2e6;
  font-size: 1.1rem;
  font-weight: 600;
}

.total-price {
  color: #007bff;
  font-size: 1.25rem;
}

.checkout-button {
  width: 100%;
  padding: 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.checkout-button:hover:not(:disabled) {
  background: #218838;
}

.checkout-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.checkout-button--loading {
  background: #6c757d;
}

.success-message {
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .cart-item__quantity {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .remove-item-button {
    position: relative;
    top: auto;
    right: auto;
    align-self: flex-end;
  }
}
</style> 