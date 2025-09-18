<script setup>
// 'defineEmits' digunakan untuk mengirim pesan dari komponen ini ke komponen induknya (App.vue)
const emit = defineEmits(['navigate']);

const navigateTo = (view) => {
  emit('navigate', view); // Mengirim pesan 'navigate' dengan nama view yang diklik
};
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Dashboard Training</h3>
    </div>
    <nav class="sidebar-nav">
      <a href="#" @click.prevent="navigateTo('Dashboard')">Dashboard</a>
      <a href="#" @click.prevent="navigateTo('LaporanPelaksanaan')">Laporan Pelaksanaan</a>
      <a href="#" @click.prevent="navigateTo('LaporanEvaluasi')">Laporan Evaluasi</a>
      <a href="#" @click.prevent="navigateTo('LaporanDetail')">Laporan Detail</a>
    </nav>
  </aside>
</template>

<style scoped>
/* 'scoped' berarti style ini hanya berlaku untuk komponen Sidebar.vue */
.sidebar {
  background-color: #2c3e50; /* Warna gelap untuk sidebar */
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}
.sidebar-header {
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #465a70;
  text-align: center;
}
.sidebar-nav a {
  display: block;
  color: #bdc3c7;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s, color 0.2s;
}
.sidebar-nav a:hover {
  background-color: #34495e;
  color: white;
}
</style>