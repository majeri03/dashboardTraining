<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const reportData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = ref([currentYear - 2, currentYear - 1, currentYear, currentYear + 1]);

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// --- State untuk Tooltip ---
const tooltip = ref({
  visible: false,
  content: '',
  top: 0,
  left: 0
});

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  reportData.value = null;
  try {
    const response = await axios.get(apiUrl, { params: { action: 'getYearlyReport', year: selectedYear.value } });
    reportData.value = response.data;
  } catch (err) {
    console.error("Gagal memuat laporan tahunan:", err);
    error.value = "Gagal memuat data. Pastikan ada data training dan konfigurasi untuk tahun yang dipilih.";
    reportData.value = { divisions: [], monthlyTotals: [], monthlyTargets: [] };
  };
    isLoading.value = false;
  }

onMounted(fetchData);
watch(selectedYear, fetchData);

// --- Fungsi untuk Tooltip ---
const showTooltip = (event, detail, monthName) => {
  tooltip.value.content = `
    <strong>${monthName} ${selectedYear.value}</strong><br>
    MP: ${detail.mp} Karyawan<br>
    Target: ${detail.target.toFixed(1)} Jam<br>
    Capaian: ${detail.achievement} Jam
  `;
  tooltip.value.visible = true;
  tooltip.value.top = event.pageY + 10;
  tooltip.value.left = event.pageX + 10;
};

const hideTooltip = () => {
  tooltip.value.visible = false;
};

// --- Computed property untuk menghitung total ---
const columnTotals = computed(() => {
  if (!reportData.value || !reportData.value.divisions) {
    return { lastMp: 0, achievements: Array(12).fill(0) };
  }
  const totals = {
    lastMp: 0,
    achievements: Array(12).fill(0)
  };
  
  reportData.value.divisions.forEach(div => {
    totals.lastMp += div.lastMp;
    // Perbaikan utama: Gunakan 'detail.month' untuk mendapatkan index yang benar
    div.monthlyDetails.forEach(detail => {
      const monthIndex = detail.month - 1; // detail.month adalah 1-12
      if (monthIndex >= 0 && monthIndex < 12) {
        totals.achievements[monthIndex] += detail.achievement;
      }
    });
  });
  
  // Membulatkan hasil akhir agar rapi
  totals.achievements = totals.achievements.map(ach => parseFloat(ach.toFixed(1)));
  return totals;
});

const monthlyAcv = computed(() => {
  if (!reportData.value || !reportData.value.monthlyTotals || !reportData.value.monthlyTargets) {
    return Array(12).fill(0); 
  }
  
  return reportData.value.monthlyTotals.map((total, index) => {
    const target = reportData.value.monthlyTargets[index];
    return target > 0 ? (total / target) * 100 : 0;
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
  
  // Baris Header 1 (Bulan)
  const headerRow1 = ['NO', 'Unit Bisnis'];
  months.forEach(month => {
    headerRow1.push(month, '', '');
  });
  dataToExport.push(headerRow1);

  // Baris Header 2 (Detail)
  const headerRow2 = ['', ''];
  months.forEach(() => {
    headerRow2.push('MP', 'Target', 'Capaian');
  });
  dataToExport.push(headerRow2);

  // Baris Data Utama
  reportData.value.divisions.forEach((div, index) => {
    const row = [ index + 1, div.unitBisnis ];
    div.monthlyDetails.forEach(detail => {
        row.push(detail.mp, detail.target, detail.achievement);
    });
    dataToExport.push(row);
  });
   dataToExport.push([]); 

  // Baris Total Bulanan
  const totalRow = ['Total bulanan', ''];
  columnTotals.value.achievements.forEach((ach, index) => {
      const totalMp = reportData.value.divisions.reduce((sum, div) => sum + div.monthlyDetails[index].mp, 0);
      const totalTarget = reportData.value.monthlyTargets[index];
      totalRow.push(totalMp, totalTarget.toFixed(0), ach.toFixed(1));
  });
  dataToExport.push(totalRow);
  
  // Baris Acv (%)
  const acvRow = ['Acv (%)', ''];
  monthlyAcv.value.forEach(acv => {
    acvRow.push('', '', acv > 0 ? `${acv.toFixed(0)}%` : '');
  });
  dataToExport.push(acvRow);

  // Baris Ytd
  const ytdRow = [`Ytd ${selectedYear.value} (% Avg) =`, `${yearToDateAvg.value.toFixed(0)}%`];
  dataToExport.push(ytdRow);
  const ws = XLSX.utils.aoa_to_sheet(dataToExport);

  // Menggabungkan sel header bulan
  ws['!merges'] = [];
  for (let i = 0; i < months.length; i++) {
    ws['!merges'].push({ s: { r: 0, c: 2 + (i*3) }, e: { r: 0, c: 4 + (i*3) } });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Laporan Tahunan ${selectedYear.value}`);
  XLSX.writeFile(wb, `Laporan_Tahunan_Detail_${selectedYear.value}.xlsx`);
};

const exportToPDF = () => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' }); // Gunakan A3 untuk data lebar
  doc.text(`Progress Target Training Tahunan (Detail) - ${selectedYear.value}`, 14, 15);

  const head = [
    [
      { content: 'NO', rowSpan: 2 }, 
      { content: 'Unit Bisnis', rowSpan: 2 },
      ...months.map(m => ({ content: m, colSpan: 3, styles: { halign: 'center' } }))
    ],
    Array(12).fill(['MP', 'T', 'C']).flat()
  ];

  const body = reportData.value.divisions.map((div, index) => {
      const row = [index + 1, { content: div.unitBisnis, styles: { halign: 'left' } }];
      div.monthlyDetails.forEach(detail => {
          row.push(detail.mp, detail.target.toFixed(0), detail.achievement);
      });
      return row;
  });
  const foot = [
    // Baris Total Bulanan
    [
      { content: 'Total bulanan', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      ...columnTotals.value.achievements.map((ach, index) => {
          const totalMp = reportData.value.divisions.reduce((sum, div) => sum + div.monthlyDetails[index].mp, 0);
          const totalTarget = reportData.value.monthlyTargets[index];
          return [
              { content: totalMp, styles: { fontStyle: 'bold' } },
              { content: totalTarget.toFixed(0), styles: { fontStyle: 'bold' } },
              { content: ach.toFixed(1), styles: { fontStyle: 'bold' } }
          ];
      }).flat()
    ],
    // Baris Acv (%)
    [
      { content: 'Acv (%)', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      ...monthlyAcv.value.map(acv => ([
          { content: '' },
          { content: '' },
          { content: acv > 0 ? `${acv.toFixed(0)}%` : '', styles: { fontStyle: 'bold' } }
      ])).flat()
    ],
    // Baris Ytd
    [
       { content: `Ytd ${selectedYear.value} (% Avg) =`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
       { content: `${yearToDateAvg.value.toFixed(0)}%`, colSpan: 36, styles: { fontStyle: 'bold' } } // 12 bulan * 3 kolom
    ]
  ];
  autoTable(doc, {
    startY: 22,
    head: head,
    body: body,
    foot: foot,
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold', halign: 'center' },
  });

  doc.save(`Laporan_Tahunan_Detail_${selectedYear.value}.pdf`);
};

</script>

<template>
  <div class="card">
    <div 
      v-if="tooltip.visible" 
      class="tooltip" 
      :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }"
      v-html="tooltip.content">
    </div>

    <div class="card-header">
      <h2 class="card-title">Progress Target Training Tahunan</h2>
      <div class="export-controls">
        <button @click="exportToExcel" :disabled="isLoading || !reportData || reportData.divisions.length === 0">Export Excel</button>
        <button @click="exportToPDF" :disabled="isLoading || !reportData || reportData.divisions.length === 0">Export PDF</button>
      </div>
      <div class="header-actions">
        <div class="filter-controls">
          <label for="year-select">Pilih Tahun:</label>
          <select id="year-select" v-model="selectedYear" :disabled="isLoading">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      Membuat laporan tahunan...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else-if="reportData && reportData.divisions" class="table-wrapper">
      <table class="yearly-report-table">
        <thead>
          <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">Unit Bisnis</th>
            <th rowspan="2">MP (Last)</th>
            <th colspan="12">Capaian Aktual (Jam) per Bulan</th>
          </tr>
          <tr>
            <th v-for="month in months" :key="month">{{ month.substring(0, 3) }}</th>
          </tr>
        </thead>
        <tbody>
        <tr v-for="(div, index) in reportData.divisions" :key="div.unitBisnis">
          <td>{{ index + 1 }}</td>
          <td class="text-left">{{ div.unitBisnis }}</td>
          <td>{{ div.lastMp }}</td>
          <td 
            v-for="detail in div.monthlyDetails" 
            :key="detail.month"
            @mouseover="showTooltip($event, detail, months[detail.month - 1])"
            @mouseleave="hideTooltip"
            class="interactive-cell"
          >
            {{ detail.achievement > 0 ? detail.achievement : '' }}
          </td>
        </tr>
      </tbody>
        <tfoot>
      <tr class="total-row">
        <td colspan="2">Total bulanan</td>
        <td>{{ columnTotals.lastMp }}</td>
        <td v-for="(total, i) in reportData.monthlyTotals" :key="i">
          <b>{{ total > 0 ? total.toFixed(1) : '' }}</b>
        </td>
      </tr>
      <tr class="acv-row">
        <td colspan="3">Acv (%)</td>
        <td v-for="(acv, i) in monthlyAcv" :key="i">
          <b :style="{ color: acv >= 100 ? 'green' : (acv > 0 ? 'orange' : 'inherit') }">
            {{ acv > 0 ? acv.toFixed(0) + '%' : '' }}
          </b>
        </td>
      </tr>
        <tr class="ytd-row">
        <td :colspan="3">Ytd {{ selectedYear }} (% Avg) =</td>
        <td :colspan="12"><b>{{ yearToDateAvg.toFixed(0) }}%</b></td>
      </tr>
    </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  z-index: 1000;
  pointer-events: none;
  line-height: 1.5;
}
.interactive-cell {
  cursor: pointer;
}
.interactive-cell:hover {
  background-color: #e0e7ff;
}
.card { background-color: #ffffff; border-radius: 8px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; }
.card-title { margin: 0; }
.filter-controls { display: flex; align-items: center; gap: 0.5rem; }
.filter-controls select { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; }
.table-wrapper { overflow-x: auto; }
.yearly-report-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: center; }
.yearly-report-table th, .yearly-report-table td { border: 1px solid #dee2e6; padding: 8px; white-space: nowrap; }
.yearly-report-table thead th { background-color: #e9ecef; font-weight: 600; vertical-align: middle; }
.yearly-report-table .text-left { text-align: left; }
.loading-state, .error-state { text-align: center; padding: 3rem; font-size: 1.1rem; color: #555; }
.error-state { color: #d32f2f; font-weight: bold; }
.header-actions { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.yearly-report-table tfoot .total-row {
  background-color: #FBBF24;
  color: #422006;
  font-weight: bold;
}
.yearly-report-table tfoot .acv-row {
  background-color: #E5E7EB;
}
.yearly-report-table tfoot .ytd-row {
  background-color: #3B82F6;
  color: white;
  font-weight: bold;
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