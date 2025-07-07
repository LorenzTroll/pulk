<script setup>
import { defineProps, defineEmits, watch, onMounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, required: true }
})
const emit = defineEmits(['update:visible'])

function close() {
  emit('update:visible', false)
}

// Auto-focus when opened
watch(
  () => props.visible,
  (val) => {
    if (val) {
      // nextTick focus is handled by tabindex on container
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
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
  </Teleport>
</template>