<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const emit = defineEmits(['switch-view']);
const email = ref('');
const password = ref('');
const error = ref(null);
const isLoading = ref(false);
const login = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    // Jika berhasil, App.vue akan otomatis mendeteksi dan menampilkan dasbor
  } catch (err) {
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        error.value = 'Email atau password salah.';
        break;
      default:
        error.value = 'Terjadi kesalahan saat login.';
        break;
    }
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <div class="login-page">
    <div class="left-panel">
      <div class="welcome-content">
        <img src="/images/logo.png" alt="Bosowa Logo" class="logo">
        <h1>Selamat Datang di<br>Training Center</h1>
        <p>Silakan masuk untuk mengelola dan memantau semua data aktivitas training Anda.</p>
        
        <svg class="illustration" viewBox="0 0 577 493" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M428.24 358.332C428.24 358.332 460.33 325.222 467.33 301.222C474.33 277.222 460.33 259.222 453.33 249.222C446.33 239.222 431.24 233.222 431.24 233.222L416.24 163.222L360.24 18.2222L329.24 1.22217L213.24 1.22217L181.24 18.2222L125.24 163.222L110.24 233.222C110.24 233.222 95.1499 239.222 88.1499 249.222C81.1499 259.222 67.1499 277.222 74.1499 301.222C81.1499 325.222 113.24 358.222 113.24 358.222" fill="#E2E8F0" stroke="#475569" stroke-width="2"/>
            <rect x="135" y="157" width="298" height="191" rx="12" fill="white" stroke="#475569" stroke-width="2"/>
            <rect x="156" y="235" width="128" height="9" rx="4.5" fill="#CBD5E1"/>
            <rect x="156" y="259" width="256" height="9" rx="4.5" fill="#F1F5F9"/>
            <rect x="156" y="278" width="256" height="9" rx="4.5" fill="#F1F5F9"/>
            <rect x="156" y="297" width="198" height="9" rx="4.5" fill="#F1F5F9"/>
            <path d="M482.5 491.5C529.93 491.5 568 453.43 568 406C568 358.57 529.93 320.5 482.5 320.5C435.07 320.5 397 358.57 397 406C397 453.43 435.07 491.5 482.5 491.5Z" fill="#F59E0B"/>
            <path d="M499 406.001C499 415.389 491.389 423 482 423C472.611 423 465 415.389 465 406.001C465 396.612 472.611 389 482 389C491.389 389 499 396.612 499 406.001Z" fill="#FBBF24"/>
            <rect x="290" y="196" width="88" height="4" rx="2" fill="#E2E8F0"/>
            <rect x="156" y="196" width="114" height="12" rx="6" fill="#475569"/>
            <circle cx="399" cy="198" r="7" fill="#F87171"/>
            <circle cx="419" cy="198" r="7" fill="#4ADE80"/>
        </svg>
      </div>
    </div>

    <div class="right-panel">
      <div class="login-box">
        <h2>Sign In</h2>
        <p class="subtitle">Selamat datang kembali! Silakan masuk.</p>
        <form @submit.prevent="login">
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required placeholder="Enter your email">
          </div>
          <div class="input-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required placeholder="Enter your password">
          </div>
          
          <div class="form-footer">
            <a href="#" @click.prevent="emit('switch-view', 'forgotPassword')" class="link">
            Lupa Password?
            </a>
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Loading...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #a50000;
}

/* --- Kolom Kiri --- */
.left-panel {
  flex: 55%; /* Ambil 55% lebar layar */
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  border-right: 1px solid #e2e8f0;
}
.welcome-content {
  max-width: 500px;
  text-align: center;
}
.logo {
  max-width: 180px;
  margin-bottom: 0.5rem;
}
.left-panel h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}
.left-panel p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
}
.illustration {
  width: 100%;
  max-width: 450px;
  margin-top: 2rem;
}

/* --- Kolom Kanan --- */
.right-panel {
  flex: 45%; /* Ambil 45% lebar layar */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.login-box {
  width: 100%;
  max-width: 380px;
}
.login-box h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
}
.subtitle {
  color: #f1f1f1;
  margin-bottom: 2rem;
}
.input-group {
  margin-bottom: 1.25rem;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #ffffff;
}
.input-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #fffb00;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-group input:focus {
  outline: none;
  border-color: var(--secondary-color, #ffffff);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.form-footer {
  text-align: right;
  margin-bottom: 1.5rem;
}
.recover-password {
  font-size: 0.9rem;
  color: #fffb00;
  text-decoration: none;
}
.recover-password:hover {
  text-decoration: underline;
}

.error-message {
  color: var(--primary-color, #d10000);
  margin-bottom: 1rem;
  font-weight: 500;
}
button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color, #d10000);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #b90000; /* Warna merah sedikit lebih gelap */
}
button:disabled {
  background-color: #f87171;
  cursor: not-allowed;
}


/* --- Tampilan Responsif untuk Mobile --- */
@media (max-width: 992px) {
  .left-panel {
    display: none; /* Sembunyikan kolom kiri di layar kecil */
  }
  .right-panel {
    flex: 100%; /* Kolom kanan ambil semua lebar */
    padding: 1.5rem;
  }
}
</style>