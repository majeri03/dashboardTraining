<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import apiClient from '../api';
import axios from 'axios'; // Tetap dibutuhkan untuk request GET

const apiUrl = import.meta.env.VITE_API_URL;

// --- State untuk Form Input Utama ---
const divisions = ref([]);
const allTrainingsInPeriod = ref([]);
const recordedTitles = ref([]);
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const selectedTraining = ref('');
const participantCounts = ref({});
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref(null);
const successMessage = ref('');

// --- State untuk Modal Data Absensi (Lihat & Kelola) ---
const isDataModalOpen = ref(false);
const allAbsensiData = ref([]);
const isLoadingData = ref(false);
const absensiTableHeaders = ref([]);
const searchQuery = ref(''); // State untuk teks pencarian

// --- State untuk Modal Edit ---
const isEditModalOpen = ref(false);
const currentEditItem = ref(null);
const isUpdating = ref(false);

// --- Data Statis untuk Dropdown ---
const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));
const years = ref([new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]);

// --- Computed Properties ---

// Menyaring training yang belum diinput absensinya
const availableTrainings = computed(() => {
  const recordedSet = new Set(recordedTitles.value);
  return allTrainingsInPeriod.value.filter(title => !recordedSet.has(title));
});

// Menyaring data di dalam modal berdasarkan pencarian
const filteredAbsensiData = computed(() => {
  if (!searchQuery.value) {
    return allAbsensiData.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return allAbsensiData.value.filter(item =>
    item.judulTraining && item.judulTraining.toLowerCase().includes(lowerCaseQuery)
  );
});

// --- Fungsi Helper ---
const toCamelCase = (str) => {
  if (!str) return '';
  const camel = str.replace(/\s+/g, ' ').trim().split(' ').map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
  return camel.replace(/[^a-zA-Z0-9]/g, '');
};

// --- Fungsi Pengambilan Data (GET Requests) ---

const fetchDivisions = async () => {
  try {
    const response = await axios.get(`${apiUrl}?action=getDivisions`);
    divisions.value = response.data;
    divisions.value.forEach(div => { participantCounts.value[div] = 0; });
  } catch (err) { error.value = "Gagal memuat daftar divisi."; }
};

const fetchTrainings = async () => {
  if (!selectedMonth.value || !selectedYear.value) return;
  isLoading.value = true;
  allTrainingsInPeriod.value = [];
  selectedTraining.value = '';
  try {
    const params = { action: 'getTrainingsByMonth', month: selectedMonth.value, year: selectedYear.value };
    const response = await axios.get(apiUrl, { params });
    allTrainingsInPeriod.value = response.data;
  } catch (err) {
    error.value = "Gagal memuat daftar training.";
  } finally {
    isLoading.value = false;
  }
};

const fetchRecordedTitles = async () => {
    try {
        const response = await axios.get(`${apiUrl}?action=getRecordedAbsensiTitles`);
        recordedTitles.value = response.data;
    } catch (err) {
        console.error("Gagal memuat judul training yang sudah direkam:", err);
    }
};

// --- Fungsi Aksi (POST Requests) dengan Metode setTimeout ---

const submitForm = () => { // Hapus 'async' karena kita tidak pakai 'await'
  isSubmitting.value = true;
  error.value = null;
  successMessage.value = '';

  const submissionData = {
    judulTraining: selectedTraining.value
  };
  divisions.value.forEach(div => {
    const key = toCamelCase("Jumlah Peserta Divisi " + div);
    submissionData[key] = participantCounts.value[div] || 0;
  });

  const finalPayload = {
    action: 'addAbsensi',
    payload: submissionData
  };

  try {
    // Kirim data tanpa menunggu respons
    apiClient.post('', finalPayload);

    // ===================================================================
    // LOGIKA BARU: Anggap berhasil setelah jeda 1.5 detik
    // ===================================================================
    setTimeout(() => {
      // Tampilkan pesan sukses dan reset form
      successMessage.value = "Data absensi berhasil disimpan!";
      setTimeout(() => successMessage.value = '', 3000); // Hapus pesan setelah 3 detik

      selectedTraining.value = '';
      divisions.value.forEach(div => { participantCounts.value[div] = 0; });

      // Ambil ulang daftar judul agar dropdown terupdate
      fetchRecordedTitles();

      isSubmitting.value = false;
    }, 1500);

  } catch (err) {
    // Blok ini hanya untuk menangkap error jika pengiriman awal gagal
    error.value = "Gagal mengirim data: " + err.message;
    isSubmitting.value = false;
  }
};

const updateAbsensi = () => {
  isUpdating.value = true;
  try {
    const payload = {
      action: 'updateAbsensi',
      payload: currentEditItem.value
    };
    apiClient.post('', payload);
    
    setTimeout(() => {
      isEditModalOpen.value = false;
      isUpdating.value = false;
      openDataModal(); // Refresh data di modal utama
    }, 1500);

  } catch (err) {
    console.error("Gagal update absensi:", err);
    isUpdating.value = false;
  }
};

const deleteAbsensi = (item) => {
  if (confirm(`Yakin ingin menghapus absensi untuk training "${item.judulTraining}"?`)) {
    try {
      const payload = {
        action: 'deleteAbsensi',
        payload: { judulTraining: item.judulTraining }
      };
      apiClient.post('', payload);
      
      setTimeout(() => {
        openDataModal(); // Refresh data
      }, 1500);

    } catch (err) {
      console.error("Gagal menghapus absensi:", err);
    }
  }
};

// --- Fungsi untuk Modal ---
const openDataModal = async () => {
  isDataModalOpen.value = true;
  isLoadingData.value = true;
  searchQuery.value = ''; // Reset pencarian setiap kali modal dibuka
  try {
    const response = await axios.get(`${apiUrl}?action=getAbsensiData`);
    allAbsensiData.value = response.data;
    if (response.data.length > 0) {
      absensiTableHeaders.value = Object.keys(response.data[0]);
    }
  } catch (err) {
    error.value = "Gagal memuat data absensi.";
  } finally {
    isLoadingData.value = false;
  }
};

const openEditModal = (item) => {
  currentEditItem.value = JSON.parse(JSON.stringify(item));
  isEditModalOpen.value = true;
  isDataModalOpen.value = false;
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchDivisions();
  fetchTrainings();
  fetchRecordedTitles();
});

watch([selectedMonth, selectedYear], fetchTrainings);

watch([isDataModalOpen, isEditModalOpen], ([dataOpen, editOpen]) => {
  const anyOpen = dataOpen || editOpen;
  document.body.classList.toggle('no-scroll', anyOpen);
});

</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Form Input Absensi Training Internal</h2>
      <button class="btn-secondary" @click="openDataModal">Lihat & Kelola Data</button>
    </div>
    <p>Gunakan form ini untuk mencatat jumlah peserta dari setiap divisi yang mengikuti training internal.</p>

    <form @submit.prevent="submitForm">
      <div class="form-group filter-group">
        <label>Pilih Periode Training:</label>
        <select v-model="selectedMonth">
          <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
        </select>
        <select v-model="selectedYear">
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="training-title">Judul Training</label>
        <div v-if="isLoading">Memuat training...</div>
        <select v-else id="training-title" v-model="selectedTraining" required>
          <option disabled value="">-- Pilih Judul Training --</option>
          <option v-for="title in availableTrainings" :key="title" :value="title">{{ title }}</option>
          <option v-if="availableTrainings.length === 0" disabled>Tidak ada training yang perlu diinput absensinya</option>
        </select>
      </div>

      <fieldset class="division-fieldset">
        <legend>Jumlah Peserta per Divisi</legend>
        <div class="division-grid">
          <div v-for="div in divisions" :key="div" class="form-group-inline">
            <label :for="div">{{ div }}</label>
            <input type="number" :id="div" v-model.number="participantCounts[div]" min="0" />
          </div>
        </div>
      </fieldset>

      <button type="submit" :disabled="isSubmitting || !selectedTraining">
        {{ isSubmitting ? 'Mengirim...' : 'Simpan Absensi' }}
      </button>

      <div v-if="successMessage" class="feedback success">{{ successMessage }}</div>
      <div v-if="error" class="feedback error">{{ error }}</div>
    </form>
  </div>

  <div v-if="isDataModalOpen" class="modal-overlay" @click.self="isDataModalOpen = false">
    <div class="modal-content modal-lg">
      <h3 class="modal-title">Data Absensi Internal Tercatat</h3>
      
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Cari berdasarkan judul training..." class="search-input">
      </div>

      <div v-if="isLoadingData" class="loading-state">Memuat data...</div>
      <div v-else-if="filteredAbsensiData.length === 0" class="empty-state">
        <span v-if="searchQuery">Tidak ada data yang cocok dengan pencarian "{{ searchQuery }}".</span>
        <span v-else>Belum ada data absensi.</span>
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="header in absensiTableHeaders" :key="header">{{ header.replace(/([A-Z])/g, ' $1').trim() }}</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredAbsensiData" :key="index">
              <td v-for="header in absensiTableHeaders" :key="header">{{ item[header] }}</td>
              <td class="action-buttons">
                <button class="btn-edit" @click="openEditModal(item)">Edit</button>
                <button class="btn-delete" @click="deleteAbsensi(item)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="isDataModalOpen = false">Tutup</button>
      </div>
    </div>
  </div>

  <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
    <div class="modal-content" v-if="currentEditItem">
      <h3 class="modal-title">Edit Absensi: {{ currentEditItem.judulTraining }}</h3>
      <form @submit.prevent="updateAbsensi">
        <div v-for="(value, key) in currentEditItem" :key="key">
          <div v-if="key.toLowerCase().startsWith('jumlahpeserta')" class="form-group">
            <label :for="key">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</label>
            <input type="number" :id="key" v-model.number="currentEditItem[key]" min="0" />
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="isEditModalOpen = false; openDataModal();">Batal</button>
          <button type="submit" class="btn-save" :disabled="isUpdating">{{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card { max-width: 800px; margin: auto; }
.form-group { margin-bottom: 1.5rem; }
.form-group label, .filter-group label, fieldset legend {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}
select, input[type="number"] {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  flex-wrap: wrap;
}
.filter-group label { margin-bottom: 0; }
.filter-group select { width: auto; flex-grow: 1; }
.division-fieldset {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.division-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.form-group-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-group-inline label { flex-basis: 60%; margin-bottom: 0;}
.form-group-inline input { flex-basis: 40%; }
button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 6px;
  background-color: var(--primary-color, #ff5353);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover { background-color: #4346e0; }
button:disabled { background-color: #ff8a8a; cursor: not-allowed; }
.feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  font-weight: 500;
}
.success { background-color: #d1fae5; color: #065f46; }
.error { background-color: #fee2e2; color: #991b1b; }

/* --- Style Baru untuk Modal dan Pencarian --- */
.search-container {
  margin-bottom: 1rem;
}
.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}
.card-header { display: flex; justify-content: space-between; align-items: center; }
.btn-secondary { background-color: #6c757d; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; }
.modal-overlay { position: fixed; inset: 0;  background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; padding: 1rem;  z-index: 1000; }
.modal-content { background-color: white; padding: 1.25rem; border-radius: 10px; width: 90%; max-width: 500px; max-height: calc(100vh - 2rem);overflow: auto; overflow: auto; overscroll-behavior: contain; }
.modal-lg { max-width: 900px; }
.modal-title { margin-top: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-cancel, .btn-save, .btn-edit, .btn-delete { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { background-color: #e5e7eb; }
.btn-save { background-color: var(--primary-color, #5356FF); color: white; }
.btn-edit { background-color: #F59E0B; color: white; padding: 0.5rem 1rem; }
.btn-delete { background-color: #EF4444; color: white; padding: 0.5rem 1rem; }
.table-wrapper { max-height: 60vh; overflow: auto; }
.action-buttons { display: flex; gap: 0.5rem; }
.loading-state, .empty-state { text-align: center; padding: 2rem; color: #6b7280; }
@media (max-width: 640px){
  .modal-content{ padding: 1rem; border-radius: 8px; }
  
}
.no-scroll{ overflow: hidden; }
</style>