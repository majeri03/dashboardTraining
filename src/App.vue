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

const isSidebarOpen = ref(false);

const activeView = shallowRef(Dashboard);
const activeViewName = ref('Dashboard');

const handleNavigation = (viewName) => {
  activeView.value = views[viewName];
  activeViewName.value = viewName;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

</script>

<template>
  <div id="app-layout" :class="{ 'sidebar-mobile-open': isSidebarOpen }">
  <Sidebar @navigate="handleNavigation" :active-view="activeViewName" @close="toggleSidebar" />
  <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
  <main class="main-content">
      <button class="hamburger-menu" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:24px; height:24px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
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
  --secondary-color: #000a9bffff;
  --sidebar-bg:rgb(5, 39, 114); /* Warna sidebar baru yang lebih gelap */
  --sidebar-text: #ffffff;
  --sidebar-text-hover: #FFFFFF;
  --sidebar-active-bg: #ff6464;
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

.hamburger-menu {
  display: none;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  #app-layout {
    grid-template-columns: 1fr;
  }

  .hamburger-menu {
    display: block;
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    z-index: 50;
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .main-content {
    padding-top: 5rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  
  #app-layout.sidebar-mobile-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

}
</style>