<script setup>
import { ref } from 'vue';
defineProps({
  activeView: String
});

const emit = defineEmits(['navigate', 'close']);
const isKonfigurasiOpen = ref(false);

const navigateTo = (view) => {
  emit('navigate', view);
};

// [BARU] Daftar menu dalam bentuk array objek agar lebih rapi
const menuItems = [
  {
    name: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`
  },
  {
    name: 'InputAbsensi',
    label: 'Input Absensi',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`
  },
  {
    name: 'LaporanPelaksanaan',
    label: 'Lap. Internal Training',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C6.095 4.01 5.25 4.973 5.25 6.108V18.75c0 1.243.87 2.25 1.969 2.25H18A2.25 2.25 0 0020.25 18.75V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>`
  },
  {
    name: 'LaporanEvaluasi',
    label: 'Lap. External Training',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197" /></svg>`
  },
  {
    name: 'LaporanDetail',
    label: 'Lap. Detail',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>`
  },
];
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="/images/logo.png" alt="Logo Bosowa" class="logo">
      <h3 class="logo-title">Training Center</h3>
      <button class="close-menu" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:24px; height:24px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      <a v-for="item in menuItems"
         :key="item.name"
         href="#"
         class="nav-link"
         :class="{ 'nav-link-active': activeView === item.name }"
         @click.prevent="navigateTo(item.name)">
        
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-text">{{ item.label || item.name }}</span>
      </a>
      <div class="nav-dropdown">
        <a href="#" class="nav-link" @click.prevent="isKonfigurasiOpen = !isKonfigurasiOpen">
          <span class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.007h2.593c.55 0 1.02.465 1.11 1.007l.073.438c.11.662.596 1.186 1.246 1.348l.418.106c.47.118.946.368 1.355.768l.317.317c.474.474.722 1.11.634 1.742l-.087.632c-.097.702-.45 1.34-.985 1.782l-.27.27c-.41.41-.85.74-1.326.953l-.42.213c-.696.353-1.15.99-1.21 1.742l-.04.463c-.09.542-.56 1.007-1.11 1.007H10.7c-.55 0-1.02-.465-1.11-1.007l-.04-.463c-.06-.752-.514-1.39-1.21-1.742l-.42-.213c-.476-.213-.916-.543-1.326-.953l-.27-.27c-.535-.442-.888-1.08-.985-1.782l-.087-.632c-.088-.632.16-1.268.634-1.742l.317-.317c.41-.4.885-.65 1.355-.768l.418-.106c.65-.163 1.136-.686 1.246-1.348l.073-.438zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>
          </span>
          <span class="nav-text">Konfigurasi</span>
          <span class="dropdown-arrow" :class="{ 'is-open': isKonfigurasiOpen }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:20px; height:20px;"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          </span>
        </a>

        <div class="submenu" v-if="isKonfigurasiOpen">
          <a href="#" class="submenu-link" :class="{ 'submenu-link-active': activeView === 'KonfigurasiDivisi' }" @click.prevent="navigateTo('KonfigurasiDivisi')">
            Konfigurasi Divisi
          </a>
          <a href="#" class="submenu-link" :class="{ 'submenu-link-active': activeView === 'KonfigurasiBulanan' }" @click.prevent="navigateTo('KonfigurasiBulanan')">
            Konfigurasi Bulanan
          </a>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  background-color: var(--sidebar-bg, #111827);
  color: var(--sidebar-text, #9CA3AF);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 5px 0 10px -2px rgba(59, 88, 255, 0.5);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background-color: #ffffff; /* <-- TAMBAHKAN INI */
  padding: 1.5rem;            /* <-- UBAH INI */
}

.logo {
  height: 40px;
  width: auto;
}

.logo-title {
  color: #111827; /* <-- UBAH WARNA TEKS JADI GELAP */
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--sidebar-text, #ffffff);
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s;
  
}

.nav-link:hover {
  background-color: var(--sidebar-active-bg, #374151);
  color: var(--sidebar-text-hover, #FFFFFF);
}

.nav-link-active {
  background-color: var(--primary-color, #3B82F6);
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  box-shadow: 0 0 8px rgba(255, 59, 59, 0.7), 0 0 12px rgba(255, 59, 59, 0.5);
}

/* Mengatur style ikon SVG */
.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-text {
  white-space: nowrap;
}

.sidebar-header {
  position: relative; /* Diperlukan untuk posisi tombol close */
}

.close-menu {
  display: none; /* Sembunyi di desktop */
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}
.close-menu svg {
  width: 24px;
  height: 24px;
  color: #9CA3AF;
}

@media (max-width: 768px) {
  .close-menu {
    display: block; 
  }
}

.nav-link {
  position: relative; /* Diperlukan agar panah dropdown pas posisinya */
}

.dropdown-arrow {
  position: absolute;
  right: 1rem;
  transition: transform 0.2s; /* Animasi putar */
}

.dropdown-arrow.is-open {
  transform: rotate(180deg); /* Putar 180 derajat saat terbuka */
}

.submenu {
  display: flex;
  flex-direction: column;
  padding-left: 3.25rem; /* Beri jarak kiri agar menjorok ke dalam */
  border-radius: 6px;
  margin-top: 0.25rem;
}

.submenu-link {
  color: var(--sidebar-text, #ffffff);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9em; /* Sedikit lebih kecil dari menu utama */
}

.submenu-link:hover {
  background-color: var(--sidebar-active-bg, #374151);
}

.submenu-link-active {
  color: #FFFFFF;
  font-weight: 600;
  background-color: var(--primary-color, #3B82F6);
}

</style>