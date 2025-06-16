<template>
  <div class="products-page" data-testid="products-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">Каталог товарів</h1>
      <p class="page-subtitle">
        Знайдіть ідеальний товар для себе
      </p>
    </div>

    <!-- Filters and search -->
    <div class="filters-section" data-testid="filters-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук товарів..."
          class="search-input"
          data-testid="search-input"
        />
        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-search-button"
          data-testid="clear-search-button"
        >
          ×
        </button>
      </div>

      <div class="filter-controls">
        <!-- Category filter -->
        <select
          v-model="selectedCategory"
          class="filter-select"
          data-testid="category-filter"
        >
          <option value="">Всі категорії</option>
          <option 
            v-for="category in availableCategories" 
            :key="category" 
            :value="category"
          >
            {{ category }}
          </option>
        </select>

        <!-- Sort filter -->
        <select
          v-model="sortBy"
          class="filter-select"
          data-testid="sort-filter"
        >
          <option value="name">За назвою</option>
          <option value="price-asc">За ціною (зростання)</option>
          <option value="price-desc">За ціною (спадання)</option>
          <option value="stock">За наявністю</option>
        </select>

        <!-- Reset filters -->
        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="reset-filters-button"
          data-testid="reset-filters-button"
        >
          Очистити фільтри
        </button>
      </div>
    </div>

    <!-- Results info -->
    <div class="results-info" data-testid="results-info">
      <span class="results-count">
        Знайдено {{ filteredProducts.length }} 
        {{ getProductsText(filteredProducts.length) }}
      </span>
      
      <span v-if="searchQuery" class="search-query">
        за запитом "{{ searchQuery }}"
      </span>
      
      <span v-if="selectedCategory" class="category-filter">
        в категорії "{{ selectedCategory }}"
      </span>
    </div>

    <!-- Products grid -->
    <div class="products-section">
      <div v-if="filteredProducts.length === 0" class="no-products" data-testid="no-products">
        <div class="no-products-icon">😞</div>
        <h3>Товари не знайдено</h3>
        <p>Спробуйте змінити критерії пошуку або фільтри</p>
      </div>

      <div v-else class="products-grid" data-testid="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @added-to-cart="handleProductAdded"
          @quantity-changed="handleQuantityChanged"
        />
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay" data-testid="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Завантаження товарів...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/stores/cart'

// Store
const cartStore = useCartStore()

// State
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('name')
const isLoading = ref(false)

// Computed
const allProducts = computed(() => cartStore.getProducts())

const availableCategories = computed(() => {
  const categories = new Set(allProducts.value.map(p => p.category))
  return Array.from(categories).sort()
})

const filteredProducts = computed(() => {
  let products = [...allProducts.value]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    products = products.filter(product => 
      product.category === selectedCategory.value
    )
  }

  // Sort products
  switch (sortBy.value) {
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'price-asc':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      products.sort((a, b) => b.price - a.price)
      break
    case 'stock':
      products.sort((a, b) => b.stock - a.stock)
      break
  }

  return products
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || sortBy.value !== 'name'
})

// Methods
const clearSearch = () => {
  searchQuery.value = ''
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'name'
}

const getProductsText = (count: number): string => {
  if (count === 1) return 'товар'
  if (count >= 2 && count <= 4) return 'товари'
  return 'товарів'
}

const handleProductAdded = (product: Product, quantity: number) => {
  console.log(`Додано ${quantity} шт. товару "${product.name}" до кошика`)
}

const handleQuantityChanged = (product: Product, newQuantity: number) => {
  console.log(`Змінено кількість товару "${product.name}" на ${newQuantity}`)
}

const simulateLoading = async () => {
  isLoading.value = true
  // Симулюємо завантаження
  await new Promise(resolve => setTimeout(resolve, 800))
  isLoading.value = false
}

// Watch for filter changes to show loading
watch([searchQuery, selectedCategory, sortBy], () => {
  // Можна додати debounce для пошуку
  if (searchQuery.value.length > 2 || !searchQuery.value) {
    // simulateLoading() // Закоментовано для швидкості демо
  }
})

// Lifecycle
onMounted(() => {
  console.log('Сторінка товарів завантажена')
})

// Expose for testing
defineExpose({
  searchQuery,
  selectedCategory,
  sortBy,
  isLoading,
  filteredProducts,
  availableCategories,
  hasActiveFilters,
  clearSearch,
  resetFilters,
  handleProductAdded,
  handleQuantityChanged
})
</script>

<style scoped>
.products-page {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* Page header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.25rem;
  color: #6c757d;
}

/* Filters section */
.filters-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-container {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.clear-search-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: #6c757d;
  color: white;
  border: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.clear-search-button:hover {
  background: #545b62;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
}

.reset-filters-button {
  padding: 0.75rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.reset-filters-button:hover {
  background: #c82333;
}

/* Results info */
.results-info {
  margin-bottom: 2rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.search-query,
.category-filter {
  color: #007bff;
  font-weight: 500;
}

/* Products section */
.products-section {
  margin-bottom: 4rem;
}

.no-products {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-products h3 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .filters-section {
    padding: 1.5rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select,
  .reset-filters-button {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-container {
    max-width: none;
  }
}
</style> 