import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  server: {
    port: 5173,
    host: true,
    open: false
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  
  // Налаштування для тестів
  test: {
    environment: 'happy-dom',
    globals: true
  }
}) 