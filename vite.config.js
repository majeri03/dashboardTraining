import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const API_TARGET_URL = "https://script.google.com/macros/s/AKfycbwS8EvngEcyymieaD7zFY6szGJEuwfRA0_JjMWGbZsLgY2ZYE9bar01H3ZV3SKZbl81/exec";

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