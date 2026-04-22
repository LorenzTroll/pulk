<script setup>
import { defineProps, defineEmits, watch, ref, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  ariaLabel: { type: String, default: 'Dialog' }
})
const emit = defineEmits(['close'])

const dialogRef = ref(null)
let previousActiveElement = null

function close() {
  emit('close')
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.visible) {
    e.preventDefault()
    close()
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      previousActiveElement = document.activeElement
      window.addEventListener('keydown', handleKeydown)
      requestAnimationFrame(() => {
        dialogRef.value?.focus?.()
      })
    } else {
      window.removeEventListener('keydown', handleKeydown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        const el = previousActiveElement
        previousActiveElement = null
        requestAnimationFrame(() => el.focus())
      }
    }
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <transition name="overlay-slide">
      <div
        v-if="visible"
        ref="dialogRef"
        class="overlay-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel"
        tabindex="-1"
        data-lenis-prevent
        @click.self="close"
      >
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
  /* Allow modal content to scroll on touch devices; only background is locked */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}

.overlay-backdrop:focus {
  outline: none;
}

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
