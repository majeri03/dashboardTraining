<script setup>
defineProps({
  message: String,
  type: String, 
  visible: Boolean,
});
</script>

<template>
  <transition name="slide-fade">
    <div v-if="visible" :class="['notification', type]">
      {{ message }}
    </div>
  </transition>
</template>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 2000;
}
.success {
  background-color: #10B981;
}
.error {
  background-color: #EF4444;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>