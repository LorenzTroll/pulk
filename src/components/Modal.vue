<script setup>
import { defineProps, defineEmits, watch } from 'vue'

// Props und Emits
const props = defineProps({
  visible: { type: Boolean, required: true }
})
const emit = defineEmits(['close'])

// Close-Funktion
function close() {
  emit('close')
}

// Auto-Focus (bleibt unverändert)
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // Fokus über tabindex im Container
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <transition name="overlay-slide">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]"
        @click.self="close"
      >
        <div
          class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative"
          @keydown.escape.window="close"
          tabindex="0"
        >
          <slot />
          <button
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            @click="close"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* Slide-Up + Opacity-Transition für das Overlay */
.overlay-slide-enter-active,
.overlay-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.overlay-slide-enter-from,
.overlay-slide-leave-to {
  transform: translateY(100%); /* startet unten */
  opacity: 0.7;                /* halbtransparent */
}
.overlay-slide-enter-to,
.overlay-slide-leave-from {
  transform: translateY(0);    /* in Position */
  opacity: 1;                  /* voll opaque */
}
</style>
