<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = 'https://script.google.com/macros/s/AKfycbxhIy3tfOItHh6ChO1XSXBeYO4d8dBKyuOGD-pPgrGKzlXhGLbKrARWtiba1DOUt22G/exec'; // <-- GANTI DENGAN URL ANDA

const rekapBulanan = ref([]);
const rekapDivisi = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Panggil action 'rekap' yang baru kita buat
    const response = await axios.get(`${apiUrl}?action=rekap`);
    rekapBulanan.value = response.data.bulanan;
    rekapDivisi.value = response.data.divisi;
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
    <div class="card">
      <h2 class="card-title">Rekapitulasi Training Bulanan</h2>
      <div v-if="isLoading">Memuat data...</div>
      <div v-if="error">{{ error }}</div>
      <div v-if="!isLoading" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Jumlah Karyawan</th>
              <th>Target Jam</th>
              <th>Realisasi Jam</th>
              <th>% Pencapaian</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rekapBulanan" :key="item.bulan">
              <td>{{ item.bulan }}</td>
              <td>{{ item.jumlahKaryawan }}</td>
              <td>{{ item.targetJam }}</td>
              <td>{{ item.realisasiJam.toFixed(1) }}</td>
              <td><b>{{ item.pencapaian }}</b></td>
              <td>{{ item.keterangan }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h2 class="card-title">Rekapitulasi Peserta per Divisi</h2>
      <div v-if="isLoading">Memuat data...</div>
      <div v-if="error">{{ error }}</div>
      <div v-if="!isLoading" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Divisi</th>
              <th>Jumlah Karyawan</th>
              <th>Realisasi Ikut Training</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rekapDivisi" :key="item.divisi">
              <td>{{ item.divisi }}</td>
              <td>{{ item.jumlahKaryawan }}</td>
              <td>{{ item.realisasiIkut }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Anda bisa gunakan style .card dan .table-wrapper yang sudah ada di style global App.vue */
.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-title { margin-top: 0; }
.table-wrapper { overflow-x: auto; }
/* ... (style tabel lainnya) ... */
</style>