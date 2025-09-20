<script setup>
import { ref, inject } from 'vue';

// --- KONFIGURASI PENTING ---
// Karena keduanya tidak bisa di-embed, kita hanya butuh URL untuk dibagikan.

// 1. Formulir Evaluasi (Publik)
const evaluasiShareUrl = ref('https://forms.gle/okCzMCPcazj4TVSX8');

// 2. Formulir Internal Pelaksanaan (Panitia)
const internalShareUrl = ref('https://forms.gle/FzQYu9i9JNVzacfx8');

const showNotification = inject('showNotification');

// Fungsi generik untuk menyalin link
const copyToClipboard = (url, formName) => {
  if (!url || url.startsWith('GANTI_DENGAN')) {
    showNotification('URL belum diatur di dalam kode!', 'error');
    return;
  }
  navigator.clipboard.writeText(url).then(() => {
    showNotification(`Link Formulir ${formName} berhasil disalin!`, 'success');
  }).catch(err => {
    showNotification('Gagal menyalin link.', 'error');
  });
};

// Fungsi generik untuk berbagi
const shareLink = async (url, formName, description) => {
  if (!url || url.startsWith('GANTI_DENGAN')) {
    showNotification('URL belum diatur di dalam kode!', 'error');
    return;
  }
  const shareData = {
    title: `Formulir ${formName}`,
    text: description,
    url: url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      copyToClipboard(url, formName);
      showNotification('Fitur share tidak didukung. Link telah disalin.', 'success');
    }
  } catch (err) {
    console.error('Error sharing:', err);
  }
};
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Akses Cepat Google Forms</h1>
    
    <div class="forms-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Formulir Evaluasi (Publik)</h2>
        </div>
        
        <div class="no-embed-placeholder">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h3 class="no-embed-title">Harus Dibuka di Tab Baru</h3>
          <p class="no-embed-text">Karena berisi fitur upload file, formulir ini tidak dapat ditampilkan di sini.</p>
          <a :href="evaluasiShareUrl" target="_blank" class="open-new-tab-btn-main">
            Buka Formulir Evaluasi
          </a>
        </div>
        
        <div class="share-section">
          <h3 class="share-title">Bagikan Link</h3>
          <div class="share-input-group">
            <input type="text" :value="evaluasiShareUrl" readonly />
            <button @click="copyToClipboard(evaluasiShareUrl, 'Evaluasi')" title="Salin Link">Salin</button>
          </div>
          <div class="share-buttons">
            <a :href="`https://api.whatsapp.com/send?text=Mohon isi formulir evaluasi training berikut: ${evaluasiShareUrl}`" target="_blank" class="share-btn whatsapp">WhatsApp</a>
            <button @click="shareLink(evaluasiShareUrl, 'Evaluasi', 'Mohon isi formulir evaluasi training berikut.')" class="share-btn native">Lainnya</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Formulir Internal (Panitia)</h2>
        </div>
        
        <div class="no-embed-placeholder">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          </div>
          <h3 class="no-embed-title">Harus Dibuka di Tab Baru</h3>
          <p class="no-embed-text">Karena berisi fitur upload file, formulir ini tidak dapat ditampilkan di sini.</p>
          <a :href="internalShareUrl" target="_blank" class="open-new-tab-btn-main">
            Buka Formulir Internal
          </a>
        </div>
        
        <div class="share-section">
          <h3 class="share-title">Bagikan Link</h3>
          <div class="share-input-group">
            <input type="text" :value="internalShareUrl" readonly />
            <button @click="copyToClipboard(internalShareUrl, 'Internal')" title="Salin Link">Salin</button>
          </div>
           <div class="share-buttons">
            <a :href="`https://api.whatsapp.com/send?text=Link formulir internal panitia: ${internalShareUrl}`" target="_blank" class="share-btn whatsapp">WhatsApp</a>
            <button @click="shareLink(internalShareUrl, 'Internal Panitia', 'Link formulir internal panitia.')" class="share-btn native">Lainnya</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.page-title {
  color: var(--primary-color, #d10000);
  margin-top: 0;
}
.forms-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.card-title {
  margin: 0;
  font-size: 1.25rem;
}
.no-embed-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  flex-grow: 1; /* Membuat placeholder mengisi ruang tersedia */
  min-height: 400px; /* Memberi tinggi minimal */
}
.no-embed-placeholder .icon svg {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
}
.no-embed-title {
  margin: 1rem 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1e293b;
}
.no-embed-text {
  margin: 0 0 1.5rem 0;
  color: #64748b;
  max-width: 300px;
}
.open-new-tab-btn-main {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}
.open-new-tab-btn-main:hover {
  background-color: #a10000;
}
.share-section {
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}
.share-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}
.share-input-group { display: flex; }
.share-input-group input {
  flex-grow: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px 0 0 6px;
  background-color: #f9fafb;
}
.share-input-group button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-left: none;
  background-color: #f3f4f6;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
}
.share-buttons { margin-top: 1rem; display: flex; gap: 0.75rem; }
.share-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: none;
}
.whatsapp { background-color: #25D366; }
.native { background-color: #555; }

@media (max-width: 992px) {
  .forms-grid {
    grid-template-columns: 1fr;
  }
}
</style>