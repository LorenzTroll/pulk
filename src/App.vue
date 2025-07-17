<!-- src/App.vue -->
<script setup>
import { useOverlayStore } from '@/stores/overlay'
import LandingPage    from '@/views/LandingPage.vue'
import AboutModal     from '@/components/AboutModal.vue'
import ContactModal   from '@/components/ContactModal.vue'
import PricingModal   from '@/components/PricingModal.vue'
import BottomMenu     from '@/components/BottomMenu.vue'

const overlay = useOverlayStore()
</script>

<template>
  <div class="main-container relative min-h-screen">
    <LandingPage />

    <!-- About -->
    <AboutModal
      :visible="overlay.current === 'about'"
      @close="overlay.close"
    />

    <!-- Contact -->
    <ContactModal
      :visible="overlay.current === 'contact'"
      @close="overlay.close"
    />

    <!-- Pricing -->
    <PricingModal
      :visible="overlay.current === 'pricing'"
      @close="overlay.close"
    />

    <BottomMenu />
  </div>
</template>
