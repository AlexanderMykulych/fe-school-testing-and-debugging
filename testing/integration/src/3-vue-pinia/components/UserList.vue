<template>
  <div class="user-list" data-testid="user-list">
    <!-- Header with filters -->
    <div class="list-header">
      <h3>Користувачі ({{ userStore.totalUsers }})</h3>
      
      <!-- Filters -->
      <div class="filters" data-testid="filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук за ім'ям або email..."
          class="search-input"
          data-testid="search-input"
        />
        
        <select
          v-model="roleFilter"
          class="filter-select"
          data-testid="role-filter"
        >
          <option value="">Всі ролі</option>
          <option value="admin">Адміністратор</option>
          <option value="moderator">Модератор</option>
          <option value="user">Користувач</option>
        </select>
        
        <select
          v-model="activeFilter"
          class="filter-select"
          data-testid="active-filter"
        >
          <option value="">Всі статуси</option>
          <option value="true">Активні</option>
          <option value="false">Неактивні</option>
        </select>
        
        <button
          @click="clearFilters"
          class="btn btn-secondary"
          data-testid="clear-filters-btn"
        >
          Очистити фільтри
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="userStore.isLoading" class="loading" data-testid="loading">
      <div class="spinner"></div>
      <span>Завантаження користувачів...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="userStore.hasError" class="error" data-testid="error">
      <p>❌ {{ userStore.errorMessage }}</p>
      <button 
        @click="userStore.fetchUsers()"
        class="btn btn-primary"
        data-testid="retry-btn"
      >
        Спробувати знову
      </button>
    </div>

    <!-- User list -->
    <div v-else class="list-content">
      <!-- Empty state -->
      <div 
        v-if="filteredUsers.length === 0" 
        class="empty-state" 
        data-testid="empty-state"
      >
        <p v-if="userStore.totalUsers === 0">
          Користувачів не знайдено
        </p>
        <p v-else>
          За вказаними фільтрами користувачів не знайдено
        </p>
      </div>

      <!-- User cards -->
      <div v-else class="user-cards" data-testid="user-cards">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          :class="['user-card', { 'inactive': !user.active }]"
          :data-testid="`user-card-${user.id}`"
          @click="selectUser(user)"
        >
          <div class="user-avatar">
            <img 
              v-if="user.avatar" 
              :src="user.avatar" 
              :alt="`${user.name} avatar`"
            />
            <div v-else class="avatar-placeholder">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          
          <div class="user-details">
            <h4 :data-testid="`user-name-${user.id}`">{{ user.name }}</h4>
            <p class="user-email" :data-testid="`user-email-${user.id}`">
              {{ user.email }}
            </p>
            
            <div class="user-meta">
              <span 
                :class="['status-badge', user.active ? 'active' : 'inactive']"
                :data-testid="`status-${user.id}`"
              >
                {{ user.active ? 'Активний' : 'Неактивний' }}
              </span>
              
              <span 
                :class="['role-badge', `role-${user.role}`]"
                :data-testid="`role-${user.id}`"
              >
                {{ roleLabels[user.role] }}
              </span>
            </div>
          </div>
          
          <div class="user-actions" @click.stop>
            <button
              @click="toggleUserActive(user)"
              :disabled="userStore.isLoading"
              class="btn btn-sm"
              :data-testid="`toggle-btn-${user.id}`"
            >
              {{ user.active ? 'Пауза' : 'Старт' }}
            </button>
            
            <button
              @click="deleteUser(user)"
              :disabled="userStore.isLoading"
              class="btn btn-sm btn-danger"
              :data-testid="`delete-btn-${user.id}`"
            >
              Видалити
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Load more button -->
    <div v-if="hasMore" class="load-more" data-testid="load-more">
      <button
        @click="loadMore"
        :disabled="userStore.isLoading"
        class="btn btn-outline"
        data-testid="load-more-btn"
      >
        Завантажити ще
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore, type User } from '../stores/user-store'

// Emits
const emit = defineEmits<{
  userSelected: [user: User]
  userDeleted: [userId: number]
  userUpdated: [user: User]
}>()

// Store
const userStore = useUserStore()

// Local state
const searchQuery = ref('')
const roleFilter = ref('')
const activeFilter = ref('')
const hasMore = ref(false) // Для демонстрації пагінації

// Computed
const filteredUsers = computed(() => userStore.filteredUsers)

const roleLabels = {
  admin: 'Адміністратор',
  user: 'Користувач',
  moderator: 'Модератор'
}

// Watchers
watch([searchQuery, roleFilter, activeFilter], () => {
  updateFilters()
}, { immediate: true })

// Methods
function updateFilters() {
  userStore.setFilters({
    search: searchQuery.value || undefined,
    role: roleFilter.value as any || undefined,
    active: activeFilter.value ? activeFilter.value === 'true' : undefined
  })
}

function clearFilters() {
  searchQuery.value = ''
  roleFilter.value = ''
  activeFilter.value = ''
  userStore.clearFilters()
}

function selectUser(user: User) {
  userStore.setCurrentUser(user)
  emit('userSelected', user)
}

async function toggleUserActive(user: User) {
  try {
    const updatedUser = await userStore.updateUser(user.id, {
      active: !user.active
    })
    emit('userUpdated', updatedUser)
  } catch (error) {
    console.error('Failed to toggle user status:', error)
  }
}

async function deleteUser(user: User) {
  if (confirm(`Ви впевнені, що хочете видалити користувача ${user.name}?`)) {
    try {
      await userStore.deleteUser(user.id)
      emit('userDeleted', user.id)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
}

function loadMore() {
  // Заглушка для демонстрації
  console.log('Loading more users...')
}

// Lifecycle
onMounted(async () => {
  if (userStore.totalUsers === 0) {
    try {
      await userStore.fetchUsers()
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }
})
</script>

<style scoped>
.user-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.list-header {
  margin-bottom: 24px;
}

.list-header h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.filters {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 12px;
  align-items: center;
}

.search-input,
.filter-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input {
  min-width: 250px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-cards {
  display: grid;
  gap: 16px;
}

.user-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.user-card.inactive {
  opacity: 0.6;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 18px;
  font-weight: bold;
  color: #666;
}

.user-details {
  min-width: 0;
}

.user-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.user-email {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
}

.user-meta {
  display: flex;
  gap: 8px;
}

.status-badge,
.role-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
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

.user-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border-color: #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.load-more {
  text-align: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }
  
  .search-input {
    min-width: auto;
  }
}
</style> 