import axios from 'axios';

// 1. Ambil URL API dari environment variable Anda
const apiUrl = import.meta.env.VITE_API_URL;

// 2. Buat sebuah "template" atau instance axios yang sudah dikonfigurasi
const apiClient = axios.create({
  baseURL: apiUrl, // URL dasar untuk semua request
});

// 3. INI BAGIAN PALING PENTING (INTERCEPTOR)
// Kode ini akan berjalan secara otomatis SEBELUM setiap request dikirim.
// Tujuannya untuk "memperbaiki" request agar sesuai dengan kemauan Apps Script.
apiClient.interceptors.request.use(
  (config) => {
    // Kita hanya perlu melakukan ini untuk request 'POST'
    if (config.method === 'post') {
      // Ubah header Content-Type menjadi 'text/plain' untuk menghindari masalah CORS preflight
      config.headers['Content-Type'] = 'text/plain;charset=utf-8';
      
      // Ubah data object (payload) menjadi format string JSON
      config.data = JSON.stringify(config.data);
    }
    return config;
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada request
    return Promise.reject(error);
  }
);

// 4. Ekspor apiClient yang sudah siap pakai ini
export default apiClient;