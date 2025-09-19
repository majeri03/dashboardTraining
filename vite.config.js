import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const API_TARGET_URL = "https://script.google.com/macros/s/AKfycby-w5Ufnp2pwgDc3NwE9FX6iYk3jcpqN8Z8KWv-M5y9zS9WkFEJzrLu8pO7P1KcXoYd/exec";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})