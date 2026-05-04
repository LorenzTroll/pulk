<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { track } from '@/utils/tracking'
import ArrowIcon from './ArrowIcon.vue'
import footerChairs from '@/assets/pulk_footer-image_e2.png?w=800&format=avif;webp;png&as=picture'
import FooterLogo from '@/assets/pulk_footer-logo.svg'

/* -----------------------------------------------------------------------------
 * Props
 * ---------------------------------------------------------------------------*/
const props = defineProps({
  instagramUrl: { type: String, default: '#' },
  impressumHref: { type: String, default: '/impressum' },
  datenschutzHref: { type: String, default: '/datenschutz' },
  company: { type: String, default: 'Pulk' },
  year: { type: [Number, String], default: new Date().getFullYear() }
})

/* -----------------------------------------------------------------------------
 * Tracking (Sitesight / MDAL)
 * ---------------------------------------------------------------------------*/
function trackInstagramClick() {
  track('pulk.outbound.click', { destination: 'instagram', source: 'footer' })
}

function trackMapsClick() {
  track('pulk.outbound.click', { destination: 'google-maps', source: 'footer' })
}

function trackAssociateClick(name) {
  track('pulk.outbound.click', { destination: name, source: 'footer-associates' })
}

const copied = ref(false)

function onCopySuccess(url) {
  copied.value = true
  track('pulk.footer.copy-link', { url })
  setTimeout(() => { copied.value = false }, 2000)
}

async function copyPageUrl() {
  const url = 'https://pulk.space/'

  // 1. Moderne Clipboard API (nur HTTPS / secure contexts)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      onCopySuccess(url)
      return
    } catch {
      // Fall through zum execCommand-Fallback unten
    }
  }

  // 2. Legacy-Fallback via execCommand (greift auch in LAN-Preview ohne HTTPS)
  try {
    const ta = document.createElement('textarea')
    ta.value = url
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    onCopySuccess(url)
  } catch (err) {
    console.warn('[SiteFooter] copy failed:', err)
  }
}

const route = useRoute()
// all routes, footer is invisible
const modalRoutes = ['about', 'preise', 'anfragen']

const isAbsolute = computed(() =>
  modalRoutes.includes(route.name)
)
</script>

<template>
  <footer class="site-footer" :class="{ 'footer-absolute': isAbsolute }">

    <!-- TOP: CTAs + Chairs -->
    <div class="footer-top">
      <div class="footer-ctas">
        <a
          class="footer-cta"
          :href="instagramUrl"
          target="_blank"
          rel="noopener"
          @click="trackInstagramClick"
        >
          <span>Instagram</span>
          <!-- Instagram icon -->
          <svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </a>
        <button class="footer-cta" :class="{ 'cta--copied': copied }" type="button" @click="copyPageUrl">
          <span>{{ copied ? 'Link kopiert!' : 'Weiterempfehlen' }}</span>
          <!-- Check icon (copied state) -->
          <svg v-if="copied" class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <!-- Clipboard / copy icon (default) -->
          <svg v-else class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
      <div class="footer-chairs-wrap">
        <picture>
          <source
            v-for="(srcset, format) in footerChairs.sources"
            :key="format"
            :srcset="srcset"
            :type="`image/${format}`"
          />
          <img
            :src="footerChairs.img.src"
            alt="Reihe lila Stühle als Grafik aus der Corporate Identity des Pulk"
            class="footer-chairs"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </div>

    <!-- BOTTOM: Logo + Columns -->
    <div class="footer-bottom">
      <div class="footer-bottom-row">
        <!-- Logo badge -->
        <div class="footer-logo-wrap">
          <router-link to="/" class="footer-logo-link">
            <img :src="FooterLogo" alt="PULK Logo" class="footer-logo" />
          </router-link>
        </div>

        <!-- Nav columns -->
        <div class="footer-columns">
          <!-- Adresse -->
          <div class="footer-group">
            <h3>Adresse</h3>
            <ul>
              <li>Talstraße 7</li>
              <li>06120 Halle</li>
              <li>
                <a
                  href="https://www.google.com/maps?q=Talstraße+7,+06120+Halle+(Saale)"
                  target="_blank"
                  rel="noopener"
                  @click="trackMapsClick"
                >
                  Route Starten <ArrowIcon class="arrow yellow" />
                </a>
              </li>
            </ul>
          </div>

          <!-- Seiten -->
          <div class="footer-group">
            <h3>Seiten</h3>
            <ul>
              <li><router-link to="/anfragen">Anfrage senden</router-link></li>
              <li><router-link to="/about">Über uns</router-link></li>
              <li><router-link to="/preise">Preise / Pakete</router-link></li>
            </ul>
          </div>

          <!-- Rechtliches -->
          <div class="footer-group">
            <h3>Rechtliches</h3>
            <ul>
              <li><router-link :to="datenschutzHref">Datenschutz</router-link></li>
              <li><router-link :to="impressumHref">Impressum</router-link></li>
            </ul>
          </div>

          <!-- Associates -->
          <div class="footer-group">
            <h3>Associates</h3>
            <ul>
              <li>
                <a
                  href="https://verliebtinhalle.de/location/pulk"
                  target="_blank"
                  rel="noopener"
                  @click="trackAssociateClick('verliebtinhalle')"
                >
                  Besser Tagen <ArrowIcon class="arrow yellow" />
                </a>
              </li>
              <li>
                <a
                  href="https://tmrb.eu/detail.php?id=527"
                  target="_blank"
                  rel="noopener"
                  @click="trackAssociateClick('tmrb')"
                >
                  Freiraumbüro <ArrowIcon class="arrow yellow" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Divider + Legal bar -->
      <div class="footer-divider"></div>
      <div class="footer-legal">
        <p class="footer-credit">
          Webseite <strong>Lorenz Troll</strong>
        </p>
        <p class="footer-copyright">
          © {{ company }} {{ year }}
        </p>
      </div>
    </div>

  </footer>
</template>

<style scoped>
/* -----------------------------------------------------------------------------
 * Footer container
 * ---------------------------------------------------------------------------*/
.site-footer {
  background: #242424;
  color: #e7e8ec;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  font-family: 'LayGrotesk', sans-serif;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  padding: 6rem 7.25% 2.125rem;
  display: flex;
  flex-direction: column;
  gap: 8rem;
}

.footer-absolute {
  position: relative;
  left: 0;
  right: 0;
  bottom: 0;
}

/* -----------------------------------------------------------------------------
 * TOP: CTAs + Chairs
 * ---------------------------------------------------------------------------*/
.footer-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
}

.footer-ctas {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.footer-cta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: none;
  border: none;
  padding: 0;
  color: #e7e8ec;
  text-decoration: none;
  cursor: pointer;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.footer-cta:hover {
  opacity: 0.75;
}

.cta--copied .cta-icon {
  color: #a8f0a0;
}

.cta-icon {
  width: clamp(1.75rem, 2.5vw, 2.75rem);
  height: clamp(1.75rem, 2.5vw, 2.75rem);
  flex-shrink: 0;
}

/* Chairs right side */
.footer-chairs-wrap {
  flex: 0 0 auto;
  align-self: flex-end;
}

.footer-chairs {
  width: clamp(14rem, 28vw, 30rem);
  height: auto;
  object-fit: contain;
  display: block;
}

/* -----------------------------------------------------------------------------
 * BOTTOM: Logo + Columns
 * ---------------------------------------------------------------------------*/
.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.footer-bottom-row {
  display: flex;
  align-items: flex-start;
  gap: 4rem;
}

/* Logo badge */
.footer-logo-wrap {
  flex: 0 0 auto;
}

.footer-logo-link {
  display: inline-block;
  text-decoration: none;
  line-height: 0;
}

.footer-logo {
  width: clamp(10rem, 16vw, 16rem);
  height: auto;
}

/* Columns grid */
.footer-columns {
  display: flex;
  gap: clamp(2rem, 6vw, 8.5rem);
  flex-wrap: wrap;
  flex: 1 1 auto;
  justify-content: flex-end;
}

.footer-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.footer-group h3 {
  color: #63646d;
  font-weight: 400;
  font-size: 1.5625rem;
  line-height: 1.2;
  margin: 0 0 0.25rem;
  letter-spacing: -0.015625rem;
}

.footer-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.footer-group li {
  color: #e7e8ec;
  font-size: 1.25rem;
  line-height: 2.3125rem;
  font-weight: 400;
  letter-spacing: -0.0125rem;
}

.footer-group a {
  color: #e7e8ec;
  text-decoration: none;
  font-size: 1.25rem;
  line-height: 2.3125rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: opacity 0.2s ease;
}

.footer-group a:hover {
  opacity: 0.7;
}

/* Arrow icons */
.arrow {
  width: 0.7rem;
  height: 0.7rem;
  flex-shrink: 0;
}
.arrow.yellow { color: #f2b607; }
.arrow.purple { color: #9687ff; }
.arrow.orange { color: #ff5533; }

/* Divider */
.footer-divider {
  width: 100%;
  border-bottom: 0.0625rem solid #3a3a3a;
}

/* Legal bar */
.footer-legal {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-credit,
.footer-copyright {
  color: #63646d;
  font-size: 1.25rem;
  line-height: 1.875rem;
  margin: 0;
  letter-spacing: -0.0125rem;
}

.footer-credit strong {
  font-weight: 900;
  color: #63646d;
}

.footer-copyright {
  font-weight: 900;
}

/* -----------------------------------------------------------------------------
 * Desktop (> 1024px)
 * ---------------------------------------------------------------------------*/
@media (min-width: 1025px) {
  .footer-top {
    align-items: flex-start;
  }

  .footer-ctas {
    margin-top: 1rem;
  }
}

/* -----------------------------------------------------------------------------
 * Tablet + Mobile (≤ 1024px)
 * ---------------------------------------------------------------------------*/
@media (max-width: 1024px) {
  .footer-top {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .footer-chairs {
    width: clamp(12rem, 40vw, 22rem);
  }

  .footer-bottom-row {
    flex-direction: column;
    gap: 2.5rem;
  }

  .footer-columns {
    justify-content: flex-start;
    gap: 2.5rem;
  }
}

/* -----------------------------------------------------------------------------
 * Tablet
 * ---------------------------------------------------------------------------*/
@media (min-width: 641px) and (max-width: 1024px) {
  .site-footer {
    gap: 6rem;
    padding: 6rem 9% 2.125rem;
  }

  .footer-logo {
    width: clamp(13rem, 16vw, 16rem);
  }

  .footer-chairs {
    width: clamp(12rem, 30vw, 22rem);
  }

  .footer-ctas {
    gap: 0.5rem;
  }

  .footer-columns {
    justify-content: space-between;
    gap: 2.5rem;
    width: 100%;
  }

  .footer-group h3 {
    font-size: 1.3rem;
  }
}

/* -----------------------------------------------------------------------------
 * Mobile
 * ---------------------------------------------------------------------------*/
@media (max-width: 640px) {
  .site-footer {
    padding: 4rem 7.5% 3rem;
    gap: 3rem;
    /* Hartes Width-Cap: Footer darf nie über den Viewport wachsen.
       overflow-x: clip stoppt zusätzlich Overflow aus Children ohne
       neuen Scroll-Container anzulegen. */
    max-width: 100vw;
    overflow-x: clip;
  }

  .footer-cta {
    font-size: clamp(1.5rem, 7vw, 2rem);
    white-space: normal;
    overflow-wrap: anywhere;
    min-width: 0;
  }

  .footer-chairs-wrap {
    display: none;
  }

  .footer-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    column-gap: 4rem;
  }

  .footer-bottom {
    gap: 2rem;
  }

  .footer-group h3 {
    font-size: 0.9375rem;
    font-weight: 400;
  }

  .footer-group li {
    font-size: 1.1rem;
    line-height: 2rem;
  }

  .footer-group a {
    font-size: 1.1rem;
    /* line-height + min-height beide auf 2rem, weil .footer-group a
       per default display:inline-flex ist (für Icon+Text-Layout) und
       die Box-Höhe dann durch Flex-Items bestimmt wird, nicht vom
       line-height-Property. min-height greift. */
    line-height: 2rem;
    min-height: 2rem;
  }

  .footer-legal {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .footer-credit,
  .footer-copyright {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .footer-logo {
    width: clamp(8rem, 45vw, 12rem);
  }
}
</style>
