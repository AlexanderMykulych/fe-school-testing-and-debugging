<template>
  <div 
    class="product-card"
    :class="{ 'product-card--out-of-stock': isOutOfStock }"
    data-testid="product-card"
  >
    <!-- Product image -->
    <div class="product-card__image-wrapper">
      <img
        :src="product.image"
        :alt="product.name"
        class="product-card__image"
        data-testid="product-image"
        @error="handleImageError"
      />
      <div 
        v-if="isOutOfStock" 
        class="product-card__out-of-stock-badge"
        data-testid="out-of-stock-badge"
      >
        Закінчився
      </div>
    </div>

    <!-- Product info -->
    <div class="product-card__content">
      <h3 
        class="product-card__title"
        data-testid="product-title"
      >
        {{ product.name }}
      </h3>
      
      <p 
        class="product-card__description"
        data-testid="product-description"
      >
        {{ product.description }}
      </p>
      
      <div class="product-card__meta">
        <span 
          class="product-card__category"
          data-testid="product-category"
        >
          {{ product.category }}
        </span>
        <span 
          class="product-card__stock"
          :class="{ 'product-card__stock--low': isLowStock }"
          data-testid="product-stock"
        >
          Залишилось: {{ product.stock }}
        </span>
      </div>

      <div class="product-card__price-section">
        <span 
          class="product-card__price"
          data-testid="product-price"
        >
          {{ formatPrice(product.price) }}
        </span>
      </div>

      <!-- Add to cart section -->
      <div class="product-card__actions">
        <div 
          v-if="!isInCart" 
          class="product-card__quantity-selector"
        >
          <label for="quantity" class="sr-only">Кількість</label>
          <select
            id="quantity"
            v-model="selectedQuantity"
            class="quantity-select"
            data-testid="quantity-select"
            :disabled="isOutOfStock"
          >
            <option 
              v-for="num in availableQuantities" 
              :key="num" 
              :value="num"
            >
              {{ num }}
            </option>
          </select>
        </div>

        <button
          v-if="!isInCart"
          @click="addToCart"
          class="product-card__add-button"
          :class="{ 'product-card__add-button--loading': isAdding }"
          :disabled="isOutOfStock || isAdding"
          data-testid="add-to-cart-button"
        >
          <span v-if="isAdding">Додавання...</span>
          <span v-else>{{ addButtonText }}</span>
        </button>

        <div 
          v-else 
          class="product-card__in-cart"
          data-testid="in-cart-indicator"
        >
          <span class="in-cart-text">У кошику: {{ cartQuantity }}</span>
          <div class="in-cart-actions">
            <button
              @click="increaseQuantity"
              class="quantity-button"
              data-testid="increase-quantity"
              :disabled="cartQuantity >= product.stock"
            >
              +
            </button>
            <button
              @click="decreaseQuantity"
              class="quantity-button"
              data-testid="decrease-quantity"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/stores/cart'

// Props
interface Props {
  product: Product
}

const props = defineProps<Props>()

// Emits
interface Emits {
  addedToCart: [product: Product, quantity: number]
  quantityChanged: [product: Product, newQuantity: number]
}

const emit = defineEmits<Emits>()

// Store
const cartStore = useCartStore()

// State
const selectedQuantity = ref(1)
const isAdding = ref(false)
const imageError = ref(false)

// Computed
const isOutOfStock = computed(() => props.product.stock === 0)
const isLowStock = computed(() => props.product.stock <= 3 && props.product.stock > 0)

const availableQuantities = computed(() => {
  const max = Math.min(props.product.stock, 10) // Максимум 10 штук
  return Array.from({ length: max }, (_, i) => i + 1)
})

const cartItem = computed(() => 
  cartStore.getItemById.value(props.product.id)
)

const isInCart = computed(() => !!cartItem.value)
const cartQuantity = computed(() => cartItem.value?.quantity || 0)

const addButtonText = computed(() => {
  if (isOutOfStock.value) return 'Немає в наявності'
  return 'Додати до кошика'
})

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH'
  }).format(price)
}

const handleImageError = () => {
  imageError.value = true
  // Можна встановити placeholder зображення
}

const addToCart = async () => {
  if (isOutOfStock.value || isAdding.value) return

  isAdding.value = true
  
  try {
    // Симуляція затримки API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    cartStore.addItem(props.product, selectedQuantity.value)
    emit('addedToCart', props.product, selectedQuantity.value)
    
    // Reset quantity selector
    selectedQuantity.value = 1
  } catch (error) {
    console.error('Помилка додавання до кошика:', error)
  } finally {
    isAdding.value = false
  }
}

const increaseQuantity = () => {
  if (cartQuantity.value < props.product.stock) {
    const newQuantity = cartQuantity.value + 1
    cartStore.updateQuantity(props.product.id, newQuantity)
    emit('quantityChanged', props.product, newQuantity)
  }
}

const decreaseQuantity = () => {
  const newQuantity = cartQuantity.value - 1
  if (newQuantity > 0) {
    cartStore.updateQuantity(props.product.id, newQuantity)
    emit('quantityChanged', props.product, newQuantity)
  } else {
    cartStore.removeItem(props.product.id)
    emit('quantityChanged', props.product, 0)
  }
}

// Watch for product changes
watch(() => props.product.stock, (newStock) => {
  if (selectedQuantity.value > newStock) {
    selectedQuantity.value = Math.max(1, newStock)
  }
})

// Expose for testing
defineExpose({
  selectedQuantity,
  isAdding,
  isInCart,
  cartQuantity,
  addToCart,
  increaseQuantity,
  decreaseQuantity
})
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-card--out-of-stock {
  opacity: 0.7;
}

.product-card__image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.product-card:hover .product-card__image {
  transform: scale(1.05);
}

.product-card__out-of-stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-card__content {
  padding: 1.5rem;
}

.product-card__title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.product-card__description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
}

.product-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.product-card__category {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-card__stock {
  font-size: 0.8rem;
  color: #28a745;
  font-weight: 500;
}

.product-card__stock--low {
  color: #ffc107;
}

.product-card__price-section {
  margin-bottom: 1.5rem;
}

.product-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
}

.product-card__actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.product-card__quantity-selector {
  flex-shrink: 0;
}

.quantity-select {
  padding: 0.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.quantity-select:focus {
  outline: none;
  border-color: #007bff;
}

.product-card__add-button {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.product-card__add-button:hover:not(:disabled) {
  background: #0056b3;
}

.product-card__add-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.product-card__add-button--loading {
  background: #6c757d;
}

.product-card__in-cart {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
}

.in-cart-text {
  font-size: 0.9rem;
  color: #155724;
  font-weight: 500;
}

.in-cart-actions {
  display: flex;
  gap: 0.25rem;
}

.quantity-button {
  width: 28px;
  height: 28px;
  border: 1px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.quantity-button:hover:not(:disabled) {
  background: #28a745;
  color: white;
}

.quantity-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style> 