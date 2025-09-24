<script setup>
import { ref, onMounted, computed, watch, inject } from 'vue';
import axios from 'axios';
import apiClient from '../api';

const apiUrl = import.meta.env.VITE_API_URL;
const showNotification = inject('showNotification');

// --- State ---
const allConfigs = ref([]); // Menyimpan semua data konfigurasi dari server
const allDivisions = ref([]); // Menyimpan daftar nama divisi
const isLoading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);

const now = new Date();
const selectedYear = ref(now.getFullYear());
const selectedMonth = ref(now.toLocaleString('id-ID', { month: 'long' }));

// State untuk form
const monthlyData = ref([]);
const targetPerOrang = ref(0);

// --- Computed Properties ---
const availableYears = computed(() => {
  if (allConfigs.value.length === 0) return [new Date().getFullYear()];
  const yearsInDb = allConfigs.value.map(item => item.tahun);
  return [...new Set([new Date().getFullYear(), ...yearsInDb])].sort((a, b) => b - a);
});

const months = ref(['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']);

// --- Functions ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Ambil semua data sekaligus
    const [configResponse, divisiResponse] = await Promise.all([
      axios.get(`${apiUrl}?action=getConfig`),
      axios.get(`${apiUrl}?action=getDivisions`)
    ]);
    allConfigs.value = configResponse.data.bulanan;
    allDivisions.value = divisiResponse.data;

    // Setelah data utama didapat, panggil fungsi untuk menyiapkan form
    prepareFormData();

  } catch (err) {
    console.error("Gagal memuat data awal:", err);
    error.value = "Gagal memuat data konfigurasi.";
  } finally {
    isLoading.value = false;
  }
};

const prepareFormData = () => {
  const configsForPeriod = allConfigs.value.filter(
    c => c.tahun == selectedYear.value && c.bulan === selectedMonth.value
  );

  if (configsForPeriod.length > 0) {
    // Jika data untuk periode ini sudah ada, gunakan itu
    targetPerOrang.value = configsForPeriod[0].targetperorang || 0;
    monthlyData.value = allDivisions.value.map(divName => {
      const existingConfig = configsForPeriod.find(c => c.divisi === divName);
      return {
        divisi: divName,
        jumlahkaryawan: existingConfig ? existingConfig.jumlahkaryawan : 0,
      };
    });
  } else {
    // Jika tidak ada, buat data baru berdasarkan bulan sebelumnya (Logika Kaskade Frontend)
    const targetDate = new Date(`${selectedMonth.value} 1, ${selectedYear.value}`);
    let lastMonthDate = new Date(targetDate);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const lastMonthName = lastMonthDate.toLocaleString('id-ID', { month: 'long' });
    const lastMonthYear = lastMonthDate.getFullYear();

    const configsForLastMonth = allConfigs.value.filter(
      c => c.tahun == lastMonthYear && c.bulan === lastMonthName
    );

    if (configsForLastMonth.length > 0) {
        targetPerOrang.value = configsForLastMonth[0].targetperorang || 0;
        monthlyData.value = allDivisions.value.map(divName => {
        const lastConfig = configsForLastMonth.find(c => c.divisi === divName);
        return {
          divisi: divName,
          jumlahkaryawan: lastConfig ? lastConfig.jumlahkaryawan : 0
        };
      });
    } else {
      // Fallback jika tidak ada data sama sekali
      targetPerOrang.value = 0;
      monthlyData.value = allDivisions.value.map(divName => ({
        divisi: divName,
        jumlahkaryawan: 0
      }));
    }
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      action: 'updateKonfigurasiBulanan',
      payload: {
        tahun: selectedYear.value,
        bulan: selectedMonth.value,
        configs: monthlyData.value.map(div => ({
          divisi: div.divisi,
          jumlahkaryawan: div.jumlahkaryawan,
          targetperorang: targetPerOrang.value
        }))
      }
    };
    
    await apiClient.post('', payload);
    
    // Beri jeda agar server sempat memproses sebelum fetch ulang
    setTimeout(() => {
        fetchData(); // Ambil data terbaru dari server
        showNotification('Konfigurasi berhasil disimpan!', 'success');
        isSubmitting.value = false;
    }, 1500);

  } catch (err) {
    showNotification('Gagal menyimpan konfigurasi.', 'error');
    isSubmitting.value = false;
  }
};

onMounted(fetchData);
watch([selectedYear, selectedMonth], prepareFormData);

</script>

<template>
  <div>
    <div class="card">
      <h2 class="card-title">Manajemen Konfigurasi Bulanan</h2>
      <p class="card-subtitle">
        Pilih periode untuk melihat atau mengedit jumlah karyawan per divisi dan target bulanan.
        Jika data untuk bulan yang dipilih belum ada, sistem akan otomatis mengisinya berdasarkan data bulan sebelumnya.
      </p>

      <div class="filter-container">
        <label for="month-filter">Periode:</label>
        <select id="month-filter" v-model="selectedMonth">
          <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
        </select>
        <select id="year-filter" v-model="selectedYear">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="config-grid">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Divisi / Unit Bisnis</th>
                  <th>Jumlah Karyawan (MP)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in monthlyData" :key="item.divisi">
                  <td>{{ item.divisi }}</td>
                  <td>
                    <input type="number" v-model.number="item.jumlahkaryawan" min="0" required />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="target-section">
            <div class="form-group">
              <label for="target">Target per Orang (Jam)</label>
              <input type="number" id="target" v-model.number="targetPerOrang" min="0" step="0.1" required />
            </div>
             <button type="submit" class="btn-save" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card { background-color: #ffffff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-title { margin: 0; }
.card-subtitle { margin-top: 0.5rem; margin-bottom: 1.5rem; font-size: 0.9em; color: #6b7280; }
.filter-container { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #f9fafb; border-radius: 6px; }
.filter-container label { font-weight: 500; }
.filter-container select { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
.loading-container { display: flex; justify-content: center; align-items: center; padding: 4rem; }
.spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: var(--primary-color, #5356FF); animation: spin 1s ease infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.error-state { text-align: center; padding: 2rem; color: #d32f2f; font-weight: bold; }

.config-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem; border: 1px solid #e5e7eb; text-align: left; }
th { background-color: #f9fafb; }
td input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.target-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; }

.btn-save {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  background-color: var(--primary-color, #5356FF);
  color: white;
}
.btn-save:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>