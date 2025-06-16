<template>
  <div id="app" class="app">
    <!-- Navigation -->
    <nav class="navbar" data-testid="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <router-link 
          to="/" 
          class="nav-logo"
          data-testid="nav-logo"
        >
          🛍️ E-Shop
        </router-link>

        <!-- Navigation links -->
        <div class="nav-links">
          <router-link 
            to="/" 
            class="nav-link"
            data-testid="nav-home"
            active-class="nav-link--active"
          >
            Головна
          </router-link>
          
          <router-link 
            to="/products" 
            class="nav-link"
            data-testid="nav-products"
            active-class="nav-link--active"
          >
            Товари
          </router-link>
        </div>

        <!-- User section -->
        <div class="nav-user">
          <!-- Cart button -->
          <button
            @click="toggleCart"
            class="cart-button"
            data-testid="cart-button"
          >
            🛒 
            <span class="cart-count" v-if="cartStore.totalItems > 0">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- User menu -->
          <div v-if="!authStore.isAuthenticated" class="auth-buttons">
            <router-link 
              to="/login" 
              class="login-button"
              data-testid="login-link"
            >
              Увійти
            </router-link>
          </div>

          <div v-else class="user-menu">
            <span 
              class="user-greeting"
              data-testid="user-greeting"
            >
              Привіт, {{ authStore.userName }}!
            </span>
            <button
              @click="logout"
              class="logout-button"
              data-testid="logout-button"
            >
              Вийти
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Cart sidebar -->
    <div 
      class="cart-overlay"
      :class="{ 'cart-overlay--open': isCartOpen }"
      @click="closeCart"
      data-testid="cart-overlay"
    >
      <div 
        class="cart-sidebar"
        @click.stop
        data-testid="cart-sidebar"
      >
        <div class="cart-header">
          <h2>Кошик</h2>
          <button
            @click="closeCart"
            class="close-cart-button"
            data-testid="close-cart-button"
          >
            ×
          </button>
        </div>
        
        <div class="cart-content">
          <ShoppingCart 
            @checkout-completed="handleCheckoutCompleted"
          />
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="loading-overlay"
      data-testid="loading-overlay"
    >
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import ShoppingCart from '@/components/ShoppingCart.vue'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

// State
const isCartOpen = ref(false)
const isLoading = ref(false)

// Methods
const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const closeCart = () => {
  isCartOpen.value = false
}

const logout = async () => {
  isLoading.value = true
  
  try {
    // Симуляція затримки logout API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    authStore.logout()
    await router.push('/')
  } finally {
    isLoading.value = false
  }
}

const handleCheckoutCompleted = (total: number) => {
  console.log('Замовлення оформлено на суму:', total)
  closeCart()
}

// Lifecycle
onMounted(() => {
  // Перевіряємо авторизацію при завантаженні
  authStore.checkAuth()
  
  // Завантажуємо кошик
  cartStore.loadFromStorage()
})

// Expose for testing
defineExpose({
  isCartOpen,
  isLoading,
  toggleCart,
  closeCart,
  logout
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Navigation */
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-logo:hover {
  color: #0056b3;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #e9ecef;
  color: #007bff;
}

.nav-link--active {
  background: #007bff;
  color: white;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cart-button {
  position: relative;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.cart-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.auth-buttons {
  display: flex;
  gap: 0.5rem;
}

.login-button {
  background: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.login-button:hover {
  background: #0056b3;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  color: #495057;
  font-weight: 500;
}

.logout-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.logout-button:hover {
  background: #545b62;
}

/* Main content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 80px);
}

/* Cart sidebar */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.cart-overlay--open {
  opacity: 1;
  visibility: visible;
}

.cart-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 500px;
  background: white;
  transform: translateX(100%);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.cart-overlay--open .cart-sidebar {
  transform: translateX(0);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.cart-header h2 {
  margin: 0;
  color: #333;
}

.close-cart-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.close-cart-button:hover {
  color: #495057;
}

.cart-content {
  flex: 1;
  overflow-y: auto;
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
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
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-user {
    justify-content: center;
  }
  
  .cart-sidebar {
    max-width: 100%;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>

<!-- Global styles -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 