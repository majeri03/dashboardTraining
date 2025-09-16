<script setup>
import { ref, shallowRef } from 'vue'; // shallowRef lebih optimal untuk komponen
import Sidebar from './components/Sidebar.vue';
import Dashboard from './views/Dashboard.vue';
import LaporanPelaksanaan from './views/LaporanPelaksanaan.vue';
import LaporanEvaluasi from './views/LaporanEvaluasi.vue';
import Rekapitulasi from './views/Rekapitulasi.vue';
import LaporanDetail from './views/LaporanDetail.vue';
// Membuat peta komponen untuk pemanggilan dinamis
const views = {
  Dashboard,
  LaporanPelaksanaan,
  LaporanEvaluasi,
  Rekapitulasi,
  LaporanDetail,
};

const activeView = shallowRef(Dashboard); // State untuk komponen yang aktif
const activeViewName = ref('Dashboard'); // State untuk nama view

const handleNavigation = (viewName) => {
  activeView.value = views[viewName];
  activeViewName.value = viewName;
};
</script>

<template>
  <div id="app-layout">
    <Sidebar @navigate="handleNavigation" />
    
    <main class="main-content">
      <KeepAlive>
        <component :is="activeView" />
      </KeepAlive>
    </main>
  </div>
</template>
<style>
/* Style Global untuk Aplikasi */
:root {
  --primary-color: #004d8c;
  --bg-color: #f4f6f8;
  --border-color: #e0e0e0;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  margin: 0;
}

/* Layout Utama Dashboard */
#app-layout {
  display: grid;
  grid-template-columns: 250px 1fr; /* Sidebar 250px, sisa untuk konten */
  height: 100vh;
}
.main-content {
  padding: 2rem;
  overflow-y: auto; /* Agar konten bisa di-scroll jika panjang */
}

/* Style umum untuk Card dan Tabel yang bisa digunakan di semua view */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-title { margin-top: 0; }
.table-wrapper { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
th { font-weight: 700; color: var(--primary-color); }
td a { color: var(--primary-color); text-decoration: none; font-weight: 500; }

/* Desain Responsif */
@media (max-width: 768px) {
  #app-layout {
    grid-template-columns: 1fr; /* Ubah layout menjadi satu kolom */
    grid-template-rows: auto 1fr; /* Sidebar di atas, konten di bawah */
    height: auto;
  }
  .sidebar {
    /* Style sidebar di mobile bisa disesuaikan, misal jadi bar horizontal */
    flex-direction: row;
    justify-content: center;
  }
  .sidebar-header { display: none; }
  .sidebar-nav { display: flex; gap: 0.5rem; }
  .sidebar-nav a { font-size: 0.8rem; padding: 0.5rem; }
  
  /* Responsive Table */
  table thead { display: none; }
  table tr { display: block; margin-bottom: 1rem; border: 1px solid var(--border-color); }
  table td { display: block; text-align: right; border-bottom: 1px dotted var(--border-color); }
  table td::before { content: attr(data-label); float: left; font-weight: bold; }
}
</style>