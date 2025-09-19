<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    })
  }
})

// Fungsi buat gradient
const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  return gradient
}
</script>

<template>
  <Line
    :data="{
      ...chartData,
      datasets: chartData.datasets.map((ds, i) => ({
        ...ds,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: context } = chart
          return i === 0
            ? createGradient(context, 'rgba(155, 89, 182, 0.6)', 'rgba(155, 89, 182, 0.0)')
            : createGradient(context, 'rgba(231, 76, 60, 0.6)', 'rgba(231, 76, 60, 0.0)')
        },
        borderColor: i === 0 ? '#9b59b6' : '#e74c3c',
        tension: 0.3
      }))
    }"
    :options="chartOptions"
  />
</template>
