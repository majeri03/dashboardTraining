<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const apiUrl = 'https://script.google.com/macros/s/AKfycbxhIy3tfOItHh6ChO1XSXBeYO4d8dBKyuOGD-pPgrGKzlXhGLbKrARWtiba1DOUt22G/exec'; // <-- GANTI DENGAN URL ANDA

const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

// State untuk filter bulan dan tahun
const now = new Date();
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear = ref(now.getFullYear());
const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));
const years = ref([2024, 2025, 2026]); // Sesuaikan rentang tahun

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      action: 'detailRekap',
      month: selectedMonth.value,
      year: selectedYear.value
    };
    const response = await axios.get(apiUrl, { params });
    reportData.value = response.data;
  } catch (err) {
    error.value = "Gagal memuat data laporan detail.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Ambil data saat komponen dimuat
onMounted(fetchData);

// Ambil data lagi setiap kali filter bulan atau tahun berubah
watch([selectedMonth, selectedYear], fetchData);

// Helper untuk menampilkan rincian divisi
const getDivisiInfo = (rincian, div) => {
    const data = rincian[div];
    if (!data) return "0 / 0";
    return `${data.peserta} / ${data.jam}`;
};

// Daftar divisi sesuai contoh Anda
const divisiHeaders = [ 'IT',
  'Marketing',
  'Operasional',
  'HR & GA',
  'Finance & Accounting',
  'Procurement',
  'Sales',
  'Customer Service',
  'Legal & Compliance',
  'HSE (K3)'];
</script>

<template>
  <div class="card">
    <h2 class="card-title">Laporan Detail Bulanan</h2>
    
    <div class="filter-controls">
      <select v-model="selectedMonth">
        <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
      </select>
      <select v-model="selectedYear">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>

    <div v-if="isLoading">Memuat laporan...</div>
    <div v-if="error">{{ error }}</div>
    
    <div v-if="!isLoading && reportData">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Kegiatan</th>
              <th>Jadwal</th>
              <th>PIC/Pemateri</th>
              <th>Jml Peserta</th>
              <th>Durasi</th>
              <th>Total Jam</th>
              <th v-for="div in divisiHeaders" :key="div">{{ div }} (P/J)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(training, index) in reportData.trainings" :key="training.judul">
              <td>{{ index + 1 }}</td>
              <td>{{ training.judul }}</td>
              <td>{{ training.jadwal }}</td>
              <td>{{ training.pemateri }}</td>
              <td>{{ training.jumlahPeserta }}</td>
              <td>{{ training.durasi }}</td>
              <td><b>{{ training.totalJamTraining }}</b></td>
              <td v-for="div in divisiHeaders" :key="div">{{ getDivisiInfo(training.rincianDivisi, div) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td :colspan="6" class="summary-label">Total Bulanan</td>
              <td class="summary-value"><b>{{ reportData.summary.totalJamBulanan.toFixed(1) }}</b></td>
            </tr>
            <tr>
              <td :colspan="6" class="summary-label">Jumlah Karyawan</td>
              <td class="summary-value"><b>{{ reportData.summary.jumlahKaryawan }}</b></td>
            </tr>
            <tr>
              <td :colspan="6" class="summary-label">Target (2 Jam) / Bulan</td>
              <td class="summary-value"><b>{{ reportData.summary.targetJamBulanan }}</b></td>
            </tr>
             <tr>
              <td :colspan="6" class="summary-label">Acv (%)</td>
              <td class="summary-value"><b>{{ reportData.summary.pencapaian }}</b></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.filter-controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.table-wrapper {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  white-space: nowrap;
}
th {
  background-color: #f2f2f2;
}
tfoot td {
  font-weight: bold;
}
.summary-label {
  text-align: right;
  background-color: #f8f9fa;
}
.summary-value {
  background-color: #e9ecef;
}
/* ... (style lain yang relevan) ... */
</style>