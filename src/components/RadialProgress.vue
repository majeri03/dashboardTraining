<script setup>
import { computed } from 'vue';

const props = defineProps({
  percentage: { type: Number, default: 0 },
  label: { type: String, default: '' },
});

const radius = 45;
const circumference = 2 * Math.PI * radius;
const offset = computed(() => circumference - (props.percentage / 100) * circumference);

</script>

<template>
  <div class="radial-progress-container">
    <svg height="100" width="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3B060A" />
          <stop offset="35%" stop-color="#8A0000" />
          <stop offset="65%" stop-color="#C83F12" />
          <stop offset="100%" stop-color="#FFF287" />
        </linearGradient>
      </defs>
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
        stroke="url(#progressGradient)" :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
      <text
        x="50"
        y="55" 
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="20"
        font-weight="600"
        :fill="percentage > 70 ? '#3B060A' : '#8A0000'" transform="rotate(90 50 50)"
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