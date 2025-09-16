<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// PASTE URL WEB APP ANDA DARI HASIL DEPLOY TERAKHIR
const apiUrl = 'https://script.google.com/macros/s/AKfycbxCribBpgD2MMag87zZ4vXP7qQRjLlsEqm4sobhGAMK8TAr-piwYasOqAIzOBGEWC0u/exec';

// --- [FINAL] KONFIGURASI TABEL YANG AKURAT ---
// Key di sini sudah dicocokkan dengan header asli Anda setelah dibersihkan oleh Apps Script
const tableHeaders = ref([
    { key: 'judulTraining', label: 'Judul Training', sortable: true },
    { key: 'kompetensiYangDilatih', label: 'Kompetensi', sortable: false },
    { key: 'pemateri', label: 'Pemateri', sortable: true },
    { key: 'tanggalPelaksanaan', label: 'Tanggal', sortable: true },
    { key: 'durasiPelaksanaansatuanJam', label: 'Durasi (Jam)', sortable: true },
    { key: 'lampiranDokumenAbsensiTraining', label: 'Absensi', sortable: false },
    { key: 'lampiranDokumentasi', label: 'Dokumentasi', sortable: false },
    { key: 'timestamp', label: 'Waktu Lapor', sortable: true },
]);

// --- STATE MANAGEMENT ---
const allData = ref([]);
const isLoading = ref(false);
const error = ref(null);

// --- STATE UNTUK FILTER & SORT ---
const searchQuery = ref('');
const sortKey = ref('timestamp');
const sortOrder = ref('desc');

// --- STATE UNTUK PAGINATION ---
const currentPage = ref(1);
const itemsPerPage = ref(10);

// --- COMPUTED PROPERTIES ---
const filteredData = computed(() => {
  if (!searchQuery.value) return allData.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return allData.value.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(lowerCaseQuery)
    )
  );
});

const sortedData = computed(() => {
  const dataToSort = [...filteredData.value];
  if (!sortKey.value) return dataToSort;
  dataToSort.sort((a, b) => {
    const valA = a[sortKey.value];
    const valB = b[sortKey.value];
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  return dataToSort;
});

const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage.value));

const paginatedData = computed(() => {
  if (sortedData.value.length === 0) return [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedData.value.slice(start, end);
});

// --- METHODS ---
const fetchData = async (force = false) => {
  if (allData.value.length > 0 && !force) {
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${apiUrl}?sheet=pelaksanaan`);
    allData.value = response.data;
  } catch (err) {
    error.value = "Gagal memuat data.";
  } finally {
    isLoading.value = false;
  }
};

const forceRefresh = () => {
  currentPage.value = 1;
  searchQuery.value = '';
  fetchData(true);
};

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="card">
    <h2 class="card-title">Data Laporan Pelaksanaan Training</h2>
    <div class="controls-container">
      <input type="text" v-model="searchQuery" placeholder="Cari data..." class="search-input">
      <button @click="forceRefresh" class="btn-refresh">Refresh Data 🔄</button>
    </div>
    <div v-if="isLoading" class="loading-state">Memuat data...</div>
    <div v-if="error" class="error-state">{{ error }}</div>
    <div v-if="!isLoading && !error" class="table-wrapper">
      <table v-if="paginatedData.length > 0">
        <thead>
          <tr>
            <th v-for="header in tableHeaders" :key="header.key" 
                @click="header.sortable ? sortBy(header.key) : null"
                :class="{ sortable: header.sortable, sorted: sortKey === header.key }">
              {{ header.label }}
              <span v-if="sortKey === header.key">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.uid">
            <td v-for="header in tableHeaders" :key="header.key" :data-label="header.label">

            <a v-if="String(row[header.key]).startsWith('http')" :href="row[header.key]" target="_blank" rel="noopener noreferrer">
                Lihat File
            </a>

            <span v-else-if="header.key === 'tanggalPelaksanaan'">
                {{ String(row[header.key]).slice(0, 10) }}
            </span>

            <span v-else>
                {{ row[header.key] }}
            </span>

            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">Tidak ada data yang cocok.</div>
    </div>
    <div v-if="!isLoading && totalPages > 1" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1">Sebelumnya</button>
      <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Selanjutnya</button>
    </div>
  </div>
</template>

<style scoped>
.filter-container { margin-bottom: 1.5rem; }
.search-input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover { background-color: #f0f0f0; }
th.sorted { color: var(--secondary-color, #f36f21); }
.card { background-color: #ffffff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-title { margin-top: 0; }
.table-wrapper { overflow-x: auto; }
.controls-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.search-input {
  flex-grow: 1; /* Biarkan search input memanjang */
}
.btn-refresh {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--primary-color, #004d8c);
  background-color: #fff;
  color: var(--primary-color, #004d8c);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-refresh:hover {
  background-color: #f0f0f0;
}

/* [BARU] Style untuk Pagination */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}
.pagination-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.pagination-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>