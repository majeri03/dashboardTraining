<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

// State untuk data utama
const configDivisi = ref([]);
const isLoading = ref(true);
const error = ref(null);

// State untuk modal/form
const isModalOpen = ref(false);
const modalMode = ref('add'); // 'add' atau 'edit'
const currentItem = ref({ divisi: '', jumlahkaryawan: 0 });
const originalDivisiName = ref(''); // Untuk melacak nama asli saat edit
const modalError = ref('');
const isSubmitting = ref(false);


const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${apiUrl}?action=getConfig`);
    configDivisi.value = response.data.divisi;
  } catch (err) {
    error.value = "Gagal memuat data konfigurasi divisi.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

// --- FUNGSI-FUNGSI UNTUK MODAL ---
const openModalForAdd = () => {
  modalMode.value = 'add';
  currentItem.value = { divisi: '', jumlahkaryawan: 0 };
  modalError.value = '';
  isModalOpen.value = true;
};

const openModalForEdit = (item) => {
  modalMode.value = 'edit';
  currentItem.value = { ...item }; // Salin item agar tidak mengubah data asli langsung
  originalDivisiName.value = item.divisi; // Simpan nama asli
  modalError.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

// --- FUNGSI-FUNGSI UNTUK CRUD ---
const handleSubmit = async () => {
  // Validasi
  if (!currentItem.value.divisi.trim()) {
    modalError.value = "Nama Divisi tidak boleh kosong.";
    return;
  }
  if (currentItem.value.jumlahkaryawan <= 0) {
    modalError.value = "Jumlah Karyawan harus lebih dari 0.";
    return;
  }

  isSubmitting.value = true;
  modalError.value = '';

  try {
    let response;
    if (modalMode.value === 'add') {
      const payload = { action: 'addDivisi', payload: currentItem.value };
      response = await axios.post(apiUrl, payload);
    } else {
      const payload = { 
        action: 'updateDivisi', 
        payload: { ...currentItem.value, originalDivisi: originalDivisiName.value }
      };
      response = await axios.post(apiUrl, payload);
    }

    if (response.data.status === 'success') {
      await fetchData(); // Ambil data terbaru dari server
      closeModal();
    } else {
      throw new Error(response.data.message);
    }
  } catch (err) {
    modalError.value = err.message || "Terjadi kesalahan saat menyimpan data.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteItem = async (item) => {
  if (confirm(`Apakah Anda yakin ingin menghapus divisi "${item.divisi}"?`)) {
    try {
      const payload = { action: 'deleteDivisi', payload: { divisi: item.divisi } };
      const response = await axios.post(apiUrl, payload);

      if (response.data.status === 'success') {
        await fetchData(); // Ambil data terbaru
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  }
};
</script>

<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Manajemen Konfigurasi Divisi</h2>
        <button class="btn-add" @click="openModalForAdd">Tambah Divisi</button>
      </div>
      <div v-if="!isLoading && !error" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama Divisi</th>
                <th>Jumlah Karyawan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="configDivisi.length === 0">
                <td colspan="3" class="empty-state">Tidak ada data.</td>
              </tr>
              <tr v-for="item in configDivisi" :key="item.divisi">
                <td>{{ item.divisi }}</td>
                <td>{{ item.jumlahkaryawan }}</td> 
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
        <h3 class="modal-title">{{ modalMode === 'add' ? 'Tambah Divisi Baru' : 'Edit Divisi' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="divisi">Nama Divisi</label>
            <input type="text" id="divisi" v-model="currentItem.divisi" required>
          </div>
          <div class="form-group">
            <label for="jumlah">Jumlah Karyawan</label>
            <input type="number" id="jumlah" v-model.number="currentItem.jumlahkaryawan" required min="1">
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
/* Semua style sama seperti sebelumnya, salin saja dari kode yang saya berikan di respons terakhir */
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
/* Style untuk Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}
.modal-title { margin-top: 0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 6px; }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn-cancel, .btn-save { padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { background-color: #e5e7eb; }
.btn-save { background-color: var(--primary-color, #5356FF); color: white; }
.feedback.error {
    background-color: #fee2e2;
    color: #991b1b;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 1rem;
    text-align: center;
}
</style>