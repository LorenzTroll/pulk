<script setup>
import { computed } from 'vue'
import { useOverlayStore } from '@/stores/overlay'

const overlay = useOverlayStore()
const show    = computed(() => overlay.isOpen)

// schließt, wenn in den Hintergrund geklickt wird
function close() {
  overlay.close()
}
</script>

<template>
  <!-- Transition für Slide-Up + Opacity -->
  <transition name="overlay-slide">
    <!-- Das gesamte Overlay, sobald show true ist -->
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40"
      @click.self="close"
    >
      <!-- Content-Container -->
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <!-- Slot für beliebigen Inhalt -->
        <slot />
      </div>
    </div>
  </transition>
</template>


<style scoped>
/* Duration deiner Wahl (hier 0.3s) */
.overlay-slide-enter-active,
.overlay-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.overlay-slide-enter-from,
.overlay-slide-leave-to {
  transform: translateY(100%);  /* startet/endet unterhalb des Viewports */
  opacity: 0.7;                  /* halb-opaque */
}
.overlay-slide-enter-to,
.overlay-slide-leave-from {
  transform: translateY(0);      /* in Position */
  opacity: 1;                    /* voll opaque */
}
</style>
