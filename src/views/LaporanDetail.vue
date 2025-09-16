<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const apiUrl = 'https://script.google.com/macros/s/AKfycbxCribBpgD2MMag87zZ4vXP7qQRjLlsEqm4sobhGAMK8TAr-piwYasOqAIzOBGEWC0u/exec'; // <-- GANTI DENGAN URL ANDA

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
/* Styling Kartu Utama */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color, #004d8c);
}

/* Styling untuk Filter Dropdown */
.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}
.filter-controls select {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  font-weight: 500;
}

/* Wrapper agar tabel bisa di-scroll horizontal */
.table-wrapper {
  overflow-x: auto;
}

/* Styling Tabel */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  border: 1px solid #dee2e6;
  padding: 8px 10px;
  text-align: center;
  white-space: nowrap; /* Agar teks tidak turun baris */
}
thead th {
  background-color: #f2f2f2;
  font-weight: 600;
}
tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* Styling untuk Footer Tabel (Ringkasan) */
tfoot td {
  font-weight: bold;
  background-color: #e9ecef;
}
tfoot .summary-label {
  text-align: right;
  background-color: #f8f9fa;
  padding-right: 1rem;
}
tfoot .summary-value {
  color: var(--primary-color, #004d8c);
  font-size: 1.1em;
}

/* Loading & Error State */
.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #777;
}
.error-state {
  color: #d32f2f;
}
</style>