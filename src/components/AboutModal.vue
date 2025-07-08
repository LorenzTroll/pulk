<script setup>
import { defineProps } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({
  visible: { type: Boolean, required: true }
})
</script>

<template>
  <Modal
    :visible="visible"
    @close="$emit('close')"
  >
    <h2 class="text-2xl font-bold mb-4">Über uns</h2>
    <p>Hier kommt der Inhalt für die About-Seite.</p>
  </Modal>
</template>
