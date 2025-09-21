<script setup>
defineProps({
  title: String,
  value: [String, Number],
  unit: String,
  color: {
    type: String,
    default: '#374151' 
  },
  icon: String 
})
</script>

<template>
  <div class="kpi-card">
    <div v-if="icon" class="kpi-icon-wrapper" :style="{ backgroundColor: color }">
      <div v-html="icon" class="kpi-icon"></div>
    </div>
    <div class="kpi-content">
      <div class="kpi-title">{{ title }}</div>
      <div class="kpi-value" :style="{ color: color }">
        {{ value }}<span v-if="unit" class="kpi-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kpi-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
}
.kpi-icon-wrapper {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-icon {
  color: white;
  width: 24px;
  height: 24px;
}
.kpi-content {
  text-align: left;
}
.kpi-title {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.9rem;
  margin: 0;
}
.kpi-value {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  margin-top: 0.25rem;
}
.kpi-unit {
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.25rem;
  color: #6b7280;
}
</style>