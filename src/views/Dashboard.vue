<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import BarChart from '../components/BarChart.vue';
import KpiCard from '../components/KpiCard.vue';
import DoughnutChart from '../components/DoughnutChart.vue';
import LineChart from '../components/LineChart.vue'; // Impor komponen baru

const iconPeserta = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.375 3.375 0 0 1 12 15.75c1.242 0 2.37-.626 3-1.58M12 9.75a3.375 3.375 0 0 1-3.375 3.375A3.375 3.375 0 0 1 5.25 9.75c0-1.856 1.504-3.375 3.375-3.375S12 7.894 12 9.75ZM6.375 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" /></svg>`;
const iconJam = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
const iconPencapaian = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>`;
const apiUrl = import.meta.env.VITE_API_URL;

// State untuk data bulanan dan tahunan
const monthlyData = ref(null);
const yearlyTrendData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const dynamicMonthYear = ref(''); 
// --- Computed Properties untuk Mengolah Data ---

const kpiMetrics = computed(() => {
  if (!monthlyData.value) return null;
  const summary = monthlyData.value.summary;
  const totalPeserta = monthlyData.value.trainings.reduce((sum, t) => sum + t.jumlahPeserta, 0);
  return {
    totalPeserta: totalPeserta,
    totalJam: summary.totalJamBulanan.toFixed(1),
    pencapaian: summary.pencapaian,
  };
});

const pesertaPerDivisiChart = computed(() => {
  if (!monthlyData.value) return null;
  const rekap = {};
  monthlyData.value.trainings.forEach(training => {
    for (const div in training.rincianDivisi) {
      if (!rekap[div]) rekap[div] = 0;
      rekap[div] += training.rincianDivisi[div].peserta;
    }
  });
  return {
    labels: Object.keys(rekap),
    datasets: [{
      label: 'Jumlah Peserta',
      backgroundColor: '#5356FF',
      data: Object.values(rekap),
      borderRadius: 4,
    }],
  };
});

const intExtChart = computed(() => {
  if (!monthlyData.value) return null;
  let int = 0, ext = 0;
  monthlyData.value.trainings.forEach(t => t.extInt.toLowerCase() === 'int' ? int++ : ext++);
  return {
    labels: ['Internal', 'Eksternal'],
    datasets: [{
      backgroundColor: ['#5356FF', '#378CE7'],
      data: [int, ext],
      borderWidth: 2,
      borderColor: '#DFF5FF'
    }]
  };
});

const yearlyTrendChart = computed(() => {
  if (!yearlyTrendData.value) return null;
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [{
      label: 'Total Jam Training',
      data: yearlyTrendData.value.monthlyHours,
      borderColor: '#5356FF',
      backgroundColor: 'rgba(83, 86, 255, 0.1)',
      fill: true,
      tension: 0.3
    }]
  }
});

// Fungsi untuk mengambil semua data yang dibutuhkan dashboard
const fetchAllDashboardData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const monthName = now.toLocaleString('id-ID', { month: 'long' });
    dynamicMonthYear.value = `${monthName} ${year}`;

    // Ambil data detail bulan ini dan data tren tahunan secara bersamaan
    const [monthlyResponse, yearlyResponse] = await Promise.all([
      axios.get(apiUrl, { params: { action: 'detailRekap', month, year } }),
      axios.get(apiUrl, { params: { action: 'getYearlyTrend', year } })
    ]);

    monthlyData.value = monthlyResponse.data;
    yearlyTrendData.value = yearlyResponse.data;

  } catch (err) {
    error.value = "Gagal memuat data dashboard.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAllDashboardData);
</script>

<template>
  <div>
    <div class="header">
      <h1 class="header-title">Dashboard Training</h1>
      <p class="header-subtitle">Ringkasan Aktivitas Training</p>
    </div>

    <div v-if="isLoading">Memuat data dashboard...</div>
    <div v-if="error">{{ error }}</div>

    <div v-if="!isLoading && monthlyData && yearlyTrendData">
      <div class="kpi-grid">
        <KpiCard :title="`Total Peserta - ${dynamicMonthYear}`" :value="kpiMetrics.totalPeserta" :icon="iconPeserta" color="#5356FF" />
        <KpiCard :title="`Total Jam Training - ${dynamicMonthYear}`" :value="kpiMetrics.totalJam" unit="Jam" :icon="iconJam" color="#378CE7" />
        <KpiCard :title="`Pencapaian Target - ${dynamicMonthYear}`" :value="kpiMetrics.pencapaian" :icon="iconPencapaian" color="#10B981" />
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <h2 class="card-title">Peserta per Divisi</h2>
          <div class="chart-container">
            <BarChart v-if="pesertaPerDivisiChart" :chart-data="pesertaPerDivisiChart" />
          </div>
        </div>
        
        <div class="card">
          <h2 class="card-title">Tipe Training</h2>
          <div class="chart-container">
            <DoughnutChart v-if="intExtChart" :chart-data="intExtChart" />
          </div>
        </div>
        
        <div class="card wide-card">
          <h2 class="card-title">Tren Jam Training Tahun Ini</h2>
          <div class="chart-container">
            <LineChart v-if="yearlyTrendChart" :chart-data="yearlyTrendChart" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Style header dan kpi-grid tetap sama */
.header { margin-bottom: 2rem; }
.header-title { margin: 0; color: var(--primary-color, #5356FF); }
.header-subtitle { margin: 0; color: #6b7280; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }

/* Grid utama untuk grafik */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid var(--border-color, #e5e7eb);
}
.card-title { margin-top: 0; margin-bottom: 1rem; }

.chart-container {
  position: relative;
  height: 300px;
  flex-grow: 1;
}

/* Membuat kartu grafik garis memanjang selebar kontainer */
.wide-card {
  grid-column: 1 / -1;
}
</style>