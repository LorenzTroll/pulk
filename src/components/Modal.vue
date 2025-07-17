<script setup>
import { defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true }
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // Fokus via tabindex
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <transition name="overlay-slide">
      <div
        v-if="visible"
        class="overlay-backdrop"
        @click.self="close"
      >
        <!-- Hier kommt jetzt direkt dein Modal-Content -->
        <slot />
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.overlay-backdrop {
  position: fixed;
  top: 0.7rem; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,1);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  overflow: auto;
}

/* Slide-Up + Fade */
.overlay-slide-enter-active,
.overlay-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.5s ease;
}
.overlay-slide-enter-from,
.overlay-slide-leave-to {
  transform: translateY(100%); opacity: 0.7;
}
.overlay-slide-enter-to,
.overlay-slide-leave-from {
  transform: translateY(0); opacity: 1;
}
</style>
