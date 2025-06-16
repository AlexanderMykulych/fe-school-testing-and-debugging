<template>
  <div class="login-form">
    <h2 class="login-form__title">Вхід в систему</h2>
    
    <form 
      @submit.prevent="handleSubmit" 
      class="login-form__form"
      data-testid="login-form"
    >
      <!-- Username field -->
      <div class="form-group">
        <label for="username" class="form-label">
          Ім'я користувача
        </label>
        <input
          id="username"
          v-model="credentials.username"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.username }"
          data-testid="username-input"
          placeholder="Введіть ім'я користувача"
          autocomplete="username"
          required
        />
        <span 
          v-if="errors.username" 
          class="form-error"
          data-testid="username-error"
        >
          {{ errors.username }}
        </span>
      </div>

      <!-- Password field -->
      <div class="form-group">
        <label for="password" class="form-label">
          Пароль
        </label>
        <input
          id="password"
          v-model="credentials.password"
          type="password"
          class="form-input"
          :class="{ 'form-input--error': errors.password }"
          data-testid="password-input"
          placeholder="Введіть пароль"
          autocomplete="current-password"
          required
        />
        <span 
          v-if="errors.password" 
          class="form-error"
          data-testid="password-error"
        >
          {{ errors.password }}
        </span>
      </div>

      <!-- Server error -->
      <div 
        v-if="authStore.error" 
        class="form-error form-error--server"
        data-testid="server-error"
      >
        {{ authStore.error }}
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        class="form-button"
        :class="{ 'form-button--loading': authStore.isLoading }"
        :disabled="authStore.isLoading || !isFormValid"
        data-testid="submit-button"
      >
        <span v-if="authStore.isLoading">Вхід...</span>
        <span v-else>Увійти</span>
      </button>
    </form>

    <!-- Demo credentials -->
    <div class="login-form__demo">
      <h3>Демо облікові записи:</h3>
      <p><strong>Адміністратор:</strong> admin / admin123</p>
      <p><strong>Користувач:</strong> user / user123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/stores/auth'

// Store
const authStore = useAuthStore()

// Props & Emits
interface Emits {
  loginSuccess: [user: any]
  loginError: [error: string]
}

const emit = defineEmits<Emits>()

// State
const credentials = reactive<LoginCredentials>({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

// Computed
const isFormValid = computed(() => {
  return credentials.username.length >= 3 && 
         credentials.password.length >= 6
})

// Methods
const validateForm = (): boolean => {
  // Clear previous errors
  errors.username = ''
  errors.password = ''

  let isValid = true

  // Username validation
  if (!credentials.username) {
    errors.username = "Ім'я користувача обов'язкове"
    isValid = false
  } else if (credentials.username.length < 3) {
    errors.username = "Ім'я користувача має містити мінімум 3 символи"
    isValid = false
  }

  // Password validation
  if (!credentials.password) {
    errors.password = 'Пароль обов\'язковий'
    isValid = false
  } else if (credentials.password.length < 6) {
    errors.password = 'Пароль має містити мінімум 6 символів'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  authStore.clearError()
  
  const success = await authStore.login(credentials)
  
  if (success) {
    emit('loginSuccess', authStore.user)
    // Reset form
    credentials.username = ''
    credentials.password = ''
  } else {
    emit('loginError', authStore.error || 'Невідома помилка')
  }
}

// Demo functions for testing
const fillAdminCredentials = () => {
  credentials.username = 'admin'
  credentials.password = 'admin123'
}

const fillUserCredentials = () => {
  credentials.username = 'user'
  credentials.password = 'user123'
}

// Expose for testing
defineExpose({
  credentials,
  errors,
  isFormValid,
  validateForm,
  fillAdminCredentials,
  fillUserCredentials
})
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form__title {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.login-form__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-input--error {
  border-color: #dc3545;
}

.form-error {
  margin-top: 0.25rem;
  color: #dc3545;
  font-size: 0.875rem;
}

.form-error--server {
  text-align: center;
  padding: 0.75rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 1rem;
}

.form-button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.form-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.form-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.form-button--loading {
  background-color: #6c757d;
}

.login-form__demo {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
}

.login-form__demo h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.login-form__demo p {
  margin: 0.25rem 0;
  color: #6c757d;
}
</style> 