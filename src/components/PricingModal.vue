<script setup>
import { defineProps } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({ visible: Boolean })
</script>

<template>
  <Modal :visible="visible" @update:visible="$emit('close')">
    <h2 class="text-2xl font-bold mb-4">Preise</h2>
    <ul class="list-disc ml-5">
      <li>Basic: 10€/Monat</li>
      <li>Pro: 25€/Monat</li>
      <li>Enterprise: auf Anfrage</li>
    </ul>
  </Modal>
</template>