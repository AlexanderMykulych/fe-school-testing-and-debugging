<template>
  <div class="home-page" data-testid="home-page">
    <!-- Hero section -->
    <section class="hero" data-testid="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Ласкаво просимо до E-Shop!
        </h1>
        <p class="hero-subtitle">
          Найкращі товари за найкращими цінами
        </p>
        <router-link 
          to="/products" 
          class="hero-button"
          data-testid="hero-cta-button"
        >
          Переглянути товари
        </router-link>
      </div>
      <div class="hero-image">
        <div class="hero-emoji"></div>
      </div>
    </section>

    <!-- Stats section -->
    <section class="stats" data-testid="stats-section">
      <div class="stats-grid">
        <div class="stat-card" data-testid="stat-products">
          <div class="stat-number">{{ productCount }}</div>
          <div class="stat-label">Товарів</div>
        </div>
        <div class="stat-card" data-testid="stat-categories">
          <div class="stat-number">{{ categoryCount }}</div>
          <div class="stat-label">Категорій</div>
        </div>
        <div class="stat-card" data-testid="stat-cart">
          <div class="stat-number">{{ cartStore.totalItems }}</div>
          <div class="stat-label">У кошику</div>
        </div>
      </div>
    </section>

    <!-- Featured products -->
    <section class="featured-products" data-testid="featured-section">
      <h2 class="section-title">Популярні товари</h2>
      <div class="products-grid">
        <ProductCard
          v-for="product in featuredProducts"
          :key="product.id"
          :product="product"
          @added-to-cart="handleProductAdded"
        />
      </div>
    </section>

    <!-- User greeting -->
    <section v-if="authStore.isAuthenticated" class="user-section" data-testid="user-section">
      <div class="user-card">
        <h2>Привіт, {{ authStore.userName }}! 👋</h2>
        <p>Дякуємо, що користуєтесь нашим магазином</p>
        <div class="user-stats">
          <div class="user-stat">
            <span class="user-stat-label">Роль:</span>
            <span class="user-stat-value">{{ userRoleText }}</span>
          </div>
          <div class="user-stat">
            <span class="user-stat-label">Товарів у кошику:</span>
            <span class="user-stat-value">{{ cartStore.totalItems }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to action for guests -->
    <section v-else class="guest-cta" data-testid="guest-cta">
      <div class="cta-card">
        <h2>Увійдіть для повного досвіду</h2>
        <p>Авторизуйтесь для збереження кошика та персоналізованих рекомендацій</p>
        <router-link 
          to="/login" 
          class="cta-button"
          data-testid="guest-login-button"
        >
          Увійти в систему
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/stores/cart'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()

// Computed
const featuredProducts = computed(() => {
  // Показуємо перші 3 товари як популярні
  return cartStore.getProducts().slice(0, 3)
})

const productCount = computed(() => cartStore.getProducts().length)

const categoryCount = computed(() => {
  const categories = new Set(cartStore.getProducts().map(p => p.category))
  return categories.size
})

const userRoleText = computed(() => {
  if (!authStore.user) return 'Гість'
  return authStore.user.role === 'admin' ? 'Адміністратор' : 'Користувач'
})

// Methods
const handleProductAdded = (product: Product, quantity: number) => {
  console.log(`Додано ${quantity} шт. товару "${product.name}" до кошика`)
}

// Lifecycle
onMounted(() => {
  // Можна додати аналітику чи інші ініціалізації
  
})

// Expose for testing
defineExpose({
  featuredProducts,
  productCount,
  categoryCount,
  userRoleText,
  handleProductAdded
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero section */
.hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  min-height: 300px;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-button {
  display: inline-block;
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.hero-image {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-emoji {
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Stats section */
.stats {
  margin-bottom: 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

/* Featured products */
.featured-products {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* User section */
.user-section {
  margin-bottom: 4rem;
}

.user-card {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.user-card h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.user-card p {
  margin-bottom: 2rem;
  opacity: 0.9;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.user-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.user-stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.user-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Guest CTA */
.guest-cta {
  margin-bottom: 4rem;
}

.cta-card {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
  color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
}

.cta-card h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.cta-card p {
  margin-bottom: 2rem;
  opacity: 0.9;
  font-size: 1.1rem;
}

.cta-button {
  display: inline-block;
  background: white;
  color: #fd7e14;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive design */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-emoji {
    font-size: 4rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style> 