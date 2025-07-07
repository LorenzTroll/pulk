<script setup>
import { defineProps } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({ visible: Boolean })
</script>

<template>
  <Modal :visible="visible" @update:visible="$emit('close')">
    <h2 class="text-2xl font-bold mb-4">Kontakt</h2>
    <form>
      <!-- Beispiel-Form -->
      <label class="block mb-2">
        Name
        <input type="text" class="mt-1 block w-full border rounded p-2" />
      </label>
      <label class="block mb-2">
        Nachricht
        <textarea class="mt-1 block w-full border rounded p-2" rows="4"></textarea>
      </label>
      <button type="submit" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Senden
      </button>
    </form>
  </Modal>
</template>
