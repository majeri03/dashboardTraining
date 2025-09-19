<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const apiUrl = import.meta.env.VITE_API_URL;

const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const now = new Date();
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear = ref(now.getFullYear());
const months = ref([...Array(12).keys()].map(i => ({ value: i + 1, name: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) })));
const years = ref([2024, 2025, 2026, 2027, 2028, 2029,2030]);

const divisiHeaders = ref([]);

const totalPesertaBulanan = computed(() => {
  if (!reportData.value?.trainings) return 0;
  return reportData.value.trainings.reduce((total, training) => total + Number(training.jumlahPeserta), 0);
});

const totalDurasiBulanan = computed(() => {
  if (!reportData.value?.trainings) return 0;
  // Menjumlahkan durasi dari setiap training, bukan total jam training
  return reportData.value.trainings.reduce((total, training) => total + Number(training.durasi), 0);
});

const calculateColumnTotal = (divisi, tipe) => {
  if (!reportData.value?.trainings) return 0;
  const total = reportData.value.trainings.reduce((sum, training) => {
    const info = training.rincianDivisi[divisi];
    if (!info) return sum;
    const value = (tipe === 'peserta' ? info.peserta : info.jam);
    return sum + Number(value);
  }, 0);
  
  if (total === 0) return 0;
  return tipe === 'jam' ? parseFloat(total.toFixed(1)) : total;
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { action: 'detailRekap', month: selectedMonth.value, year: selectedYear.value };
    const response = await axios.get(apiUrl, { params });
    
    // Pengecekan jika Apps Script mengirimkan status error di dalam data
    if (response.data.status === 'ERROR') {
      throw new Error(response.data.message);
    }
    
    reportData.value = response.data;
  } catch (err) {
    error.value = "Gagal memuat data: " + (err.message || "Silakan cek koneksi atau hubungi administrator.");
    console.error("Detail Error:", err);
    reportData.value = null; // Pastikan data kosong jika terjadi error
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(`${apiUrl}?action=getDivisions`);
    divisiHeaders.value = response.data;
  } catch (err) {
    console.error("Gagal memuat daftar divisi:", err);
    // Sediakan daftar cadangan jika API gagal
    divisiHeaders.value = [ 'IT', 'Marketing', 'Operasional', 'HR & GA', 'Finance & Accounting', 'Procurement', 'Sales', 'Customer Service', 'Legal & Compliance', 'HSE (K3)'];
  }
  await fetchData();
});

watch([selectedMonth, selectedYear], fetchData);

const getDivisiInfo = (rincian, div) => {
    const data = rincian[div];
    if (!data) return "0 / 0";
    return `${data.peserta} / ${data.jam.toFixed(1)}`;
};

// Tambahkan dua fungsi baru ini di dalam <script setup>

const exportToExcel = () => {
  const dataToExport = [];
  
  // 1. Buat Header (Bagian ini sudah benar)
  const mainHeader = ['No', 'Nama Kegiatan', 'Jadwal', 'Tipe', 'PIC/Pemateri', 'Jml Peserta', 'Durasi (Jam)', 'Total Jam Training'];
  divisiHeaders.value.forEach(div => {
    mainHeader.push(div, '');
  });
  mainHeader.push('Total Jam');
  
  const subHeader = ['', '', '', '', '', '', '', ''];
  divisiHeaders.value.forEach(() => {
    subHeader.push('P', 'J');
  });
  subHeader.push('');

  dataToExport.push(mainHeader, subHeader);

  // 2. Buat Body (Data Training)
  // =======================================================
  // AWAL LOOP DATA TRAINING
  reportData.value.trainings.forEach((training, index) => {
    const row = [
      index + 1,
      training.judul,
      training.jadwal,
      training.extInt,
      training.pemateri,
      training.jumlahPeserta,
      training.durasi,
      training.totalJamTraining.toFixed(1),
    ];
    divisiHeaders.value.forEach(div => {
      const info = getDivisiInfo(training.rincianDivisi, div).split(' / ');
      row.push(info[0], info[1]);
    });
    row.push(training.totalJamTraining.toFixed(1));
    dataToExport.push(row);
  });
  // AKHIR LOOP DATA TRAINING
  // =======================================================


  // 3. --- BAGIAN SUMMARY (HANYA DIJALANKAN SEKALI SETELAH LOOP SELESAI) ---
  if (reportData.value && reportData.value.trainings.length > 0) {
    // Baris kosong sebagai pemisah
    dataToExport.push([]); 

    // Baris Total Bulanan
    const totalRow = ['Total bulanan', '', '', '', '']; // 5 sel pertama
    totalRow.push(
        totalPesertaBulanan.value,
        totalDurasiBulanan.value,
        reportData.value.summary.totalJamBulanan.toFixed(1)
    );
    divisiHeaders.value.forEach(div => {
        totalRow.push(
            calculateColumnTotal(div, 'peserta'),
            calculateColumnTotal(div, 'jam')
        );
    });
    totalRow.push(reportData.value.summary.totalJamBulanan.toFixed(1));
    dataToExport.push(totalRow);
    
    // Baris Summary Lainnya
    const totalColumns = mainHeader.length;
    const summaryColSpan = 7;
    
    const karyawanRow = ['Jumlah Karyawan'];
    for(let i=0; i < summaryColSpan; i++) karyawanRow.push('');
    karyawanRow[summaryColSpan] = reportData.value.summary.jumlahKaryawan;
    dataToExport.push(karyawanRow);

    const targetText = `Target (${reportData.value.summary.targetPerOrang} Jam) / Bulan`;
    const targetRow = [targetText];
    for(let i=0; i < summaryColSpan; i++) targetRow.push('');
    targetRow[summaryColSpan] = reportData.value.summary.targetJamBulanan;
    dataToExport.push(targetRow);

    const acvRow = ['Acv (%)'];
    for(let i=0; i < summaryColSpan; i++) acvRow.push('');
    acvRow[summaryColSpan] = reportData.value.summary.pencapaian;
    dataToExport.push(acvRow);
  }
  // --- AKHIR BAGIAN SUMMARY ---


  // 4. Buat Workbook dan Worksheet
  const ws = XLSX.utils.aoa_to_sheet(dataToExport);
  
  // Atur merge cells untuk header dan footer
  ws['!merges'] = [];
  let col = 8;
  divisiHeaders.value.forEach(() => {
    ws['!merges'].push({ s: { r: 0, c: col }, e: { r: 0, c: col + 1 } });
    col += 2;
  });

  if (reportData.value && reportData.value.trainings.length > 0) {
    const totalRowIndex = dataToExport.length - 4;
    ws['!merges'].push({ s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 4 } });
    ws['!merges'].push({ s: { r: totalRowIndex + 1, c: 0 }, e: { r: totalRowIndex + 1, c: 6 } });
    ws['!merges'].push({ s: { r: totalRowIndex + 2, c: 0 }, e: { r: totalRowIndex + 2, c: 6 } });
    ws['!merges'].push({ s: { r: totalRowIndex + 3, c: 0 }, e: { r: totalRowIndex + 3, c: 6 } });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Detail');

  // 5. Trigger Download
  XLSX.writeFile(wb, `Laporan_Detail_${selectedMonth.value}_${selectedYear.value}.xlsx`);
};

const exportToPDF = () => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const monthName = months.value.find(m => m.value === selectedMonth.value)?.name || 'Bulan';
    doc.text(`Laporan Detail Bulanan - ${monthName} ${selectedYear.value}`, 14, 15);

    // 1. Definisikan Header dengan hati-hati
    const head = [];
    const headerRow1 = [
      { content: 'No', rowSpan: 2 }, { content: 'Nama Kegiatan', rowSpan: 2 },
      { content: 'Jadwal', rowSpan: 2 }, { content: 'Tipe', rowSpan: 2 },
      { content: 'PIC/Pemateri', rowSpan: 2 }, { content: 'Jml Peserta', rowSpan: 2 },
      { content: 'Durasi (Jam)', rowSpan: 2 }, { content: 'Total Jam Training', rowSpan: 2 }
    ];
    divisiHeaders.value.forEach(div => {
      headerRow1.push({ content: div, colSpan: 2, styles: { halign: 'center' } });
    });
    headerRow1.push({ content: 'Total Jam', rowSpan: 2 });

    const headerRow2 = [];
    divisiHeaders.value.forEach(() => {
      headerRow2.push('P', 'J');
    });
    head.push(headerRow1, headerRow2);

    // 2. Definisikan Body (Data Training)
    const body = reportData.value.trainings.map((training, index) => {
      const row = [
        index + 1, training.judul, training.jadwal, training.extInt, training.pemateri,
        training.jumlahPeserta, training.durasi, training.totalJamTraining.toFixed(1),
      ];
      divisiHeaders.value.forEach(div => {
        const info = getDivisiInfo(training.rincianDivisi, div).split(' / ');
        row.push(info[0] || '0', info[1] || '0');
      });
      row.push(training.totalJamTraining.toFixed(1));
      return row;
    });
    
    // 3. Definisikan Footer
    const foot = [];
    const footerRow1 = [{ content: 'Total bulanan', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } }];
    footerRow1.push(
      { content: totalPesertaBulanan.value.toString(), styles: { fontStyle: 'bold' } },
      { content: totalDurasiBulanan.value.toString(), styles: { fontStyle: 'bold' } },
      { content: reportData.value.summary.totalJamBulanan.toFixed(1), styles: { fontStyle: 'bold' } }
    );
    divisiHeaders.value.forEach(div => {
      footerRow1.push(
        { content: calculateColumnTotal(div, 'peserta').toString(), styles: { fontStyle: 'bold' } },
        { content: calculateColumnTotal(div, 'jam').toString(), styles: { fontStyle: 'bold' } }
      );
    });
    footerRow1.push({ content: reportData.value.summary.totalJamBulanan.toFixed(1), styles: { fontStyle: 'bold' } });

    const targetText = `Target (${reportData.value.summary.targetPerOrang} Jam) / Bulan`;
    const footerRow2 = [{ content: 'Jumlah Karyawan', colSpan: 7, styles: { halign: 'right' } }, { content: reportData.value.summary.jumlahKaryawan.toString(), styles: { fontStyle: 'bold' } }];
    const footerRow3 = [{ content: targetText, colSpan: 7, styles: { halign: 'right' } }, { content: reportData.value.summary.targetJamBulanan.toString(), styles: { fontStyle: 'bold' } }];
    const footerRow4 = [{ content: 'Acv (%)', colSpan: 7, styles: { halign: 'right' } }, { content: reportData.value.summary.pencapaian.toString(), styles: { fontStyle: 'bold' } }];
    foot.push(footerRow1, footerRow2, footerRow3, footerRow4);

    // 4. Buat Tabel
    autoTable(doc, {
      head: head,
      body: body,
      foot: foot,
      startY: 22,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [41, 128, 185], valign: 'middle', fontSize: 7 },
      footStyles: { fillColor: [236, 240, 241], textColor: [44, 62, 80] },
      didParseCell: function(data) {
        // Atur agar kolom nama kegiatan rata kiri
        if (data.column.index === 1 && data.section !== 'head') {
          data.cell.styles.halign = 'left';
        }
      }
    });

    // 5. Trigger Download
    doc.save(`Laporan_Detail_${selectedMonth.value}_${selectedYear.value}.pdf`);

  } catch (err) {
    console.error("Gagal membuat PDF:", err);
    // Panggil notifikasi eror global yang sudah kita buat
    showNotification("Gagal membuat PDF. Cek console untuk detail.", 'error');
  }
};

</script>

<template>
  <div class="card">
    <h2 class="card-title">Laporan Detail Bulanan</h2>
    
    <div class="filter-controls">
      <select v-model="selectedMonth" :disabled="isLoading">
        <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
      </select>
      <select v-model="selectedYear" :disabled="isLoading">
        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
      </select>
    </div>
    <div class="export-controls">
      <button @click="exportToExcel" :disabled="!reportData || reportData.trainings.length === 0">
        Export ke Excel
      </button>
      <button @click="exportToPDF" :disabled="!reportData || reportData.trainings.length === 0">
        Export ke PDF
      </button>
    </div>
    <div v-if="isLoading" class="loading-state">
      Memuat laporan...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else-if="reportData && reportData.trainings" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Nama Kegiatan</th>
            <th rowspan="2">Jadwal</th>
            <th rowspan="2">Tipe</th>
            <th rowspan="2">PIC/Pemateri</th>
            <th rowspan="2">Jml Peserta</th>
            <th rowspan="2">Durasi (Jam)</th>
            <th rowspan="2">Total Jam Training</th>
            <th v-for="div in divisiHeaders" :key="div" colspan="2">{{ div }}</th>
            <th rowspan="2">Total Jam</th>
          </tr>
          <tr>
            <template v-for="div in divisiHeaders" :key="div + '-sub'">
              <th>P</th>
              <th>J</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-if="reportData.trainings.length === 0">
             <td :colspan="9 + (divisiHeaders.length * 2)" class="empty-state">Tidak ada data training untuk periode ini.</td>
          </tr>
          <tr v-for="(training, index) in reportData.trainings" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ training.judul }}</td>
            <td>{{ training.jadwal }}</td>
            <td><b>{{ training.extInt }}</b></td>
            <td>{{ training.pemateri }}</td>
            <td>{{ training.jumlahPeserta }}</td>
            <td>{{ training.durasi }}</td>
            <td><b>{{ training.totalJamTraining.toFixed(1) }}</b></td>
            <template v-for="div in divisiHeaders" :key="div + '-data'">
              <td>{{ getDivisiInfo(training.rincianDivisi, div).split(' / ')[0] }}</td>
              <td>{{ getDivisiInfo(training.rincianDivisi, div).split(' / ')[1] }}</td>
            </template>
            <td class="total-col"><b>{{ training.totalJamTraining.toFixed(1) }}</b></td>
          </tr>
        </tbody>
        <tfoot v-if="reportData.trainings.length > 0">
          <tr>
            <td colspan="5" class="summary-label">Total bulanan</td>
            <td class="summary-value"><b>{{ totalPesertaBulanan }}</b></td>
            <td class="summary-value"><b>{{ totalDurasiBulanan }}</b></td>
            <td class="summary-value"><b>{{ reportData.summary.totalJamBulanan.toFixed(1) }}</b></td>
            <template v-for="div in divisiHeaders" :key="div + '-total'">
              <td class="summary-value"><b>{{ calculateColumnTotal(div, 'peserta') }}</b></td>
              <td class="summary-value"><b>{{ calculateColumnTotal(div, 'jam') }}</b></td>
            </template>
            <td class="summary-value"><b>{{ reportData.summary.totalJamBulanan.toFixed(1) }}</b></td>
          </tr>
          <tr>
            <td colspan="7" class="summary-label-left">Jumlah Karyawan</td>
            <td class="summary-value-left"><b>{{ reportData.summary.jumlahKaryawan }}</b></td>
            <td :colspan="divisiHeaders.length * 2 + 1" class="empty-cell"></td>
          </tr>
          <tr>
            <td colspan="7" class="summary-label-left">Target ({{ reportData.summary.targetPerOrang || 2 }} Jam) / Bulan</td>
            <td class="summary-value-left"><b>{{ reportData.summary.targetJamBulanan }}</b></td>
            <td :colspan="divisiHeaders.length * 2 + 1" class="empty-cell"></td>
          </tr>
          <tr>
            <td colspan="7" class="summary-label-left">Acv (%)</td>
            <td class="summary-value-left pencapaian"><b>{{ reportData.summary.pencapaian }}</b></td>
            <td :colspan="divisiHeaders.length * 2 + 1" class="empty-cell"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div v-else class="empty-state">
        Data tidak ditemukan atau format tidak sesuai.
    </div>
    </div>
</template>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--primary-color, #004d8c);
}
.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}
.filter-controls select {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  font-weight: 500;
}
.table-wrapper {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  border: 1px solid #dee2e6;
  padding: 8px 10px;
  text-align: center;
  white-space: nowrap;
}
thead th {
  background-color: #e9ecef;
  font-weight: 600;
  vertical-align: middle;
}
tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.total-col {
  background-color: #f8f9fa;
  font-weight: 600;
}
tfoot td {
  font-weight: bold;
}
tfoot tr:first-child td {
  background-color: #ffc107;
}
tfoot .summary-label {
  text-align: right;
  padding-right: 1rem;
}
tfoot .summary-value {
  color: #000;
}
tfoot .summary-label-left, tfoot .summary-value-left {
  text-align: right;
  padding: 6px 12px;
  border-top: none;
  border-left: none;
  border-right: none;
}
tfoot .summary-label-left {
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}
tfoot .summary-value-left {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}
tfoot .pencapaian {
  color: #28a745;
}
tfoot .empty-cell {
  border: none;
  border-bottom: 1px solid #dee2e6;
}
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #777;
}
.error-state {
  color: #d32f2f;
  font-weight: bold;
}
.export-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: flex-end; /* Posisikan tombol di kanan */
}
.export-controls button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  background-color: #10B981; /* Warna hijau */
  color: white;
}
.export-controls button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>