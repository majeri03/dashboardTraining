<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const apiUrl = import.meta.env.VITE_API_URL;

const reportData = ref({ divisions: [], monthlyTotals: [], monthlyTargets: [] });
const isLoading = ref(true);
const error = ref(null);

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = ref([currentYear - 2, currentYear - 1, currentYear, currentYear + 1]);

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  reportData.value = null; // Reset data sebelum fetch baru
  try {
    const response = await axios.get(apiUrl, { 
      params: { 
        action: 'getYearlyReport', 
        year: selectedYear.value 
      } 
    });
    reportData.value = response.data;
  } catch (err) {
    console.error("Gagal memuat laporan tahunan:", err);
    error.value = "Gagal memuat data. Pastikan ada data training dan konfigurasi untuk tahun yang dipilih.";
    reportData.value = { divisions: [], monthlyTotals: [], monthlyTargets: [] }; // <-- TAMBAHKAN INI
  };
    isLoading.value = false;
  }


onMounted(fetchData);
watch(selectedYear, fetchData);

// Computed property untuk menghitung total per kolom
const columnTotals = computed(() => {
  if (!reportData.value || !reportData.value.divisions || reportData.value.divisions.length === 0) {
    return {
      mp: 0,
      targetJam: 0,
      achievements: Array(12).fill(0)
    };
  }
  const totals = {
    mp: 0,
    targetJam: 0,
    achievements: Array(12).fill(0),
    totalAchievement: 0
  };
  
  reportData.value.divisions.forEach(div => {
    totals.mp += div.mp;
    totals.targetJam += div.targetJam;
    div.achievements.forEach((ach, index) => {
      totals.achievements[index] += ach;
    });
  });
  
  return totals;
});

const monthlyAcv = computed(() => {
  if (!reportData.value || !reportData.value.monthlyTotals || !reportData.value.monthlyTargets) {
    return Array(12).fill(0); 
  }
  
  return reportData.value.monthlyTotals.map((total, index) => {
    const target = reportData.value.monthlyTargets[index];
    return target && target > 0 ? (total / target) * 100 : 0;
  });
});

const yearToDateAvg = computed(() => {
  const validMonths = monthlyAcv.value.filter(acv => acv > 0);
  if (validMonths.length === 0) return 0;
  const totalAcv = validMonths.reduce((sum, acv) => sum + acv, 0);
  return totalAcv / validMonths.length;
});

const exportToExcel = () => {
  const dataToExport = [];
  
  // Baris Header 1
  const headerRow1 = ['NO', 'Unit Bisnis', 'MP', 'Target (Jam)'];
  headerRow1.push(...Array(12).fill('Achievement'));
  dataToExport.push(headerRow1);

  // Baris Header 2 (Bulan)
  const headerRow2 = ['', '', '', '', ...months.map(m => m.substring(0, 3))];
  dataToExport.push(headerRow2);

  // Baris Data Utama
  reportData.value.divisions.forEach((div, index) => {
    const row = [
      index + 1,
      div.unitBisnis,
      div.mp,
      (div.targetJam / 12).toFixed(0),
      ...div.achievements
    ];
    dataToExport.push(row);
  });

  // Baris Footer
  dataToExport.push([]); // Baris kosong sebagai pemisah
  const totalRow = [
    'Total bulanan', '',
    columnTotals.value.mp,
    (columnTotals.value.targetJam / 12).toFixed(0),
    ...columnTotals.value.achievements.map(t => t.toFixed(1))
  ];
  dataToExport.push(totalRow);
  
  const acvRow = [
    'Acv (%)', '', '', '',
    ...monthlyAcv.value.map(acv => acv > 0 ? `${acv.toFixed(0)}%` : '')
  ];
  dataToExport.push(acvRow);

  const ytdRow = [`Ytd ${selectedYear.value} (% Avg) =`, '', '', '', `${yearToDateAvg.value.toFixed(0)}%`];
  dataToExport.push(ytdRow);

  const ws = XLSX.utils.aoa_to_sheet(dataToExport);

  // Menggabungkan sel header "Achievement"
  ws['!merges'] = [
    { s: { r: 0, c: 4 }, e: { r: 0, c: 15 } }, // Merge "Achievement"
    { s: { r: dataToExport.length - 1, c: 4 }, e: { r: dataToExport.length - 1, c: 15 } } // Merge YTD
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Laporan Tahunan ${selectedYear.value}`);
  XLSX.writeFile(wb, `Laporan_Tahunan_${selectedYear.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.text(`Progress Target Training Tahunan - ${selectedYear.value}`, 14, 15);

  const head = [
    [
      { content: 'NO', rowSpan: 2 }, { content: 'Unit Bisnis', rowSpan: 2 },
      { content: 'MP', rowSpan: 2 }, { content: 'Target (Jam)', rowSpan: 2 },
      { content: 'Achievement', colSpan: 12, styles: { halign: 'center' } }
    ],
    months.map(m => m.substring(0, 3))
  ];

  const body = reportData.value.divisions.map((div, index) => [
    index + 1,
    { content: div.unitBisnis, styles: { halign: 'left' } },
    div.mp,
    (div.targetJam / 12).toFixed(0),
    ...div.achievements
  ]);

  const foot = [
    [
      { content: 'Total bulanan', colSpan: 2, styles: { halign: 'right' } },
      columnTotals.value.mp,
      (columnTotals.value.targetJam / 12).toFixed(0),
      ...columnTotals.value.achievements.map(t => t.toFixed(1))
    ],
    [
      { content: 'Acv (%)', colSpan: 4, styles: { halign: 'right' } },
      ...monthlyAcv.value.map(acv => acv > 0 ? `${acv.toFixed(0)}%` : '')
    ],
    [
       { content: `Ytd ${selectedYear.value} (% Avg) =`, colSpan: 4, styles: { halign: 'right' } },
       { content: `${yearToDateAvg.value.toFixed(0)}%`, colSpan: 12 }
    ]
  ];

  autoTable(doc, {
    startY: 22,
    head: head,
    body: body,
    foot: foot,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [209, 213, 219], textColor: [17, 24, 39], fontStyle: 'bold' },
    // --- PERUBAHAN UTAMA ADA DI SINI ---
    didParseCell: function(data) {
      // Terapkan style khusus untuk setiap baris di footer
      if (data.section === 'foot') {
        data.cell.styles.fontStyle = 'bold';
        const rowIndex = data.row.index;
        if (rowIndex === 0) { // Baris "Total bulanan"
          data.cell.styles.fillColor = '#FBBF24'; // Kuning pekat
          data.cell.styles.textColor = '#422006'; // Teks coklat tua
        }
        if (rowIndex === 1) { // Baris "Acv (%)"
          data.cell.styles.fillColor = '#E5E7EB'; // Abu-abu muda
          data.cell.styles.textColor = '#000000'; // Teks putih
        }
        if (rowIndex === 2) { // Baris "Ytd"
          data.cell.styles.fillColor = '#3B82F6'; // Biru pekat
          data.cell.styles.textColor = '#FFFFFF'; // Teks putih
        }
      }
    }
  });

  doc.save(`Laporan_Tahunan_${selectedYear.value}.pdf`);
};

</script>

<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Progress Target Training Tahunan</h2>
      
      <div class="header-actions">
        <div class="export-controls">
          <button @click="exportToExcel" :disabled="isLoading || !reportData || reportData.divisions.length === 0">
            Export Excel
          </button>
          <button @click="exportToPDF" :disabled="isLoading || !reportData || reportData.divisions.length === 0">
            Export PDF
          </button>
        </div>
        <div class="filter-controls">
          <label for="year-select">Pilih Tahun:</label>
          <select id="year-select" v-model="selectedYear" :disabled="isLoading">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
      </div>

    <div v-if="isLoading" class="loading-state">
      Membuat laporan tahunan, ini mungkin perlu beberapa saat...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else-if="reportData" class="table-wrapper">
      <table class="yearly-report-table">
        <thead>
          <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">Unit Bisnis</th>
            <th rowspan="2">MP</th>
            <th rowspan="2">Target (Jam)</th>
            <th colspan="12">Achievement</th>
          </tr>
          <tr>
            <th v-for="month in months" :key="month">{{ month.substring(0, 3) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(div, index) in reportData.divisions" :key="div.unitBisnis">
            <td>{{ index + 1 }}</td>
            <td class="text-left">{{ div.unitBisnis }}</td>
            <td>{{ div.mp }}</td>
            <td class="target-col">{{ (div.targetJam / 12).toFixed(0) }}</td>
            <td v-for="(ach, i) in div.achievements" :key="i">{{ ach > 0 ? ach : '' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">Total bulanan</td>
            <td>{{ columnTotals.mp }}</td>
            <td class="target-col">{{ (columnTotals.targetJam / 12).toFixed(0) }}</td>
            <td v-for="(total, i) in columnTotals.achievements" :key="i">
              <b>{{ total > 0 ? total.toFixed(1) : '' }}</b>
            </td>
          </tr>
          <tr class="acv-row">
            <td colspan="4">Acv (%)</td>
            <td v-for="(acv, i) in monthlyAcv" :key="i">
              <b :style="{ color: acv >= 100 ? 'green' : (acv > 0 ? 'orange' : 'inherit') }">
                {{ acv > 0 ? acv.toFixed(0) + '%' : '' }}
              </b>
            </td>
          </tr>
           <tr class="ytd-row">
            <td :colspan="4">Ytd {{ selectedYear }} (% Avg) =</td>
            <td :colspan="12"><b>{{ yearToDateAvg.toFixed(0) }}%</b></td>
          </tr>
        </tfoot>
      </table>
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.card-title {
  margin: 0;
}
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.filter-controls select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.table-wrapper {
  overflow-x: auto;
}
.yearly-report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  text-align: center;
}
.yearly-report-table th, .yearly-report-table td {
  border: 1px solid #dee2e6;
  padding: 8px;
  white-space: nowrap;
}
.yearly-report-table thead th {
  background-color: #e9ecef;
  font-weight: 600;
  vertical-align: middle;
}
.yearly-report-table .text-left {
  text-align: left;
}
.yearly-report-table .target-col {
  background-color: #dbeafe; /* Biru muda */
  font-weight: bold;
}
.yearly-report-table tfoot .total-row {
  background-color: #FBBF24; /* Kuning lebih pekat */
  color: #422006; /* Teks coklat tua */
  font-weight: bold;
}
.yearly-report-table tfoot .acv-row {
  background-color: #E5E7EB; /* Abu-abu sedikit lebih gelap */
}
.yearly-report-table tfoot .ytd-row {
  background-color: #3B82F6; /* Biru pekat */
  color: white; /* Teks putih */
  font-weight: bold;
}
.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #555;
}
.error-state {
  color: #d32f2f;
  font-weight: bold;
}
.header-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.export-controls {
  display: flex;
  gap: 0.75rem;
}
.export-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid #10B981;
  background-color: #f0fdfa;
  color: #059669;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.export-controls button:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  border-color: #d1d5db;
  cursor: not-allowed;
}
</style>