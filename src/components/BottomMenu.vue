<script setup>
import { useOverlayStore } from '@/stores/overlay'
import ArrowIcon from './ArrowIcon.vue'
const overlay = useOverlayStore()
</script>

<template>
  <nav class="bottom-menu">
    <button class="tab contact" @click="overlay.open('contact')">
      <span>Kontakt</span>
      <ArrowIcon />
    </button>
    <button class="tab about" @click="overlay.open('about')">
      <span>About</span>
      <ArrowIcon />
    </button>
    <button class="tab pricing" @click="overlay.open('pricing')">
      <span>Preise</span>
      <ArrowIcon />
    </button>
  </nav>
</template>

<style scoped>
.bottom-menu {
  position: fixed;
  bottom: 2rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;              /* Abstand zwischen den Buttons */
  padding: 1rem 0;         /* 1rem oben/unten */
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;            /* Abstand zwischen Text und Icon */
  border-radius: 9999px;  /* pill-shape */
  padding: 0.75rem 1.5rem;/* 0.75rem oben/unten, 1.5rem links/rechts */
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
}
.tab:hover {
  transform: scale(1.05);
}

/* konkrete Farbwerte gemäß Design */
.tab.contact {
  background: #eef1f6;
  color: #000;
}
.tab.about {
  background: #000;
  color: #fff;
}
.tab.pricing {
  background: #ed6a1c;
  color: #fff;
}

/* Responsive Anpassung für kleine Bildschirme */
@media (max-width: 640px) {
  .tab {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
  }
}
</style>
