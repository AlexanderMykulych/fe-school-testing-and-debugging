import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Налаштування Pinia
const pinia = createPinia()
app.use(pinia)

// Налаштування Router
app.use(router)

// Монтування застосування
app.mount('#app') 