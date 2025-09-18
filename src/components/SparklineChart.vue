<script setup>
import { Line } from 'vue-chartjs'
import Chart from 'chart.js/auto' // Otomatis register semua plugin

defineProps({
  chartData: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: '#5356FF' // Warna default
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // [KUNCI] Sembunyikan semua elemen yang tidak perlu
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true } // Biarkan tooltip aktif saat di-hover
  },
  scales: {
    y: {
      display: false, // Sembunyikan sumbu Y (angka)
    },
    x: {
      display: false, // Sembunyikan sumbu X (bulan)
    }
  },
  elements: {
    point: {
      radius: 0 // Sembunyikan titik di setiap data
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>