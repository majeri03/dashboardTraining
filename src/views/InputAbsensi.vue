<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import apiClient from '../api';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// --- State Utama ---
const allTrainingsInPeriod = ref([]);
const recordedTitles = ref([]);
const allKaryawan = ref([]);
const divisions = ref([]);

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const selectedTraining = ref('');
const selectedPeserta = ref([]);

// --- State untuk Form Tambah Peserta & Pencarian ---
const searchQuery = ref(''); // <-- Untuk teks pencarian karyawan

// --- State UI & Feedback ---
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref(null);
const successMessage = ref('');

// --- Data Statis ---
const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));
const years = ref([new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1]);

// --- Computed Properties ---
const availableTrainings = computed(() => {
  const recordedSet = new Set(recordedTitles.value);
  return allTrainingsInPeriod.value.filter(title => !recordedSet.has(title));
});

// Filter karyawan berdasarkan pencarian & pastikan belum ditambahkan
const filteredKaryawan = computed(() => {
  if (searchQuery.value.length < 2) return [];
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  
  return allKaryawan.value.filter(k => 
    (k.nama.toLowerCase().includes(lowerCaseQuery) || k.divisi.toLowerCase().includes(lowerCaseQuery)) &&
    !selectedPeserta.value.some(p => p.nama === k.nama)
  );
});

// Menghitung jumlah peserta per divisi yang sudah dipilih
const pesertaPerDivisi = computed(() => {
    const counts = {};
    selectedPeserta.value.forEach(peserta => {
        if (!counts[peserta.divisi]) {
            counts[peserta.divisi] = 0;
        }
        counts[peserta.divisi]++;
    });
    return Object.entries(counts).map(([divisi, jumlah]) => ({ divisi, jumlah })).sort((a, b) => a.divisi.localeCompare(b.divisi));
});


// --- Fungsi Pengambilan Data (GET) ---
const fetchDataOnMount = async () => {
  isLoading.value = true;
  try {
    const [divisiRes, karyawanRes, trainingRes, recordedRes] = await Promise.all([
      axios.get(`${apiUrl}?action=getDivisions`),
      axios.get(`${apiUrl}?action=getKaryawan`),
      axios.get(apiUrl, { params: { action: 'getTrainingsByMonth', month: selectedMonth.value, year: selectedYear.value } }),
      axios.get(`${apiUrl}?action=getRecordedAbsensiTitles`) // Anda mungkin perlu fungsi ini
    ]);
    divisions.value = divisiRes.data;
    allKaryawan.value = karyawanRes.data;
    allTrainingsInPeriod.value = trainingRes.data;
    recordedTitles.value = recordedRes.data;
  } catch (err) {
    error.value = "Gagal memuat data awal. Pastikan backend berjalan dan sheet 'DatabaseKaryawan' sudah ada.";
  } finally {
    isLoading.value = false;
  }
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

// --- Logika Form ---
const addPeserta = (karyawan) => {
  if (!selectedPeserta.value.some(p => p.nama === karyawan.nama)) {
    selectedPeserta.value.push(karyawan);
  }
  searchQuery.value = ''; // Kosongkan pencarian setelah menambah
};

const removePeserta = (index) => {
  selectedPeserta.value.splice(index, 1);
};

const resetForm = () => {
  selectedTraining.value = '';
  selectedPeserta.value = [];
  searchQuery.value = '';
};

// --- Fungsi Pengiriman Data (POST) ---
const submitForm = () => {
  isSubmitting.value = true;
  error.value = null;
  successMessage.value = '';
  const finalPayload = {
    action: 'addAbsensi',
    payload: {
      judulTraining: selectedTraining.value,
      peserta: selectedPeserta.value
    }
  };
  try {
    apiClient.post('', finalPayload);
    setTimeout(() => {
      successMessage.value = "Data absensi berhasil disimpan!";
      setTimeout(() => successMessage.value = '', 4000);
      fetchDataOnMount();
      resetForm();
      isSubmitting.value = false;
    }, 1500);
  } catch (err) {
    error.value = "Gagal mengirim data: " + err.message;
    isSubmitting.value = false;
  }
};

// --- Lifecycle & Watchers ---
onMounted(fetchDataOnMount);
watch([selectedMonth, selectedYear], fetchTrainings);
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Form Input Absensi Training Internal</h2>
    </div>
    <p>Gunakan form ini untuk mencatat nama-nama peserta dari setiap divisi yang mengikuti training internal.</p>

    <form @submit.prevent="submitForm">
      <fieldset class="form-section">
        <legend>1. Pilih Training</legend>
        <div class="form-group filter-group">
          <label>Periode Training:</label>
          <select v-model="selectedMonth"><option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option></select>
          <select v-model="selectedYear"><option v-for="year in years" :key="year" :value="year">{{ year }}</option></select>
        </div>
        <div class="form-group">
          <label for="training-title">Judul Training</label>
          <div v-if="isLoading">Memuat training...</div>
          <select v-else id="training-title" v-model="selectedTraining" required>
            <option disabled value="">-- Pilih Judul Training --</option>
            <option v-for="title in availableTrainings" :key="title" :value="title">{{ title }}</option>
            <option v-if="!isLoading && availableTrainings.length === 0" disabled>Tidak ada training baru untuk diinput absensinya di periode ini.</option>
          </select>
        </div>
      </fieldset>

      <fieldset class="form-section" :disabled="!selectedTraining">
        <legend>2. Cari dan Tambah Peserta</legend>
        <div class="form-group">
          <label for="karyawan-search">Ketik nama atau divisi karyawan (min. 2 huruf)</label>
          <input 
            type="text" 
            id="karyawan-search" 
            v-model="searchQuery"
            placeholder="Contoh: Budi atau IT"
            autocomplete="off"
          />
          <div v-if="filteredKaryawan.length > 0" class="search-results">
            <div 
              v-for="k in filteredKaryawan" 
              :key="k.nama" 
              class="search-item"
              @click="addPeserta(k)">
              <strong>{{ k.nama }}</strong> - <span>{{ k.divisi }}</span>
            </div>
          </div>
        </div>
      </fieldset>
      
      <fieldset class="form-section" v-if="selectedPeserta.length > 0">
        <legend>3. Daftar Hadir (Total: {{ selectedPeserta.length }} Orang)</legend>
        <div class="participant-summary-grid">
            <div class="participant-list">
                <div v-for="(peserta, index) in selectedPeserta" :key="index" class="participant-tag">
                    <span>{{ peserta.nama }} ({{ peserta.divisi }})</span>
                    <button type="button" @click="removePeserta(index)" class="btn-remove">×</button>
                </div>
            </div>
            <div class="summary-box">
                <h4>Ringkasan per Divisi</h4>
                <ul>
                    <li v-for="summary in pesertaPerDivisi" :key="summary.divisi">
                        <span>{{ summary.divisi }}:</span>
                        <strong>{{ summary.jumlah }} orang</strong>
                    </li>
                </ul>
            </div>
        </div>
      </fieldset>

      <button type="submit" :disabled="isSubmitting || !selectedTraining || selectedPeserta.length === 0">
        {{ isSubmitting ? 'Menyimpan...' : 'Simpan Absensi' }}
      </button>

      <div v-if="successMessage" class="feedback success">{{ successMessage }}</div>
      <div v-if="error" class="feedback error">{{ error }}</div>
    </form>
  </div>
</template>

<style scoped>
.card { max-width: 900px; margin: auto; }
.form-group { position: relative; margin-bottom: 1.5rem; display: flex; flex-direction: column;}
label { margin-bottom: 0.5rem; font-weight: 600; color: #374151; }
select, input { width: 100%; padding: 0.75rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; box-sizing: border-box; }
button { padding: 1rem; border: none; border-radius: 6px; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
button:disabled { background-color: #ff8a8a; cursor: not-allowed; }
.form-section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
.form-section:disabled { opacity: 0.5; background-color: #f9fafb; }
.form-section legend { font-weight: 700; font-size: 1.1rem; padding: 0 0.5rem; color: var(--primary-color, #d10000); }
.filter-group { flex-direction: row; align-items: center; gap: 1rem; background-color: #f9fafb; padding: 1rem; border-radius: 8px; flex-wrap: wrap; }
.filter-group label { margin-bottom: 0; }
.filter-group select { width: auto; flex-grow: 1; }
button[type="submit"] { background-color: var(--primary-color, #d10000); }
button[type="submit"]:hover { background-color: #a10000; }
.feedback { margin-top: 1rem; padding: 1rem; border-radius: 6px; font-weight: 500; }
.success { background-color: #d1fae5; color: #065f46; }
.error { background-color: #fee2e2; color: #991b1b; }

/* --- STYLE BARU UNTUK PENCARIAN --- */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.search-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
}
.search-item:hover {
  background-color: #f3f4f6;
}
.search-item span {
  color: #6b7280;
}

/* --- STYLE BARU UNTUK DAFTAR & RINGKASAN --- */
.participant-summary-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    align-items: flex-start;
}
.participant-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.participant-tag { display: flex; align-items: center; background-color: #eef2ff; color: #4338ca; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.9rem; font-weight: 500; }
.btn-remove { background: none; border: none; color: #6366f1; cursor: pointer; font-size: 1.2rem; font-weight: bold; padding: 0 0 0 0.5rem; line-height: 1; }
.btn-remove:hover { color: #4338ca; }

.summary-box {
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
}
.summary-box h4 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
}
.summary-box ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.9rem;
}
.summary-box li {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
}

@media (max-width: 768px) {
  .participant-summary-grid { grid-template-columns: 1fr; }
}
</style>