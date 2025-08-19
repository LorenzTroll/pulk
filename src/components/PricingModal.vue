<script setup>
import { ref, watch, nextTick } from 'vue'
import { usePricingStore } from '@/stores/pricing'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-purple.svg'

import { useRevealUp } from '@/composables/useRevealUp'
import ScrollTrigger from 'gsap/ScrollTrigger'

const props   = defineProps({ visible: Boolean })
const emit    = defineEmits(['close'])
const pricing = usePricingStore()

const rootRef = ref(null)

// lazy init (erst wenn Modal offen ist)
const { init, kill } = useRevealUp('.reveal-up', {
  container: rootRef,
  scroller:  rootRef,     // Modal scrollt selbst
  start:     'top 90%',   // triggert sofort am Viewport-Rand des Modals
  duration:  0.6,
  ease:      'power2.out',
  once:      true,
  lazy:      true
})

watch(() => props.visible, async (open) => {
  if (open) {
    await nextTick()       // DOM der Cards existiert
    init(rootRef.value)    // Trigger jetzt bauen
    ScrollTrigger.refresh()
  } else {
    kill()                 // sauber aufräumen
  }
})
</script>

<template>
  <Modal :visible="props.visible" @close="emit('close')">
    <!-- v-if verhindert Vorab-Paint im geschlossenen Zustand -->
    <div v-if="props.visible" ref="rootRef" class="pricing-modal">
      <img :src="pulkLogo" alt="Pulk Logo" class="absolute top-6 left-6 w-12 h-12" />

      <div class="cards-wrapper">
        <div
          v-for="(plan, idx) in pricing.plans"
          :key="plan.key"
          :class="['card', 'reveal-up', { 'card--highlight': plan.key === 'workshop' }]"
          :data-reveal-delay="idx * 0.3"   <!-- 0,3 s Staffelung rein im Template -->
        >
          <header class="card-header">
            <h2 class="card-title">{{ plan.title }}</h2>
            <p class="card-subtitle">{{ plan.subtitle }}</p>
          </header>

          <div class="card-price" :class="{ 'price-hidden': plan.key === 'individuell' }">
            <span class="price-from" v-if="plan.key === 'versammlung'">ab</span>
            <span class="price-amount">
              {{ plan.price }}<template v-if="plan.price !== '–'"> EUR</template>
            </span>
            <span class="price-unit">{{ plan.unit }}</span>
          </div>

          <section class="card-features" v-if="plan.features?.length">
            <h3 class="features-heading">
              {{ plan.key === 'individuell' ? 'Beispielsweise:' : 'Was enthalten ist:' }}
            </h3>
            <ul class="features-list">
              <li v-for="(feature, i) in plan.features" :key="i" class="feature-item">
                <font-awesome-icon icon="check" class="feature-check" />
                <span class="feature-text">{{ feature }}</span>
              </li>
            </ul>
          </section>

          <section class="card-features" v-if="plan.onRequest?.length">
            <h3 class="features-heading">Auf Anfrage:</h3>
            <ul class="features-list">
              <li v-for="(item, i) in plan.onRequest" :key="i" class="feature-item">
                <font-awesome-icon icon="check" class="feature-check" />
                <span class="feature-text">{{ item }}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.pricing-modal .reveal-up { visibility: hidden; }

.pricing-modal {
  background: #E7E8EC;
  width: 100%;
  /* ersetze height:100% und overflow:hidden: */
  min-height: 100vh; 
  max-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'TWK Everett', sans-serif;
  padding: 2rem;
  position: relative;
}

.pricing-modal .reveal-up {
  opacity: 0;
  transform: translateY(24px);
  will-change: transform, opacity;
}
.pricing-logo {
  width: 100%;
}
.absolute {
  margin: 0rem;
}
.cards-wrapper {
  display: flex;
  gap: 2rem;
  flex-wrap: no-wrap;
  justify-content: center;
  margin-top: 6rem;
}
.card {
  background: linear-gradient(to top left, rgb(237,238,245) 0.5%, #fff 100%);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 20rem;
  width: 21.875rem;
  max-width: 20rem;
}
.card:hover { 
  transform: translateY(-0.5rem);
  transition: transform 0.2s ease;
}

/* Highlight erste Card */
.card--highlight {
  background: #141414;
}
.card--highlight .card-title,
.card--highlight .card-subtitle,
.card--highlight .price-from,
.card--highlight .price-amount,
.card--highlight .price-unit,
.card--highlight .feature-text,
.card--highlight .features-heading {
  color: #fff;
}
.card--highlight .feature-check {
  color: #fff;
}
.card--highlight .price-amount {
  color: #FF5A00;
}
.card-header {
  margin-bottom: 1.5rem;
}
.card-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #141414;
  margin: 1.2rem 0 2rem;
}
.card-subtitle {
  font-size: 1rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}
.card-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}
.card-features {
  margin-bottom: 1rem;
}
.price-hidden {
  visibility: hidden;
}
.price-from {
  font-size: 0.9rem;
  color: #666;
}
.price-amount {
  font-size: 2rem;
  font-weight: 900;
  color: #FF5A00;
  line-height: 1;
}
.price-unit {
  font-size: 0.9rem;
  color: #888;
}
.features-heading {
  font-size: 1rem;
  font-weight: 400;
  color: #141414;
  margin: 0.5rem 0 1rem;
}
.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
}
.feature-check {
  font-size: 1rem;
  color: #141414;
  padding-right: 0.75rem;
}
.feature-text {
  flex: 1;
}

@media (max-width: 1024px) {
  .cards-wrapper {
    flex-direction: column;
    align-items: center;
  }
  .card {
    max-width: 22rem;
  }
  .card-title {
    font-size: 2rem;
  }
}
@media (max-width: 640px) {
  .card {
    padding: 3rem;
    margin: 0 1rem;
  }
  .card-title { font-size: 2rem; }
  .price-divider-horizontal { height: 3px; margin: 1rem 0; }
  .features-heading { font-size: 1rem; }
  .feature-item { font-size: 0.9rem; }
  .pricing-modal {

  }
}
</style>
