<script setup>
import { ref, onMounted, watch, computed } from 'vue'; // Tambahkan computed
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// State untuk form
const divisions = ref([]);
const allTrainingsInPeriod = ref([]); // Menyimpan semua training di periode terpilih
const recordedTitles = ref([]); // Menyimpan judul yang sudah diinput absensinya
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const selectedTraining = ref('');
const participantCounts = ref({});

// State untuk UI feedback
const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref(null);
const successMessage = ref('');

const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));
const years = ref([new Date().getFullYear() -1, new Date().getFullYear(), new Date().getFullYear() + 1]);

// [LOGIKA KUNCI] Computed property untuk menyaring training yang sudah diinput
const availableTrainings = computed(() => {
  const recordedSet = new Set(recordedTitles.value);
  return allTrainingsInPeriod.value.filter(title => !recordedSet.has(title));
});

const toCamelCase = (str) => {
  if (!str) return '';
  const camel = str.replace(/\s+/g, ' ').trim().split(' ').map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join('');
  return camel.replace(/[^a-zA-Z0-9]/g, '');
};

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

const submitForm = async () => {
  isSubmitting.value = true;
  error.value = null;
  successMessage.value = '';

  // 1. Data absensi yang akan dikirim (ini sudah benar)
  const submissionData = {
    judulTraining: selectedTraining.value
  };
  
  divisions.value.forEach(div => {
    const key = toCamelCase("Jumlah Peserta Divisi " + div);
    submissionData[key] = participantCounts.value[div] || 0;
  });

  // 2. [INI PERBAIKANNYA] Kita bungkus data tersebut ke dalam format baru
  const finalPayload = {
    action: 'addAbsensi', // Beri tahu backend tugasnya adalah 'addAbsensi'
    payload: submissionData  // Kirim data absensi di dalam 'payload'
  };

  try {
    // 3. Kirim 'finalPayload' yang sudah lengkap
    const response = await axios.post(apiUrl, finalPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data.status === 'success') {
      successMessage.value = response.data.message;
      selectedTraining.value = '';
      divisions.value.forEach(div => { participantCounts.value[div] = 0; });
      await fetchRecordedTitles();
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    error.value = "Gagal mengirim data: " + err.message;
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchDivisions();
  fetchTrainings();
  fetchRecordedTitles(); // Ambil daftar judul yang sudah ada saat pertama kali
});

watch([selectedMonth, selectedYear], fetchTrainings);
</script>

<template>
  <div class="card">
    <h2 class="card-title">Form Input Absensi Training Internal</h2>
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
</template>

<style scoped>
/* Style Anda tidak berubah, jadi saya singkat di sini */
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
</style>