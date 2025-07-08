<script setup>
import { ref, nextTick } from 'vue'
import gsap from 'gsap'
import { useOverlayStore } from '@/stores/overlay'
import ArrowIcon from './ArrowIcon.vue'

const overlay   = useOverlayStore()
const activeTab = ref(null)

// ⬇️ einzelne Refs für die Buttons
const containerRef = ref(null)
const contactRef   = ref(null)
const aboutRef     = ref(null)
const pricingRef   = ref(null)

// Hilfs-Objekt zum einfachen Durchlaufen
const allRefs = {
  contact: contactRef,
  about:   aboutRef,
  pricing: pricingRef
}

function handleClick(type) {
  if (activeTab.value === type) {
    // wieder schließen
    activeTab.value = null
    overlay.close()
    resetButtons()
  } else {
    // neuen Tab öffnen
    activeTab.value = type
    overlay.open(type)
    nextTick(() => animateStack(type))
  }
}

function animateStack(activeKey) {
  const container = containerRef.value.getBoundingClientRect()
  // Ziel-X (Mitte des Containers minus Hälfte des Buttons)
  const activeEl  = allRefs[activeKey].value
  const activeBox = activeEl.getBoundingClientRect()
  const centerX   = container.left + container.width/2 - (activeBox.left + activeBox.width/2)

  // alle Buttons animieren
  Object.entries(allRefs).forEach(([key, elRef], i) => {
    const el      = elRef.value
    const box     = el.getBoundingClientRect()
    const deltaX  = container.left + container.width/2 - (box.left + box.width/2)
    const isActive = key === activeKey

    gsap.to(el, {
      x:      deltaX,
      opacity:isActive ? 1 : 0,
      scale:  isActive ? 1 : 0.8,
      zIndex: isActive ? 10 : 1,
      duration: 0.3,
      ease:    'power2.out',
      delay:   isActive ? 0 : i * 0.05
    })
  })
}

function resetButtons() {
  Object.values(allRefs).forEach(elRef => {
    gsap.to(elRef.value, {
      x:       0,
      opacity: 1,
      scale:   1,
      zIndex:  1,
      duration: 0.4,
      ease:     'power2.inOut'
    })
  })
}
</script>

<template>
  <nav class="bottom-menu" ref="containerRef">
    <button
      class="tab contact"
      ref="contactRef"
      @click="handleClick('contact')"
    >
      <span>{{ activeTab === 'contact' ? 'Schließen' : 'Kontakt' }}</span>
      <span class="icon">
        <span v-if="activeTab === 'contact'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>

    <button
      class="tab about"
      ref="aboutRef"
      @click="handleClick('about')"
    >
      <span>{{ activeTab === 'about' ? 'Schließen' : 'About' }}</span>
      <span class="icon">
        <span v-if="activeTab === 'about'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>

    <button
      class="tab pricing"
      ref="pricingRef"
      @click="handleClick('pricing')"
    >
      <span>{{ activeTab === 'pricing' ? 'Schließen' : 'Preise' }}</span>
      <span class="icon">
        <span v-if="activeTab === 'pricing'">✕</span>
        <ArrowIcon v-else />
      </span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-menu {
  position: fixed;
  bottom: 1rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 0;
  z-index: 50;
  /* feste Höhe, damit transform sichtbar ist */
  height: 4rem;
}

.tab {
  position: relative;    /* transform greift auch relativ */
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2.5rem;
  border-radius: 9999px;
  font-weight: 900;
  cursor: pointer;
  transform-origin: center;
  font-size: 1rem;
  border: none;
}

/* Farben */
.contact { background: #eef1f6; color: #000 }
.about   { background: #000;    color: #fff }
.pricing { background: #ed6a1c; color: #fff }

/* Icon-Transition */
.icon { transition: transform 0.2s }

/* Responsive */
@media (max-width: 640px) {
  .tab { padding: 0.5rem 1rem; font-size: 0.9rem }
}
</style>
