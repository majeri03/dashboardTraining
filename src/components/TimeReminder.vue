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
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
  border: 1px solid #e5e7eb;
  min-width: 140px;
}
.time-value {
  font-size: 2em;
  font-weight: 700;
  color: var(--primary-color, #d10000);
  line-height: 1.1;
}
.time-label {
  font-size: 0.85em;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 8px;
}
.time-progress-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}
.time-progress-fill {
  height: 100%;
  background-color: var(--primary-color, #d10000);
  border-radius: 3px;
  transition: width 0.5s ease-out;
}
</style>