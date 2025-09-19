<script setup>
import { ref } from 'vue';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { inject } from 'vue';
const emit = defineEmits(['switch-view']);
const email = ref('');
const error = ref(null);
const successMessage = ref(null);
const isLoading = ref(false);
const showNotification = inject('showNotification');

const resetPassword = async () => {
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    await sendPasswordResetEmail(auth, email.value);
    showNotification('Link reset password telah dikirim ke email Anda.', 'success');
    successMessage.value = 'Silakan cek inbox atau folder spam di email Anda.';
  } catch (err) {
    error.value = 'Gagal mengirim email. Pastikan email sudah benar.';
    showNotification('Gagal mengirim email. Pastikan email sudah benar.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-box">
      <img src="/images/logo.png" alt="Logo" class="logo">
      <h2>Lupa Password</h2>
      <p class="subtitle">Masukkan email Anda untuk menerima link reset password.</p>

      <form @submit.prevent="resetPassword" v-if="!successMessage">
        <div class="input-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Enter your email">
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Kirim Link Reset' }}
        </button>
      </form>

      <div v-if="successMessage" class="success-box">
        <p>{{ successMessage }}</p>
      </div>

      <div class="form-footer-bottom">
        <a href="#" @click.prevent="emit('switch-view', 'login')" class="link">
        &larr; Back to Sign In
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gunakan style yang sama persis dengan Login.vue, salin semua CSS dari sana */
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: var(--primary-color, #d10000); padding: 2rem; }
.auth-box { width: 100%; max-width: 420px; text-align: center; }
.logo { max-width: 200px; margin-bottom: 2.5rem; }
h2 { font-size: 2.5rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
.subtitle { color: #fecaca; margin-bottom: 2.5rem; }
.input-group { margin-bottom: 1.5rem; text-align: left; }
.input-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: white; }
.input-group input { width: 100%; padding: 0.9rem 1rem; border: 1px solid white; border-radius: 8px; font-size: 1rem; background-color: white; color: #111827; }
.input-group input:focus { outline: none; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5); }
.form-footer-bottom { text-align: center; margin-top: 2rem; }
.link { font-size: 0.9rem; color: white; text-decoration: none; }
.link:hover { text-decoration: underline; }
.error-message { color: #fcd34d; margin-bottom: 1rem; font-weight: 500; }
.success-box { color: white; background-color: rgba(255, 255, 255, 0.1); padding: 1.5rem; border-radius: 8px; }
button { width: 100%; padding: 1rem; border: none; border-radius: 8px; background-color: white; color: var(--primary-color, #d10000); font-size: 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s, color 0.2s; }
button:hover { background-color: #fee2e2; }
button:disabled { background-color: #fecaca; cursor: not-allowed; }
</style>