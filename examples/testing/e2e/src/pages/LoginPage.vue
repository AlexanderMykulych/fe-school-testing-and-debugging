<template>
  <div class="login-page" data-testid="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="page-title">Вхід в систему</h1>
        <p class="page-subtitle">
          Увійдіть в свій акаунт для продовження покупок
        </p>
      </div>

      <LoginForm 
        @loginSuccess="handleLoginSuccess"
        @loginError="handleLoginError"
      />

      <div class="login-footer">
        <p>
          Не маєте акаунту? 
          <span class="demo-note">
            Використовуйте демо облікові записи вище
          </span>
        </p>
      </div>
    </div>

    <!-- Success message -->
    <div 
      v-if="showSuccessMessage"
      class="success-notification"
      data-testid="success-notification"
    >
      ✅ Успішний вхід! Перенаправлення...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import type { User } from '@/stores/auth'

// Router
const router = useRouter()

// State
const showSuccessMessage = ref(false)

// Methods
const handleLoginSuccess = async (user: User) => {
  console.log('Користувач увійшов:', user)
  
  // Показуємо повідомлення про успіх
  showSuccessMessage.value = true
  
  // Затримка для показу повідомлення
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Перенаправляємо на головну сторінку
  await router.push('/')
}

const handleLoginError = (error: string) => {
  console.error('Помилка входу:', error)
  // Помилка вже відображається в формі
}

// Expose for testing
defineExpose({
  showSuccessMessage,
  handleLoginSuccess,
  handleLoginError
})
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 500px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.5;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.demo-note {
  color: #007bff;
  font-weight: 500;
}

.success-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #d4edda;
  color: #155724;
  padding: 1rem 1.5rem;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .success-notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style> 