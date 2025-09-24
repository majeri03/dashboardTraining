<script setup>
import { ref } from 'vue';

const today = new Date();
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const totalDays = ref(endOfMonth.getDate());
const remainingDays = ref(endOfMonth.getDate() - today.getDate() + 1);
</script>

<template>
  <div class="time-reminder-card">
    <div class="time-value">{{ remainingDays }}</div>
    <div class="time-label">Hari Tersisa</div>
    <div class="time-progress-bar">
      <div 
        class="time-progress-fill" 
        :style="{ width: ((totalDays - remainingDays) / totalDays) * 100 + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.time-reminder-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1rem 1.5rem; /* Padding diperbesar */
  text-align: center;
  border: 1px solid #e5e7eb;
  min-width: 220px; /* Lebar minimum diperbesar */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}
.time-value {
  font-size: 3em; /* Ukuran font diperbesar */
  font-weight: 700;
  color: var(--primary-color, #d10000);
  line-height: 1.1;
}
.time-label {
  font-size: 1em; /* Ukuran font diperbesar */
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 12px; /* Margin bawah ditambah */
}
.time-progress-bar {
  height: 8px; /* Progress bar dibuat lebih tebal */
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.time-progress-fill {
  height: 100%;
  background-color: var(--primary-color, #d10000);
  border-radius: 4px;
  transition: width 0.5s ease-out;
}
</style>