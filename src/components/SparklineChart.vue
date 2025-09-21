<script setup>
import { Line } from 'vue-chartjs'
import Chart from 'chart.js/auto' 

defineProps({
  chartData: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: '#5356FF' 
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true } 
  },
  scales: {
    y: {
      display: false, 
    },
    x: {
      display: false, 
    }
  },
  elements: {
    point: {
      radius: 0 
    }
  }
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>