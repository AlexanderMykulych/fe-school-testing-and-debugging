<template>
  <div class="user-profile" data-testid="user-profile">
    <!-- Loading state -->
    <div v-if="userStore.isLoading" class="loading" data-testid="loading">
      <span>Завантаження...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="userStore.hasError" class="error" data-testid="error">
      <p>❌ {{ userStore.errorMessage }}</p>
      <button @click="userStore.clearError()" data-testid="clear-error-btn">
        Очистити помилку
      </button>
    </div>

    <!-- Profile content -->
    <div v-else-if="user" class="profile-content" data-testid="profile-content">
      <div class="profile-header">
        <div class="avatar" data-testid="avatar">
          <img 
            v-if="user.avatar" 
            :src="user.avatar" 
            :alt="`${user.name} avatar`"
          />
          <div v-else class="avatar-placeholder">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
        </div>
        
        <div class="user-info">
          <h2 data-testid="user-name">{{ user.name }}</h2>
          <p class="email" data-testid="user-email">{{ user.email }}</p>
          
          <div class="status-badges">
            <span 
              :class="['status-badge', user.active ? 'active' : 'inactive']"
              data-testid="status-badge"
            >
              {{ user.active ? 'Активний' : 'Неактивний' }}
            </span>
            
            <span 
              :class="['role-badge', `role-${user.role}`]"
              data-testid="role-badge"
            >
              {{ roleLabels[user.role] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions" data-testid="profile-actions">
        <button 
          @click="toggleActive"
          :disabled="userStore.isLoading"
          class="btn btn-secondary"
          data-testid="toggle-active-btn"
        >
          {{ user.active ? 'Деактивувати' : 'Активувати' }}
        </button>
        
        <button 
          @click="editUser"
          :disabled="userStore.isLoading"
          class="btn btn-primary"
          data-testid="edit-user-btn"
        >
          Редагувати
        </button>
        
        <button 
          @click="deleteUser"
          :disabled="userStore.isLoading"
          class="btn btn-danger"
          data-testid="delete-user-btn"
        >
          Видалити
        </button>
      </div>
    </div>

    <!-- No user selected -->
    <div v-else class="no-user" data-testid="no-user">
      <p>Користувач не обраний</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useUserStore, type User } from '../stores/user-store'

// Props
interface Props {
  userId?: number
}

const props = withDefaults(defineProps<Props>(), {
  userId: undefined
})

// Emits
const emit = defineEmits<{
  userDeleted: [userId: number]
  userUpdated: [user: User]
  editRequested: [user: User]
}>()

// Store
const userStore = useUserStore()

// Computed
const user = computed(() => {
  if (props.userId) {
    return userStore.getUserById(props.userId)
  }
  return userStore.currentUser
})

const roleLabels = {
  admin: 'Адміністратор',
  user: 'Користувач',
  moderator: 'Модератор'
}

// Methods
async function toggleActive() {
  if (!user.value) return

  try {
    const updatedUser = await userStore.updateUser(user.value.id, {
      active: !user.value.active
    })
    emit('userUpdated', updatedUser)
  } catch (error) {
    console.error('Failed to toggle user active status:', error)
  }
}

function editUser() {
  if (user.value) {
    emit('editRequested', user.value)
  }
}

async function deleteUser() {
  if (!user.value) return

  if (confirm(`Ви впевнені, що хочете видалити користувача ${user.value.name}?`)) {
    try {
      await userStore.deleteUser(user.value.id)
      emit('userDeleted', user.value.id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #c33;
}

.profile-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 32px;
  font-weight: bold;
  color: #666;
}

.user-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.email {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.status-badges {
  display: flex;
  gap: 8px;
}

.status-badge, .role-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2d5a2d;
}

.status-badge.inactive {
  background: #ffe8e8;
  color: #5a2d2d;
}

.role-badge {
  background: #e8f4fd;
  color: #2d4a5a;
}

.role-badge.role-admin {
  background: #fdf0e8;
  color: #5a3d2d;
}

.profile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.no-user {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}
</style> 