<script setup>
import { computed } from 'vue';

// Komponen ini menerima 'props' dari komponen induknya.
// Kita definisikan bahwa ia mengharapkan sebuah prop bernama 'rating'.
const props = defineProps({
  rating: {
    type: Number,
    required: true,
    default: 0
  }
});

// Computed property untuk mengubah rating 1-5 menjadi persentase 0-100%
const percentage = computed(() => {
  // Pastikan rating valid sebelum dihitung
  const validRating = Math.max(0, Math.min(5, props.rating || 0));
  return (validRating / 5) * 100;
});

// Computed property untuk menentukan warna bar berdasarkan persentase
const barColor = computed(() => {
  if (percentage.value < 40) return '#e74c3c'; // Merah
  if (percentage.value < 80) return '#f39c12'; // Oranye
  return '#2ecc71'; // Hijau
});
</script>

<template>
  <div class="progress-bar-container">
    <div class="progress-bar-track">
      <div 
        class="progress-bar-fill" 
        :style="{ width: percentage + '%', backgroundColor: barColor }"
      ></div>
    </div>
    <span class="progress-percentage">{{ percentage.toFixed(0) }}%</span>
  </div>
</template>

<style scoped>
/* 'scoped' berarti style ini hanya berlaku untuk komponen ini */
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 150px; /* Agar tidak terlalu sempit di mobile */
}

.progress-bar-track {
  flex-grow: 1; /* Biarkan bar memanjang mengisi ruang */
  height: 12px;
  background-color: #ecf0f1;
  border-radius: 6px;
  overflow: hidden; /* Penting agar isinya tidak keluar dari border radius */
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
}

.progress-percentage {
  font-weight: 600;
  font-size: 0.9em;
  color: #34495e;
}
</style>