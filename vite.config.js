import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Ganti dengan URL Web App Anda yang terakhir di-deploy
const API_TARGET_URL = "https://script.google.com/macros/s/AKfycbwiyyzxAyxlBj8Ks9vKAcSasoAC_iOlMJu9MH9_MDx3XexXVBcAB0ZHWaAjiftAKfXC/exec";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Setiap permintaan ke "/api" akan diteruskan ke target di atas
      '/api': {
        target: API_TARGET_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})