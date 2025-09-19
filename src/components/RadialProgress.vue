<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentage: { type: Number, default: 0 },
  label: { type: String, default: '' },
  color: { type: String, default: '#d10000' } // Warna merah primer Anda
});

const radius = 45;
const circumference = 2 * Math.PI * radius;
const offset = computed(() => circumference - (props.percentage / 100) * circumference);
</script>

<template>
  <div class="radial-progress-container">
    <svg height="100" width="100" viewBox="0 0 100 100">
      <circle
        class="track"
        stroke-width="10"
        fill="transparent"
        :r="radius"
        cx="50"
        cy="50"
      />
      <circle
        class="progress"
        stroke-width="10"
        fill="transparent"
        :r="radius"
        cx="50"
        cy="50"
        :stroke="color"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
      <text
  x="50"
  y="55" 
  text-anchor="middle"
  dominant-baseline="middle"
  font-size="20"
  font-weight="600"
  fill="#374151"
  transform="rotate(90 50 50)"
>
  {{ percentage.toFixed(0) }}%
</text>
    </svg>
    <div class="label-text">{{ label }}</div>
  </div>
</template>

<style scoped>
.radial-progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
svg {
  transform: rotate(-90deg);
}
.track {
  stroke: #e5e7eb;
}
.progress {
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease-out;
}

.label-text {
  font-size: 0.8em;
  color: #6b7280;
  font-weight: 500;
}
</style>