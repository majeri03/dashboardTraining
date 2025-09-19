import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const API_TARGET_URL = "https://script.google.com/macros/s/AKfycbwD2h96Lan80FLznSiEoWAcBYqCGT-DRL8-DBLRLpUvll-MPtpeLEPbmXcMiSOxFv0j/exec";

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