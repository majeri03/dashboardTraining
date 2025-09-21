<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import axios from 'axios';
import apiClient from '../api';
const apiUrl = import.meta.env.VITE_API_URL;
const showNotification = inject('showNotification');
// State untuk data utama
const configBulanan = ref([]);
const isLoading = ref(true);
const error = ref(null);

// State untuk modal
const isModalOpen = ref(false);
const modalMode = ref('add');
const currentItem = ref({ tahun: new Date().getFullYear(), bulan: '', jumlahkaryawan: 0, targetperorang: 0 });
const originalItem = ref(null); // Untuk melacak data asli saat edit
const modalError = ref('');
const isSubmitting = ref(false);

const selectedYear = ref('');

// Buat daftar tahun unik dari data yang ada untuk opsi dropdown
const availableYears = computed(() => {
  const years = configBulanan.value.map(item => item.tahun);
  return [...new Set(years)].sort((a, b) => b - a); // Urutkan dari terbaru
});

// Ini adalah data yang akan ditampilkan di tabel, sudah terfilter
const filteredData = computed(() => {
  // JANGAN tampilkan apapun jika selectedYear kosong
  if (!selectedYear.value) {
    return []; 
  }
  return configBulanan.value.filter(item => item.tahun == selectedYear.value);
});

// Opsi untuk dropdown
const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4, currentYear + 5];
});
const months = ref(['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${apiUrl}?action=getConfig`);
    configBulanan.value = response.data.bulanan;
  } catch (err) {
    error.value = "Gagal memuat data konfigurasi bulanan.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const openModalForAdd = () => {
  modalMode.value = 'add';
  currentItem.value = { tahun: new Date().getFullYear(), bulan: 'Januari', jumlahkaryawan: 0, targetperorang: 0 };
  modalError.value = '';
  isModalOpen.value = true;
};

const openModalForEdit = (item) => {
  modalMode.value = 'edit';
  currentItem.value = { ...item };
  originalItem.value = { ...item }; // Simpan data asli
  modalError.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  if (currentItem.value.jumlahkaryawan <= 0 || currentItem.value.targetperorang <= 0) {
    modalError.value = "Jumlah dan Target harus lebih dari 0.";
    return;
  }

  isSubmitting.value = true;
  modalError.value = '';

  try {
    let response;
    if (modalMode.value === 'add') {
      const payload = { action: 'addBulanan', payload: currentItem.value };
      response = await apiClient.post('', payload);
    } else {
      const payload = { 
        action: 'updateBulanan', 
        payload: { 
          ...currentItem.value, 
          originalTahun: originalItem.value.tahun,
          originalBulan: originalItem.value.bulan
        }
      };
      response = await apiClient.post('', payload);
    }

    if (response.data.status === 'success') {
      await fetchData();
      closeModal();
      showNotification(response.data.message, 'success');
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    showNotification(err.message || "Terjadi kesalahan.", 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItem = async (item) => {
  if (confirm(`Yakin hapus konfigurasi untuk ${item.bulan} ${item.tahun}?`)) {
    try {
      const payload = { action: 'deleteBulanan', payload: { tahun: item.tahun, bulan: item.bulan } };
      const response = await apiClient.post('', payload);

      if (response.data.status === 'success') {
        await fetchData();
        showNotification(response.data.message, 'success');
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      showNotification("Gagal menghapus: " + err.message, 'error');
    }
  }
};
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Manajemen Konfigurasi Bulanan</h2>
        <button class="btn-add" @click="openModalForAdd">Tambah Periode</button>
      </div>

      <div class="filter-container">
        <label for="year-filter">Filter Berdasarkan Tahun:</label>
        <select id="year-filter" v-model="selectedYear">
          <option disabled value="">-- Pilih Tahun --</option>
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="!selectedYear" class="empty-state">
        <p>Silakan pilih tahun terlebih dahulu untuk menampilkan data.</p>
      </div>

      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tahun</th>
              <th>Bulan</th>
              <th>Jumlah Karyawan</th>
              <th>Target per Orang (Jam)</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length === 0">
              <td colspan="5" class="empty-state">Tidak ada data konfigurasi untuk tahun {{ selectedYear }}.</td>
            </tr>
            <tr v-else v-for="item in filteredData" :key="`${item.tahun}-${item.bulan}`">
              <td>{{ item.tahun }}</td>
              <td>{{ item.bulan }}</td>
              <td>{{ item.jumlahkaryawan }}</td>
              <td>{{ item.targetperorang }}</td>
              <td class="action-buttons">
                <button class="btn-edit" @click="openModalForEdit(item)">Edit</button>
                <button class="btn-delete" @click="deleteItem(item)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">{{ modalMode === 'add' ? 'Tambah Periode Baru' : 'Edit Periode' }}</h3>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="tahun">Tahun</label>
              <select id="tahun" v-model="currentItem.tahun">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="bulan">Bulan</label>
              <select id="bulan" v-model="currentItem.bulan">
                <option v-for="month in months" :key="month" :value="month">{{ month }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="jumlah">Jumlah Karyawan</label>
            <input type="number" id="jumlah" v-model.number="currentItem.jumlahkaryawan" required min="1">
          </div>
          <div class="form-group">
            <label for="target">Target per Orang (Jam)</label>
            <input type="number" id="target" v-model.number="currentItem.targetperorang" required min="1" step="0.1">
          </div>

          <div v-if="modalError" class="feedback error">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Batal</button>
            <button type="submit" class="btn-save" :disabled="isSubmitting">
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Gunakan style yang sama persis dengan KonfigurasiDivisi.vue */
.card { background-color: #ffffff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.card-title { margin: 0; }
.table-wrapper { overflow-x: auto; }
.action-buttons { display: flex; gap: 0.5rem; }
.btn-add, .btn-edit, .btn-delete { padding: 0.5rem 1rem; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: 500; }
.btn-add { background-color: #10B981; }
.btn-edit { background-color: #F59E0B; }
.btn-delete { background-color: #EF4444; }
.loading-state, .error-state, .empty-state { text-align: center; padding: 2rem; font-size: 1.1rem; color: #777; }
.error-state { color: #d32f2f; font-weight: bold; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 500px; }
.modal-title { margin-top: 0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-cancel, .btn-save { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { background-color: #e5e7eb; }
.btn-save { background-color: var(--primary-color, #5356FF); color: white; }
.feedback.error { background-color: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 6px; margin-top: 1rem; text-align: center; }
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color, #5356FF);
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.filter-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 6px;
}

.filter-container label {
  font-weight: 500;
}

.filter-container select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>