<script setup>
import { ref, shallowRef } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Dashboard from './views/Dashboard.vue';
import LaporanPelaksanaan from './views/LaporanPelaksanaan.vue';
import LaporanEvaluasi from './views/LaporanEvaluasi.vue';
import LaporanDetail from './views/LaporanDetail.vue';
import InputAbsensi from './views/InputAbsensi.vue';

const views = {
  Dashboard,
  LaporanPelaksanaan,
  LaporanEvaluasi,
  LaporanDetail,
  InputAbsensi,
};

const activeView = shallowRef(Dashboard);
const activeViewName = ref('Dashboard');

const handleNavigation = (viewName) => {
  activeView.value = views[viewName];
  activeViewName.value = viewName;
};
</script>

<template>
  <div id="app-layout">
    <Sidebar @navigate="handleNavigation" :active-view="activeViewName" />
    
    <main class="main-content">
      <KeepAlive>
        <component :is="activeView" />
      </KeepAlive>
    </main>
  </div>
</template>

<style>
/* Style global Anda tidak berubah */
:root {
  --primary-color: #d10000;
  --secondary-color: #F97316;
  --sidebar-bg:#111827; /* Warna sidebar baru yang lebih gelap */
  --sidebar-text: #9CA3AF;
  --sidebar-text-hover: #FFFFFF;
  --sidebar-active-bg: #374151;
  --bg-color: #ffffff;
  --text-color: #374151;
  --border-color: #e5e7eb;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-color);
  margin: 0;
}
#app-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100vh;
}
.main-content {
  padding: 2rem;
  overflow-y: auto;
}

/* Style umum untuk Card dan Tabel yang bisa digunakan di semua view */
.card {
  background-color: #ffffff;
  border-radius: 12px; /* Sedikit lebih bulat */
  padding: 1.5rem;
  /* Bayangan yang lebih lembut dan modern */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid var(--border-color); /* Border lembut sebagai tambahan */
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