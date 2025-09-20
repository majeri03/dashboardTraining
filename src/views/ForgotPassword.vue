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
  <div class="auth-layout">
    <!-- Panel Kiri (brand) -->
    <div class="brand-panel">
      <div class="brand-inner">
        <img src="/images/logo.png" alt="Logo" class="brand-logo" />

        <h1 class="brand-title">
          Dashboard Training <br /> Center
        </h1>
        <p class="brand-subtitle">
          Silakan masuk untuk mengelola dan memantau semua data aktivitas training Anda.
        </p>

        <!-- Ilustrasi opsional -->
        <div class="brand-illustration" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 48 48"><path fill="#000000" fill-rule="evenodd" d="M6 6h31v5h-2V8H8v23h21.387v2H6V6Zm30 13a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm2.031 2.01c1.299 0 2.327.584 3 1.486c.629.845.895 1.89.955 2.855a7.626 7.626 0 0 1-.397 2.92c-.3.87-.807 1.77-1.589 2.387V40.5a1.5 1.5 0 0 1-2.98.247L35.73 33h-.298l-1.458 7.776A1.5 1.5 0 0 1 31 40.5V26.233a63.223 63.223 0 0 0-.592.919l-.078.123l-.02.032l-.005.009a1.5 1.5 0 0 1-1.274.707h-5a1.5 1.5 0 1 1 0-3h4.177c.243-.376.563-.864.899-1.354c.35-.511.736-1.052 1.08-1.476c.167-.207.354-.423.542-.6c.092-.087.22-.2.376-.3a1.72 1.72 0 0 1 .926-.282h6Z" clip-rule="evenodd"/></svg>
        </div>
      </div>
    </div>

    <!-- Panel Kanan (form) -->
    <div class="form-panel">
      <div class="form-card">
        <h2 class="form-title">Lupa Password</h2>
        <p class="form-subtitle">Masukkan email Anda untuk menerima link reset password.</p>

        <form @submit.prevent="resetPassword" v-if="!successMessage" class="auth-form">
          <div class="input-group">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8l8 5 8-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/>
            </svg>
            <input type="email" id="email" v-model="email" required placeholder="Enter your email address" />
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>

          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Loading...' : 'Kirim Link Reset' }}
          </button>
        </form>

        <div v-if="successMessage" class="success-box">
          <p>{{ successMessage }}</p>
        </div>

        <div class="form-footer">
          <a href="#" @click.prevent="emit('switch-view', 'login')" class="link">
            &larr; Back to Sign In
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* ===== Layout Utama (2 kolom) ===== */
.auth-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background: #fff;
}

/* ===== Panel Kiri (Brand) ===== */
.brand-panel {
  background: #ffffff;
  border-right: 1px solid #eef2f7;
  display: flex;
  align-items: center;
}
.brand-inner {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 64px 72px;
}
.brand-logo {
  height: 44px;
  width: auto;
  margin-bottom: 48px;
}
.brand-title {
  font-size: 44px;
  line-height: 1.1;
  font-weight: 800;
  color: #d80000;
  margin: 0 0 16px 0;
}
.brand-subtitle {
  max-width: 520px;
  color: #272626;
  margin: 0 0 40px 0;
  font-size: 16px;
}
.brand-illustration .il {
  color: #0b0b0b;
  width: 120px;
  height: 120px;
}

/* ===== Panel Kanan (Form) ===== */
.form-panel {
  background: var(--panel-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-card {
  width: 100%;
  max-width: 420px;
  padding: 24px;
}
.form-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 8px 0;
}
.form-subtitle {
  color: var(--muted);
  margin: 0 0 24px 0;
}

/* ===== Form ===== */
.auth-form {
  width: 100%;
}
.input-group {
  position: relative;
  margin-bottom: 16px;
}
.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
  pointer-events: none;
}
.input-group input {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 42px; /* ruang untuk ikon kiri */
  background: #fff;
  border: 1px solid #4d4d4d;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-dark);
  box-sizing: border-box;
}
.input-group input::placeholder {
  color: #9ca3af;
}
.input-group input:focus {
  outline: none;
  border-color: #a7b0ff;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
}

.error-message {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: left;
}

button {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 8px;
  background: #0e00d3;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
}
button:hover {
  filter: brightness(0.95);
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-box {
  color: #065f46;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 14px;
  border-radius: 8px;
  margin: 12px 0 0 0;
}

.form-footer {
  margin-top: 16px;
  text-align: center;
}
.link {
  color: var(--text-dark);
  text-decoration: none;
  font-weight: 500;
}
.link:hover {
  text-decoration: underline;
}

/* ===== Responsif (tablet/ponsel) ===== */
@media (max-width: 1024px) {
  .brand-title { font-size: 36px; }
  .brand-inner { padding: 56px 48px; }
}
@media (max-width: 860px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    border-right: none;
    border-bottom: 1px solid #eef2f7;
  }
  .brand-inner {
    padding: 40px 24px;
    max-width: 640px;
  }
  .form-card {
    padding: 32px 24px 56px;
    max-width: 520px;
  }
  /* Sembunyikan judul, subjudul, dan ilustrasi SVG */
  .brand-title,
  .brand-subtitle,
  .brand-illustration {
    display: none;
  }

  /* Atur ulang margin bawah logo agar pas */
  .brand-logo {
    margin-bottom: 0;
  }
  
  .form-card {
    padding: 32px 24px 56px;
    max-width: 520px;
  }
}

</style>
