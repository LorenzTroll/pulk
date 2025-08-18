<script setup>
import { defineProps, defineEmits } from 'vue'
import { usePricingStore } from '@/stores/pricing'
import Modal from './Modal.vue'
import pulkLogo from '@/assets/pulk-logo-purple.svg'

const props   = defineProps({ visible: Boolean })
const emit    = defineEmits(['close'])
const pricing = usePricingStore()
</script>

<template>
  <Modal :visible="props.visible" @close="emit('close')">
    <div class="pricing-modal">
      <img :src="pulkLogo" alt="Pulk Logo" class="absolute top-6 left-6 w-12 h-12" />

      <div class="cards-wrapper">
        <div
          v-for="plan in pricing.plans"
          :key="plan.key"
          :class="['card', { 'card--highlight': plan.key === 'workshop' }]"
        >
          <header class="card-header">
            <h2 class="card-title">{{ plan.title }}</h2>
            <p class="card-subtitle">{{ plan.subtitle }}</p>
          </header>

          <!-- Preisbereich: stets vorhanden, aber unsichtbar bei 'individuell' -->
          <div class="card-price" :class="{ 'price-hidden': plan.key === 'individuell' }">
            <span class="price-from">ab</span>
            <span class="price-amount">{{ plan.price }}€</span>
            <span class="price-unit">{{ plan.unit }}</span>
          </div>
          <section class="card-features">
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
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
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
  margin-top: 8rem;
}
.card {
    background: linear-gradient(
    to top left,
  rgb(237, 238, 245) 0.5%,
  #ffffff 100%
    );
  transition: background 1s ease-in-out, transform 1s ease-in-out;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 20rem;
  width: 21.875rem;
  max-width: 20rem;
  transition: transform 0.5s ease;
}
.card:hover {
  transform: translateY(-0.5rem);
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
  margin-bottom: 2rem;
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
  margin: 2rem 0 2rem;
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
