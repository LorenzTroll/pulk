<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ArrowIcon from './ArrowIcon.vue'
import footerChairs from '@/assets/footer-chairs_E1.webp?w=800&format=webp;png&as=picture'
import LogoWhite from '@/assets/pulk-logo-white_E3.svg'

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
 * Tracking (MDAL analytics)
 * ---------------------------------------------------------------------------*/
/** Track Instagram click through MDAL analytics (if available) */
function trackInstagramClick() {
  if (window.MDAL?.event) {
    window.MDAL.event({
      Name: 'social-link',
      Parameters: [{ Name: 'type', Value: 'instagram' }]
    })
  }
}

const route = useRoute()
// all routes, footer is invisible
const modalRoutes = ['about', 'preise', 'miete']

const isAbsolute = computed(() =>
  modalRoutes.includes(route.name)
)
</script>

<template>
  <footer class="site-footer" :class="{ 'footer-absolute': isAbsolute }">
    <div class="footer-inner">
      <!-- LEFT SIDE: Info columns -->
      <div class="footer-left">
        <!-- Address -->
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
              >
                Route
                <ArrowIcon class="arrow yellow" />
              </a>
            </li>
          </ul>
        </div>
        <!-- Pages -->
        <div class="footer-group">
          <h3>Seiten</h3>
          <ul>
            <li>
              <router-link to="/miete">
                Mieten <ArrowIcon class="arrow purple" />
              </router-link>
            </li>
            <li>
              <router-link to="/about">
                About <ArrowIcon class="arrow purple" />
              </router-link>
            </li>
            <li>
              <router-link to="/preise">
                Preise <ArrowIcon class="arrow purple" />
              </router-link>
            </li>
          </ul>
        </div>
        <!-- Social Media -->
        <div class="footer-group">
          <h3>Social Media</h3>
          <ul>
            <li>
              <a
                :href="instagramUrl"
                target="_blank"
                rel="noopener"
                @click="trackInstagramClick"
              >
                Instagram <ArrowIcon class="arrow orange" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <!-- RIGHT SIDE: Chairs image -->
      <div class="footer-right">
        <picture>
          <source
            v-for="s in footerChairs.sources"
            :key="s.srcset"
            :srcset="s.srcset"
            :type="s.type"
          />
          <img
            :src="footerChairs.img.src"
            alt="Drei Stühle"
            class="footer-chairs"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </div>
    <!-- BOTTOM SECTION -->
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <!-- Logo -->
        <div class="footer-logo-wrap">
          <router-link to="/">
            <img :src="LogoWhite" alt="PULK Logo weiß" class="footer-logo" />
          </router-link>
        </div>
        <!-- Divider Line -->
        <div class="footer-divider"></div>
        <!-- Legal section -->
        <div class="footer-legal">
          <div class="legal-links">
            <router-link :to="datenschutzHref">Datenschutz</router-link>
            <router-link :to="impressumHref">Impressum</router-link>
          </div>
          <div class="copyright">
            © {{ company }} {{ year }}
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* -----------------------------------------------------------------------------
 * Footer container
 * ---------------------------------------------------------------------------*/
.site-footer {
  background: #212121;
  color: #fff;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
  padding-top: 3rem;
  font-family: 'LayGrotesk', sans-serif;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* -----------------------------------------------------------------------------
 * Top content area
 * ---------------------------------------------------------------------------*/
.footer-inner {
  max-width: 1400px;
  width: 80%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4rem;
}

.footer-left {
  display: flex;
  gap: 5rem;
  flex: 1 1 60%;
  flex-wrap: nowrap;
  padding-top: 1rem;
}

.footer-group {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.footer-group h3 {
  color: #b0b0b0;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.footer-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.footer-group a {
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.footer-group a:hover {
  color: #9687ff;
}

/* Footer – Seitenliste grau */
.footer-group:nth-child(2) a {
  color: #b0b0b0;
}

.footer-group:nth-child(2) a:hover {
  color: #fff;
}

/* Arrow icons */
.arrow {
  width: 0.8rem;
  height: 0.8rem;
  margin-left: 0.4rem;
  vertical-align: middle;
}
.arrow.purple { color: #9687ff; }
.arrow.orange { color: #ff5533; }
.arrow.yellow { color: #f2b607; }

/* Right image */
.footer-right {
  flex: 0 0 auto;
}
.footer-chairs {
  width: clamp(18rem, 22vw, 30rem);
  height: auto;
  object-fit: contain;
  transition: width 0.3s ease;
}

.footer-absolute {
  position: relative;
  left: 0;
  right: 0;
  bottom: 0;
}

/* -----------------------------------------------------------------------------
 * Bottom section
 * ---------------------------------------------------------------------------*/
.footer-bottom {
  width: 100%;
  background: #212121;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
}

.footer-bottom-inner {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.footer-logo-wrap {
  display: flex;
}

.footer-logo {
  width: clamp(6rem, 8vw, 8rem);
  height: auto;
}

.footer-divider {
  width: 100%;
  border-bottom: 1px solid #3a3a3a;
}

.footer-legal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a8a8a8;
  font-size: 0.95rem;
}

.legal-links {
  display: flex;
  gap: 2rem;
}

.legal-links a {
  color: #b0b0b0;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}
.legal-links a:hover {
  color: #fff;
}

.copyright {
  font-weight: 600;
  color: #b0b0b0;
}

/* -----------------------------------------------------------------------------
 * Tablet
 * ---------------------------------------------------------------------------*/
@media (max-width: 1024px) {
  .footer-inner {
    gap: 2rem;
  }
  .footer-left {
    flex-wrap: wrap;
    gap: 3rem;
  }
  .footer-chairs {
    width: clamp(14rem, 22vw, 20rem);
  }
}

/* -----------------------------------------------------------------------------
 * Mobile
 * ---------------------------------------------------------------------------*/
@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    width: 88%;
  }

  .footer-right {
    display: none;
  }

  .footer-left {
    width: 100%;
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 2rem;
  }

  .footer-bottom {
    margin-top: 5rem;
  }

  .footer-bottom-inner {
    width: 88%;
  }

  .footer-legal {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .legal-links {
    gap: 2.5rem;
  }
}
</style>
