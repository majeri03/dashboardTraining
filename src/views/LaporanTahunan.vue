<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = ref([currentYear - 2, currentYear - 1, currentYear, currentYear + 1]);

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  reportData.value = null; // Reset data sebelum fetch baru
  try {
    const response = await axios.get(apiUrl, { 
      params: { 
        action: 'getYearlyReport', 
        year: selectedYear.value 
      } 
    });
    reportData.value = response.data;
  } catch (err) {
    console.error("Gagal memuat laporan tahunan:", err);
    error.value = "Gagal memuat data. Pastikan ada data training dan konfigurasi untuk tahun yang dipilih.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
watch(selectedYear, fetchData);

// Computed property untuk menghitung total per kolom
const columnTotals = computed(() => {
  if (!reportData.value) return {};
  const totals = {
    mp: 0,
    targetJam: 0,
    achievements: Array(12).fill(0),
    totalAchievement: 0
  };
  
  reportData.value.divisions.forEach(div => {
    totals.mp += div.mp;
    totals.targetJam += div.targetJam;
    div.achievements.forEach((ach, index) => {
      totals.achievements[index] += ach;
    });
  });
  
  return totals;
});

const monthlyAcv = computed(() => {
  if (!reportData.value) return Array(12).fill(0);
  
  return reportData.value.monthlyTotals.map((total, index) => {
    const target = reportData.value.monthlyTargets[index];
    return target > 0 ? (total / target) * 100 : 0;
  });
});

const yearToDateAvg = computed(() => {
  const validMonths = monthlyAcv.value.filter(acv => acv > 0);
  if (validMonths.length === 0) return 0;
  const totalAcv = validMonths.reduce((sum, acv) => sum + acv, 0);
  return totalAcv / validMonths.length;
});

</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Progress Target Training Tahunan</h2>
      <div class="filter-controls">
        <label for="year-select">Pilih Tahun:</label>
        <select id="year-select" v-model="selectedYear" :disabled="isLoading">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      Membuat laporan tahunan, ini mungkin perlu beberapa saat...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else-if="reportData" class="table-wrapper">
      <table class="yearly-report-table">
        <thead>
          <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">Unit Bisnis</th>
            <th rowspan="2">MP</th>
            <th rowspan="2">Target (Jam)</th>
            <th colspan="12">Achievement</th>
          </tr>
          <tr>
            <th v-for="month in months" :key="month">{{ month.substring(0, 3) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(div, index) in reportData.divisions" :key="div.unitBisnis">
            <td>{{ index + 1 }}</td>
            <td class="text-left">{{ div.unitBisnis }}</td>
            <td>{{ div.mp }}</td>
            <td class="target-col">{{ (div.targetJam / 12).toFixed(0) }}</td>
            <td v-for="(ach, i) in div.achievements" :key="i">{{ ach > 0 ? ach : '' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">Total bulanan</td>
            <td>{{ columnTotals.mp }}</td>
            <td class="target-col">{{ (columnTotals.targetJam / 12).toFixed(0) }}</td>
            <td v-for="(total, i) in columnTotals.achievements" :key="i">
              <b>{{ total > 0 ? total.toFixed(1) : '' }}</b>
            </td>
          </tr>
          <tr class="acv-row">
            <td colspan="4">Acv (%)</td>
            <td v-for="(acv, i) in monthlyAcv" :key="i">
              <b :style="{ color: acv >= 100 ? 'green' : (acv > 0 ? 'orange' : 'inherit') }">
                {{ acv > 0 ? acv.toFixed(0) + '%' : '' }}
              </b>
            </td>
          </tr>
           <tr class="ytd-row">
            <td :colspan="4">Ytd {{ selectedYear }} (% Avg) =</td>
            <td :colspan="12"><b>{{ yearToDateAvg.toFixed(0) }}%</b></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.card-title {
  margin: 0;
}
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.filter-controls select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.table-wrapper {
  overflow-x: auto;
}
.yearly-report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  text-align: center;
}
.yearly-report-table th, .yearly-report-table td {
  border: 1px solid #dee2e6;
  padding: 8px;
  white-space: nowrap;
}
.yearly-report-table thead th {
  background-color: #e9ecef;
  font-weight: 600;
  vertical-align: middle;
}
.yearly-report-table .text-left {
  text-align: left;
}
.yearly-report-table .target-col {
  background-color: #dbeafe; /* Biru muda */
  font-weight: bold;
}
.yearly-report-table tfoot .total-row {
  background-color: #fef9c3; /* Kuning muda */
  font-weight: bold;
}
.yearly-report-table tfoot .acv-row {
  background-color: #f3f4f6; /* Abu-abu muda */
}
.yearly-report-table tfoot .ytd-row {
  background-color: #e0e0e0;
  font-weight: bold;
}
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #555;
}
.error-state {
  color: #d32f2f;
  font-weight: bold;
}
</style>