<!-- src/App.vue -->
<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useOverlayStore } from '@/stores/overlay'
import LandingPage    from '@/views/LandingPage.vue'
import AboutModal     from '@/components/AboutModal.vue'
import ContactModal   from '@/components/ContactModal.vue'
import PricingModal   from '@/components/PricingModal.vue'
import BottomMenu     from '@/components/BottomMenu.vue'

const overlay = useOverlayStore()

let scrollY = 0
function lockScroll() {
  // Scrollposition merken
  scrollY = window.scrollY || window.pageYOffset || 0

  // Scrollbar-Breite ausgleichen, damit nix „springt“
  const sbw = window.innerWidth - document.documentElement.clientWidth
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`

  // Scroll wirklich sperren + Position erhalten (iOS-freundlich)
  document.documentElement.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
}

function unlockScroll() {
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.paddingRight = ''

  // Zur ursprünglichen Position zurück
  window.scrollTo(0, scrollY || 0)
}

onMounted(() => {
  // Sperren/entsperren sobald dein Overlay „irgendein“ Modal anzeigt
  watch(() => overlay.current, (cur) => {
    if (cur) lockScroll()
    else     unlockScroll()
  }, { immediate: true })
})

onBeforeUnmount(() => {
  // Fallback: niemals gesperrt „zurücklassen“
  unlockScroll()
})
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
