<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = 'https://script.google.com/macros/s/AKfycbxCribBpgD2MMag87zZ4vXP7qQRjLlsEqm4sobhGAMK8TAr-piwYasOqAIzOBGEWC0u/exec'; // <-- GANTI DENGAN URL ANDA

const rekapInternal = ref([]);
const rekapExternal = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${apiUrl}?action=rekap`);
    rekapInternal.value = response.data.internal;
    rekapExternal.value = response.data.external;
  } catch (err) {
    error.value = "Gagal memuat data rekapitulasi.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div v-if="isLoading">Memuat data rekapitulasi...</div>
    <div v-if="error">{{ error }}</div>

    <div v-if="!isLoading">
      <div class="card">
        <h2 class="card-title">Rekapitulasi Training Internal (per Divisi)</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Divisi</th>
                <th>Jumlah Karyawan</th>
                <th>Jumlah Peserta Ikut</th>
                <th>Total Jam Training</th>
                <th>Rata-rata Jam / Karyawan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rekapInternal" :key="item.divisi">
                <td><b>{{ item.divisi }}</b></td>
                <td>{{ item.jumlahKaryawan }}</td>
                <td>{{ item.jumlahPeserta }}</td>
                <td>{{ item.totalJam.toFixed(1) }}</td>
                <td><b>{{ item.rataRataJam }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top: 2rem;">
        <h2 class="card-title">Rekapitulasi Training External (per Bulan)</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Bulan</th>
                <th>Jumlah Jenis Training</th>
                <th>Total Peserta Ikut</th>
                <th>Total Jam Training</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rekapExternal" :key="item.bulan">
                <td><b>{{ item.bulan }}</b></td>
                <td>{{ item.jumlahTraining }}</td>
                <td>{{ item.totalPeserta }}</td>
                <td>{{ item.totalJam.toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
  margin-bottom: 2rem;
}

.card-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--primary-color, #004d8c);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* Wrapper agar tabel bisa di-scroll horizontal di layar kecil */
.table-wrapper {
  overflow-x: auto;
}

/* Styling Tabel */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th, td {
  padding: 0.8rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

/* Memberi penekanan pada data penting */
td b {
  color: var(--primary-color, #004d8c);
  font-size: 1.05em;
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