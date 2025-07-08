<script setup>
import { useOverlayStore } from '@/stores/overlay'
import pulkHero from '@/assets/pulk-hero-image.png'

const overlay = useOverlayStore()
</script>

<template>
  <main class="landing-container">
    <div class="hero-container">
      <img
        :src="pulkHero"
        alt="PULK Hero Image"
      />
    </div>

    <section class="hero mt-8">
      <!-- ... dein weiterer Content ... -->
    </section>

    <!-- ... weitere Sections ... -->
  </main>
</template>

<style scoped>

.landing-container {
}

.hero-container {
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.hero h1 {
  font-size: 5rem;
}

@media (min-width: 768px) {
  .hero h1 {
    font-size: 8rem;
  }
}
</style>
