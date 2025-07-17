<!-- src/components/BottomMenu.vue -->
<script setup>
import { ref, nextTick } from 'vue'
import gsap from 'gsap'
import { useOverlayStore } from '@/stores/overlay'
import ArrowIcon from './ArrowIcon.vue'

const overlay       = useOverlayStore()
const containerRef = ref(null)
const contactRef   = ref(null)
const aboutRef     = ref(null)
const pricingRef   = ref(null)

const allRefs = {
  contact: contactRef,
  about:   aboutRef,
  pricing: pricingRef
}

function handleClick(type) {
  if (overlay.current === type) {
    overlay.close()
    resetButtons()
  } else {
    overlay.open(type)
    if (type !== 'contact') nextTick(() => animateStack(type))
  }
}

function submitContact() {
  window.dispatchEvent(new Event('submit-contact'))
  // danach schließen und Buttons zurücksetzen
  overlay.close()
  resetButtons()
}

function animateStack(activeKey) {
  const cont = containerRef.value.getBoundingClientRect()
  Object.entries(allRefs).forEach(([key, elRef]) => {
    const el       = elRef.value
    const box      = el.getBoundingClientRect()
    const dx       = cont.left + cont.width/2 - (box.left + box.width/2)
    const isActive = key === activeKey

    gsap.to(el, {
      x:       dx,
      scale:   1,
      zIndex:  isActive ? 2001 : 1001,
      duration: 0.2,
      ease:     'power1.out'
    })
    gsap.to(el, {
      opacity: isActive ? 1 : 0,
      duration: 0.4,
      ease:     'power2.out'
    })
  })
}

function resetButtons() {
  Object.values(allRefs).forEach(elRef => {
    const el = elRef.value
    const tl = gsap.timeline()
    tl.to(el, {
      x:       0,
      scale:   1,
      zIndex:  1001,
      duration: 0.2,
      ease:     'power1.out'
    })
    tl.to(el, {
      opacity: 1,
      duration: 0.5,
      ease:     'power1.out'
    }, '-=0.2')
  })
}
</script>

<template>
  <!-- Contact-Mode: "Abschicken" links & morph-Contact rechts -->
  <nav v-if="overlay.current === 'contact'" class="bottom-menu">
    <button
      class="tab submit-tab"
      :disabled="!overlay.isContactValid"
      @click="submitContact"
    >
      Abschicken
    </button>
    <button
      class="tab contact"
      ref="contactRef"
      @click="handleClick('contact')"
    >
      <span>Schließen</span>
      <span class="icon">✕</span>
    </button>
  </nav>

  <!-- Default-Mode: die drei Tabs mit GSAP-Animation -->
  <nav v-else class="bottom-menu" ref="containerRef">
    <button
      class="tab contact"
      ref="contactRef"
      @click="handleClick('contact')"
    >
      <span>{{ overlay.current === 'contact' ? 'Schließen' : 'Anfrage' }}</span>
      <span class="icon">
        <span v-if="overlay.current === 'contact'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>

    <button
      class="tab about"
      ref="aboutRef"
      @click="handleClick('about')"
    >
      <span>{{ overlay.current === 'about' ? 'Schließen' : 'About' }}</span>
      <span class="icon">
        <span v-if="overlay.current === 'about'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>

    <button
      class="tab pricing"
      ref="pricingRef"
      @click="handleClick('pricing')"
    >
      <span>{{ overlay.current === 'pricing' ? 'Schließen' : 'Preise' }}</span>
      <span class="icon">
        <span v-if="overlay.current === 'pricing'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-menu {
  position: fixed;
  bottom: 2.3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  z-index: 2000;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-family: 'TWK Everett', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

/* Farben im Default-Mode */
.tab.contact { background: #eef1f6; color: #000; }
.tab.about   { background: #000;    color: #fff; }
.tab.pricing { background: #ed6a1c; color: #fff; }

/* Submit-Button im Contact-Mode */
.submit-tab {
  background: #000;
  color: #fff;
}

/* Disabled-Style */
.submit-tab:disabled {
  background: #ccc !important;
  color: #666 !important;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Hover-Effekt */
.tab:hover,
.submit-tab:hover {
  transform: scale(1.05);
}

.icon {
  display: inline-flex;
  align-items: center;
}

/* Mobile */
@media (max-width: 640px) {
  .tab,
  .submit-tab {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
