<script setup>
import { useCounterStore } from './stores/counter'
const counter = useCounterStore()
</script>

<template>
  <div>
    <h1>Hello Vue 3 + Pinia!</h1>
    <button @click="counter.increment">count is {{ counter.count }}</button>
  </div>
</template>
