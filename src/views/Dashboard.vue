<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import BarChart from '../components/BarChart.vue';
import KpiCard from '../components/KpiCard.vue';
import DoughnutChart from '../components/DoughnutChart.vue';
import LineChart from '../components/LineChart.vue';
import SparklineChart from '../components/SparklineChart.vue'; // [BARU] Impor komponen sparkline

const apiUrl = import.meta.env.VITE_API_URL;
const currentYear = new Date().getFullYear();
// State untuk data
const monthlyData = ref(null);
const yearlyTrendData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));

// --- Computed Properties ---

const kpiMetrics = computed(() => {
  if (!monthlyData.value?.summary) return null;
  const summary = monthlyData.value.summary;
  const totalPeserta = monthlyData.value.trainings.reduce((sum, t) => sum + t.jumlahPeserta, 0);
  return {
    totalPeserta,
    totalJam: summary.totalJamBulanan.toFixed(1),
    pencapaian: summary.pencapaian,
  };
});

const pesertaPerDivisiChart = computed(() => {
  if (!monthlyData.value?.trainings) return null;
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
  if (!monthlyData.value?.trainings) return null;
  let int = 0, ext = 0;
  monthlyData.value.trainings.forEach(t => (t.extInt.toLowerCase() === 'int' ? int++ : ext++));
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

// [BARU] Computed property untuk data tren PESERTA
const participantTrendChart = computed(() => {
  if (!yearlyTrendData.value?.monthlyParticipants) return null;
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [{
      data: yearlyTrendData.value.monthlyParticipants,
      borderColor: '#EF4444', // Warna Merah
      borderWidth: 2,
      tension: 0.4
    }]
  }
});

// [BARU] Computed property untuk data tren JAM
const hoursTrendChart = computed(() => {
  if (!yearlyTrendData.value?.monthlyHours) return null;
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [{
      data: yearlyTrendData.value.monthlyHours,
      borderColor: '#3B82F6', // Warna Biru
      borderWidth: 2,
      tension: 0.4
    }]
  }
});

const currentMonthAndYear = computed(() => {
  const now = new Date();
  const monthName = months.value[now.getMonth()].name;
  const year = now.getFullYear();
  return `${monthName} ${year}`;
});

const dailyTrendsChart = computed(() => {
  if (!monthlyData.value?.trainings || monthlyData.value.trainings.length === 0) return null;

 const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dailyParticipantTotals = Array(daysInMonth).fill(0);
  const dailyHourTotals = Array(daysInMonth).fill(0);

  monthlyData.value.trainings.forEach(training => {
    const dateParts = training.jadwal.split(' ');
    const day = parseInt(dateParts[0]);
    if (!isNaN(day) && day > 0 && day <= daysInMonth) {
      dailyParticipantTotals[day - 1] += training.jumlahPeserta;
      dailyHourTotals[day - 1] += training.totalJamTraining;
    }
  });

  return {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets: [
      // [FIX] DATASET PESERTA (PINK) KITA LETAKKAN DI ATAS
      {
        label: 'Total Peserta per Hari',
        data: dailyParticipantTotals,
        borderColor: '#ec4899',
        yAxisID: 'yParticipants',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        pointRadius: 0,
        pointHoverRadius: 6,
        order: 2 
      },
      // [FIX] DATASET JAM TRAINING (UNGU) DI BAWAHNYA
      {
        label: 'Total Jam Training per Hari',
        data: dailyHourTotals,
        borderColor: '#a855f7',
        yAxisID: 'yHours',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        pointRadius: 0,
        pointHoverRadius: 6,
        order: 1
      }
    ]
  };
});

const dailyTrendsChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Aktivitas Harian Bulan Ini'
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280' }
    },
    // [FIX] Sumbu Y untuk Jam (MERAH) di KIRI
    yHours: {
      type: 'linear',
      display: true,
      position: 'left',
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        color: '#ef4444' // Warna Merah
      }
    },
    // [FIX] Sumbu Y untuk Peserta (UNGU) di KANAN
    yParticipants: {
      type: 'linear',
      display: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: '#a855f7' // Warna Ungu
      }
    }
  }
});

const fetchAllDashboardData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

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

const iconPeserta = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962A3.375 3.375 0 0 1 12 15.75c1.242 0 2.37-.626 3-1.58M12 9.75a3.375 3.375 0 0 1-3.375 3.375A3.375 3.375 0 0 1 5.25 9.75c0-1.856 1.504-3.375 3.375-3.375S12 7.894 12 9.75ZM6.375 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm4.5 0a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" /></svg>`;
const iconJam = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
const iconPencapaian = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>`;
</script>

<template>
  <div>
    <div class="header">
      <h1 class="header-title">Dashboard Training</h1>
      <p class="header-subtitle">Ringkasan Aktivitas Training</p>
    </div>

    <div v-if="isLoading">Memuat data...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else-if="monthlyData && yearlyTrendData">
      
  <div class="section">
    <h2 class="section-title">Analisis Bulan Ini ({{ currentMonthAndYear }})</h2>
    <div class="dashboard-grid">

      <div class="kpi-container">
        <KpiCard :title="'Total Peserta'" :value="kpiMetrics.totalPeserta" :icon="iconPeserta" color="#5356FF" />
        <KpiCard title="Total Jam Training" :value="kpiMetrics.totalJam" unit="Jam" :icon="iconJam" color="#378CE7" />
        <KpiCard title="Pencapaian Target" :value="kpiMetrics.pencapaian" :icon="iconPencapaian" color="#10B981" />
      </div>

      <div class="card">
        <h3 class="card-title">Peserta per Divisi</h3>
        <div class="chart-container">
          <BarChart v-if="pesertaPerDivisiChart" :chart-data="pesertaPerDivisiChart" />
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Tipe Training</h3>
        <div class="chart-container">
          <DoughnutChart v-if="intExtChart" :chart-data="intExtChart" />
        </div>
      </div>
    </div>
  </div>
<div class="section">
    <div class="card">
      <div class="chart-container-large">
        <LineChart v-if="dailyTrendsChart" :chart-data="dailyTrendsChart" :chart-options="dailyTrendsChartOptions" />
      </div>
    </div>
  </div>
<div class="section">
  <h2 class="section-title">Insight & Tren Tahunan {{ currentYear }}</h2>
  <div class="insight-grid">
    <div class="insight-card">
      <div class="insight-header">
        <span class="insight-title">Tren Peserta Tahun Ini</span>
        <span class="insight-total red">{{ yearlyTrendData.monthlyParticipants.reduce((a, b) => a + b, 0) }} Total</span>
      </div>
      <div class="sparkline-container">
        <SparklineChart v-if="participantTrendChart" :chart-data="participantTrendChart" color="#EF4444" />
      </div>
    </div>
    <div class="insight-card">
      <div class="insight-header">
        <span class="insight-title">Tren Jam Training Tahun Ini</span>
        <span class="insight-total blue">{{ yearlyTrendData.monthlyHours.reduce((a, b) => a + b, 0).toFixed(1) }} Jam</span>
      </div>
      <div class="sparkline-container">
        <SparklineChart v-if="hoursTrendChart" :chart-data="hoursTrendChart" color="#3B82F6" />
      </div>
    </div>
  </div>
</div>


    </div>
  </div>
</template>

<style scoped>
/* (Style .header, .kpi-grid, .dashboard-grid, .card, dan lainnya tetap sama) */
.header { margin-bottom: 2rem; }
.header-title { margin: 0; color: var(--primary-color, #5356FF); }
.header-subtitle { margin: 0; color: #6b7280; }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.section { margin-top: 3rem; }
.section-title { font-size: 1.5rem; color: var(--text-color); margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
.card { display: flex; flex-direction: column; background-color: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border: 1px solid var(--border-color, #e5e7eb); }
.card-title { font-size: 1.1rem; font-weight: 600; margin-top: 0; margin-bottom: 1.5rem; }
.chart-container { position: relative; height: 300px; flex-grow: 1; }

/* [BARU] Style untuk Grup Insight */
.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
.insight-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}
.insight-title {
  font-weight: 600;
  color: var(--text-color);
}
.insight-total {
  font-size: 1.25rem;
  font-weight: 700;
}
.insight-total.red { color: #EF4444; }
.insight-total.blue { color: #3B82F6; }

.sparkline-container {
  height: 80px;
}

.kpi-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: space-between;
  height: 100%;
}

.chart-container-large {
  position: relative;
  height: 450px; /* <-- UBAH NILAI INI */
}

</style>