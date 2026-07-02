import '@/assets/styles/main.css'
import '@/assets/css/modal.css'

// hkanev-vue-calendar wird NICHT global registriert — er wird nur in
// ContactModal.vue und ContactPage.vue gebraucht und dort jeweils lokal
// importiert (`import { Calendar } from 'hkanev-vue-calendar'` + style.css).
// Globale Registrierung würde 135 KB ins initial Bundle ziehen, obwohl der
// Calendar auf der Startseite nie gebraucht wird.

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createHead } from '@vueuse/head'

import LandingPage from '@/views/LandingPage.vue'
import Impressum    from '@/views/Impressum.vue'
import Datenschutz  from '@/views/Datenschutz.vue'
import NotFound from '@/views/NotFound.vue'
import AboutPage from '@/views/AboutPage.vue'
import PricingPage from '@/views/PricingPage.vue'
import ContactPage from '@/views/ContactPage.vue'

import { destroyLenis } from '@/composables/useLenis.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* Landing Page (Startseite) */
    { path: '/', name: 'home', component: LandingPage },

    /* SEO-Seiten (volle Ansicht, indexiert) */
    { path: '/preise', name: 'preise', component: () => import('@/views/PricingPage.vue') },
    { path: '/anfragen',  name: 'anfragen',  component: () => import('@/views/ContactPage.vue') },
    { path: '/about',  name: 'about',  component: () => import('@/views/AboutPage.vue') },

    /* MODAL-Routen (nicht indexiert, nur UI-State).
       Namen im camelCase — BottomMenu.vue (geschützt) pusht
       'modalPricing' / 'modalContact' / 'modalAbout'; die früheren
       kebab-case-Namen führten zu "no match"-Fehlern bei router.push. */
    {
      path: '/modal/preise',
      name: 'modalPricing',
      component: LandingPage,
      props: { modal: 'pricing' },
      meta: { robots: 'noindex' }
    },
    {
      path: '/modal/anfragen',
      name: 'modalContact',
      component: LandingPage,
      props: { modal: 'contact' },
      meta: { robots: 'noindex' }
    },
    {
      path: '/modal/about',
      name: 'modalAbout',
      component: LandingPage,
      props: { modal: 'about' },
      meta: { robots: 'noindex' }
    },

    /* Rechtliches */
    { path: '/impressum',   name: 'impressum',  component: Impressum },
    { path: '/datenschutz', name: 'datenschutz',component: Datenschutz },

    /* 404 */
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from, next) => {
  // Alle SEO-Seiten, auf denen KEIN Modal laufen soll
  const seoPaths = ['/datenschutz', '/impressum', '/about', '/preise', '/anfragen']

  // Trailing-Slash normalisieren: Footer-Links verwenden '/about/' etc. —
  // ohne Normalisierung matcht includes() nicht und destroyLenis() wird
  // übersprungen → verwaiste Lenis-Instanz frisst Wheel-Events (Scroll tot).
  const toPath = to.path.length > 1 ? to.path.replace(/\/+$/, '') : to.path

  if (seoPaths.includes(toPath)) {
    destroyLenis()

    // Entfernt alle Lenis-/Scroll-Blocker-Klassen global
    document.documentElement.classList.remove(
      'lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling'
    )
    document.body.classList.remove(
      'lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling'
    )

    // Falls das Modal den Footer versteckt hat → Rückgängig
    document.getElementById('app')?.classList.remove('hide-footer')

    // Scrollbar wieder aktivieren
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''

    // Entfernt Modal-Blocker wie data-lenis-prevent
    document.querySelectorAll('[data-lenis-prevent]').forEach(el => {
      el.removeAttribute('data-lenis-prevent')
      el.removeAttribute('data-lenis-prevent-touch')
      el.removeAttribute('data-lenis-prevent-wheel')
    })
  }

  next()
})

router.afterEach(() => {
  const consent = localStorage.getItem('cookieConsent')
  if (consent !== 'accepted') return  // ohne Consent: kein Versuch, keine Warnung

  const start = Date.now()
  const maxMs = 4000

  // Als Funktionsdeklaration statt IIFE: die frühere Form `4000\n(function…)()`
  // wurde durch ASI als Aufruf `4000(…)` geparst → "TypeError: 4000 is not a
  // function" bei jedem Routenwechsel mit akzeptiertem Consent.
  function tryPageView() {
    if (window.MDAL && typeof window.MDAL.pageView === 'function') {
      window.MDAL.pageView({ Absolute: null, ClientId: null })
      return
    }
    if (Date.now() - start < maxMs) {
      requestAnimationFrame(tryPageView)
    } else {
      // Optional: einmalige, leise Warnung – oder ganz weglassen
      console.warn('[Sitesight] MDAL.pageView nicht verfügbar (nach Routewechsel)')
    }
  }
  tryPageView()
})


const app = createApp(App)
const head = createHead()

app.use(router)
app.use(head)
app.use(createPinia())
app.mount('#app')
