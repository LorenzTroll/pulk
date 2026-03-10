<script setup>
/* ============================================================================
 * Imports
 * ==========================================================================*/
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useLenis } from '@/composables/useLenis.js'
import pulkLogo from '@/assets/pulk-logo-white_E3.svg'
import { useHead } from '@vueuse/head'

/* ============================================================================
 * Meta Tags / SEO
 * ==========================================================================*/
useHead({
  title: 'Seite nicht gefunden · PULK',
  meta: [
    {
      name: 'description',
      content:
        'Die Seite konnte leider nicht gefunden werden. Bitte überprüfe die URL oder kehre zur Startseite zurück.'
    },
    { name: 'robots', content: 'noindex,follow' }
  ],
  link: [{ rel: 'canonical', href: 'https://pulk.space/404' }]
})

/* ============================================================================
 * State & Lenis
 * ==========================================================================*/
const { lenis } = useLenis()
const rootRef = ref(null)

/* ============================================================================
 * Lifecycle: Enable Lenis and hide footer on mount
 * ==========================================================================*/
onMounted(() => {
  document.getElementById('app')?.classList.add('hide-footer')

  // Ensure Lenis starts and reads layout
  lenis.value?.start?.()
  lenis.value?.resize?.()

  requestAnimationFrame(() => {
    lenis.value?.emit?.('scroll')
    window.dispatchEvent(new Event('scroll'))
  })
})

/* ============================================================================
 * Lifecycle: Restore footer visibility
 * ==========================================================================*/
onBeforeUnmount(() => {
  document.getElementById('app')?.classList.remove('hide-footer')
})
</script>

<template>
  <main class="notfound-wrap" ref="rootRef">
    <!-- Logo -->
    <img :src="pulkLogo" alt="PULK Logo" class="pulk-logo" />
    <!-- Content Box -->
    <section class="notfound-box">
      <!-- Description -->
      <div class="notfound-text">
        <p>
          Ups! Hier gibt’s nichts zu sehen. Die aufgerufene Seite existiert nicht
          (mehr) oder der Link war fehlerhaft. Bitte überprüfe die URL oder kehre zu unserer
          Startseite zurück. Falls du glaubst, dass hier ein Fehler vorliegt, dann schreib uns
          gerne eine email an:
          <a href="mailto:kontakt@pulk.space?subject=Bug%20Report%20Pulk%20Webseite">
            kontakt@pulk.space
          </a>.
        </p>
      </div>
      <!-- 404 Code -->
      <div class="notfound-code">
        <h1>404</h1>
        <p>not found</p>
      </div>
      <!-- Icon -->
      <div class="notfound-icon">
        <img src="@/assets/404-Pictogram_E1.svg" alt="Warnsymbol" />
      </div>
    </section>
    <!-- Back Button -->
    <div class="back-home-wrapper">
      <RouterLink to="/" class="back-home-btn">
        Zurück zur Startseite
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * Main Layout
 * ==========================================================================*/
.notfound-wrap {
  background-color: #f15133;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20rem;
  padding-bottom: 12rem;
  font-family: 'LayGrotesk', sans-serif;
  color: #141414;
  overflow: auto;
}

/* ============================================================================
 * Logo
 * ==========================================================================*/
.pulk-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  width: 7%;
  height: auto;
}

/* ============================================================================
 * Content Box
 * ==========================================================================*/
.notfound-box {
  background-color: #d9d9d9;
  border-radius: 1rem;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  gap: 3rem;
}

/* ============================================================================
 * Text
 * ==========================================================================*/
.notfound-text {
  width: 90%;
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  margin-inline-start: 3rem;
}

.notfound-text a {
  color: #141414;
  text-decoration: underline;
  font-weight: 600;
}

/* ============================================================================
 * 404 Code
 * ==========================================================================*/
.notfound-code {
  flex: 1;
  text-align: center;
}

.notfound-code h1 {
  font-size: clamp(3rem, 7vw, 9rem);
  font-weight: 900;
  margin: 0;
  padding-top: 2rem;
  line-height: 1;
  text-transform: uppercase;
}

.notfound-code p {
  font-size: 2.8rem;
  font-weight: 900;
  margin-top: 0;
  color: #141414;
}

/* ============================================================================
 * Icon
 * ==========================================================================*/
.notfound-icon {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.notfound-icon img {
  width: 20rem;
  height: auto;
  background-color: #000;
  border-radius: 8px;
}

/* ============================================================================
 * Back Button
 * ==========================================================================*/
.back-home-wrapper {
  margin-top: 3rem;
  text-align: center;
}

.back-home-btn {
  background-color: #141414;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.back-home-btn:hover {
  background-color: #000;
  transform: translateY(-2px);
}

/* ============================================================================
 * Tablet Layout
 * ==========================================================================*/
@media (min-width: 768px) {
  .notfound-box {
    flex-direction: row;
    justify-content: space-between;
    gap: 2rem;
  }
}
</style>
