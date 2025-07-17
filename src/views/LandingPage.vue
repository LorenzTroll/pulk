<script setup>
import { ref, onMounted, onBeforeUpdate, nextTick } from 'vue'
import { useOverlayStore } from '@/stores/overlay'
import { useSliderStore } from '@/stores/slider'
import staticGalleryImg from '@/assets/slider-1.jpg'
import pulkArrow from '@/assets/pulk-arrow-accordeon.svg'
import gsap from 'gsap'

import pulkHero from '@/assets/Pulk-hero-image.svg'
const overlay = useOverlayStore()

const slider      = useSliderStore()
const slides      = slider.slides
const activeIndex = ref(null)

// refs für die kleinen Vorschauen
const previewRefs = slides.map(() => ref(null))

onBeforeUpdate(() => previewRefs.forEach(r => r.value = null))

onMounted(() => {
  // Basis-Verteilung der Previews
  previewRefs.forEach(r => {
    const el      = r.value
    const basis   = gsap.utils.random(10, 20)
    const offsetX = gsap.utils.random(0, 0)
    const offsetY = gsap.utils.random(0, 0)
    gsap.set(el, { flexBasis: `${basis}%`, x: offsetX, y: offsetY })
  })
})

function handleMouseEnter(idx) {
  activeIndex.value = idx
  previewRefs.forEach((r, i) => {
    const el       = r.value
    if (!el) return
    const isActive = i === idx

    gsap.to(el, {
      flexBasis: isActive ? '40%' : '10%',
      scale:     isActive ? 1.05 : 0.9,
      margin:    isActive ? '0 2rem' : '0 1rem',
      duration:  0.6,
      ease:      'elastic.out(1, 0.5)'
    })
  })
}

function handleMouseLeave() {
  activeIndex.value = null
  previewRefs.forEach(r => {
    const el = r.value
    if (!el) return
    const basis = gsap.utils.random(10, 20)
    gsap.to(el, {
      flexBasis: `${basis}%`,
      scale:     1,
      margin:    '0 1rem',
      duration:  0.6,
      ease:      'power2.out'
    })
  })
}

const openIndex   = ref(null)
const contentRefs = []
const arrowRefs   = []
const indexRefs    = []

function toggleAccordion(i) {
  const willOpen = openIndex.value !== i
  openIndex.value = willOpen ? i : null
  nextTick(() => animateAccordion(i, willOpen))
}

function animateAccordion(i, open) {
  const contentEl = contentRefs[i]
  const arrowEl   = arrowRefs[i]
  if (!contentEl || !arrowEl) return

  if (open) {
    gsap.set(contentEl, { height: 0, opacity: 0 })
    gsap.to(arrowEl,   { rotation: 180, duration: 0.2, ease: 'power1.out' })
    gsap.to(contentEl, {
      height: 'auto', opacity: 1,
      duration: 0.5, ease: 'power1.out'
    })
  } else {
    gsap.to(arrowEl,   { rotation: 0, duration: 0.4, ease: 'power1.in' })
    gsap.to(contentEl, {
      height: 0, opacity: 0,
      duration: 0.4, ease: 'power1.in'
    })
  }
}

function animateIndexHover(i, enter) {
  const el = indexRefs[i]
  if (!el) return
  gsap.to(el, {
    fontWeight: enter ? '900' : '400',
    duration: 0.3,
    ease: enter ? 'power1.out' : 'power1.in'
    })
}
</script>

<template>
  <main class="landing-container">
    <!-- Hero-Image (großer PULK-Schriftzug) -->
    <div class="hero-container">
      <img
        :src="pulkHero"
        alt="PULK Hero Image"
      />
    </div>
<!-- Intro mit zwei Bildern und Text -->
  <section class="intro-section">
    <div class="intro-image intro-image-left">
      <img src="@/assets/intro-left.jpg" alt="Studio Eingang" />
    </div>

    <!-- neuer Wrapper für Headline + Text -->
    <div class="intro-content">
      <h1>DEIN RAUM FÜR WORKSHOPS UND PLATZ FÜR GRUPPEN</h1>
      <p>
        100 Quadratmeter, um Menschen zusammenzubringen, für die Sitzung eures
        Vereins, die Präsentation eurer Firma oder kleine öffentliche
        Veranstaltungen. Für alles andere könnt ihr uns anfragen.
      </p>
    </div>

    <!-- absolut positioniertes rechtes Bild -->
    <div class="intro-image intro-image-right">
      <img src="@/assets/intro-right.jpg" alt="Studio Details" />
    </div>
  </section>

  <div class="preview-gallery">
    <!-- großes, statisches Bild -->
    <div class="static-preview">
      <img :src="staticGalleryImg" alt="Static Preview" />
    </div>

    <!--
    <div class="previews" @mouseleave="handleMouseLeave">
      <div
        v-for="(img, idx) in slides"
        :key="idx"
        class="preview"
        @mouseenter="handleMouseEnter(idx)"
        :ref="el => previewRefs[idx].value = el"
      >
        <img :src="img" alt="Vorschau Bild" />
      </div>
    </div>
    -->
  </div>

      <!-- neuer Caption-Block unter dem statischen Bild -->
    <div class="static-caption">
      <h2 class="caption-title">
        MIETE DICH<br/>BEI UNS EIN
      </h2>
      <p class="caption-text">
        Unser Studio ist so gestaltet, dass es vielseitig und modular ist,
        um euch den Freiraum und die Flexibilität zu bieten, die ihr für euer
        Vorhaben braucht. 100 qm für euch, ganz privat, ohne Ablenkung,
        direkt an der Saale. Wenn du wissen möchtest, ob unser Raum für deine
        Idee passt, findest du weitere Infos in unserem FAQ.
      </p>
    </div>

   <!-- Accordion-Liste -->
<section class="accordion-section">
  <div
    v-for="(item, idx) in [
      { label: 'Nutzung',     content: 'Hier steht jetzt dein Text zu Nutzung.' },
      { label: 'Ausstattung', content: 'Hier steht jetzt dein Text zu Ausstattung.' },
      { label: 'Catering',    content: 'Hier steht jetzt dein Text zu Catering.' },
      { label: 'Vertrag',     content: 'Hier steht jetzt dein Text zu Vertrag.' }
    ]"
    :key="idx"
    class="accordion-item"
  >
    <div
      class="accordion-header"
      @click="toggleAccordion(idx)"
      @mouseenter="animateIndexHover(idx, true)"
      @mouseleave="animateIndexHover(idx, false)"
    >
      <span
        class="index"
        :ref="el => indexRefs[idx] = el"
      >
        {{ (idx+1).toString().padStart(2,'0') }}
      </span>
      <h2 class="item-title">{{ item.label }}</h2>
      <img
        :src="pulkArrow"
        alt="toggle"
        class="icon-chevron"
        :ref="el => arrowRefs[idx] = el"
      />
    </div>
    <div
      class="accordion-content"
      :ref="el => contentRefs[idx] = el"
    >
      <p>{{ item.content }}</p>
    </div>
  </div>
</section>
  </main>
</template>

<style scoped>
/* Gesamt-Layout */
.landing-container {
  background-color: #9687FF;
  color: #fff;
  font-family: 'TWK Everett', sans-serif;
  overflow-x: hidden;
}

/* Hero-Image */
.hero-container {
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Intro-Section jetzt relativ für das absolute Bild */
.intro-section {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4rem 6rem;
  gap: 8rem;
}

/* Linkes Bild – bleibt im Flow */
.intro-image-left {
  flex: 1 1 200px;
  max-width: 300px;
}
.intro-image-left img {
  width: 110%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* Content mittig */
.intro-content {
  flex: 2 1 400px;
  max-width: 100%;
  text-align: left;
  display: flex;
  gap: 3rem;
  padding: 8rem 4rem 0rem 0rem;
}
.intro-content h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  text-align: left;
  font-weight: 900;
  width: 100%;
  margin-block-start: 0rem;
}
.intro-content p {
  font-size: 1.2rem;
  line-height: 1.5;
  width: 70%;
  color: rgba(255,255,255,0.85);
  margin-block-start: 0rem;
}

/* Rechtes Bild absolut positioniert, immer vertikal zentriert */
.intro-image-right {
  position: absolute;
  right: 17rem;
  top: 50%;
  transform: translateY(-33rem);
  width: 300px;
}
.intro-image-right img {
  width: 90%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* Gallery */
.preview-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 5rem 0rem 3rem 0rem;
}

/* Neues, großes Bild oben */
.static-preview {
  width: 82%;
  height: 50rem;
  overflow: hidden;
  border-radius: 0.5rem;
  margin: 5rem 0rem rem 0rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.static-preview img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  object-fit: cover;
}

/* bestehende Vorschau-Galerie */
.previews {
  display: flex;
  width: 85%;
  height: 400px;      /* mehr Höhe für Y-Offsets */
  gap: 1rem;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: visible;
}

.preview {
  flex: 0 1 auto;
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transform-origin: center center;
  margin: 0 1rem;
  cursor: pointer;
  transition: box-shadow 0.3s;
}
.preview:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.preview img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
}

/* Caption unter dem statischen Bild */
.static-caption {
  width: 80%;
  margin: 2.5rem auto 10rem;
  display: flex;
}

.caption-title {
  flex: 0 40%;
  font-family: 'TWK Everett', sans-serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #fff;
  margin: 0;
  line-height: 1.2;
  padding-left: 3rem;
}

.caption-text {
  flex: 0 0 50%;
  font-family: 'TWK Everett', sans-serif;
  font-size: 1.2rem;
  line-height: 1.5;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* Accordion */
.accordion-section {
  width: 74%;
  margin: 0 auto 15rem;
  border-top: 1px solid #141414;
}
.accordion-item {
  border-bottom: 2px solid rgba(20,20,20,0.3);
}
.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rem 0;
  cursor: pointer;
}
.accordion-header .index {
  font-size: 2rem;
  font-weight: 600;
  margin-right: 1rem;
  color: #141414;
  display: inline-block;
  width: 3rem;
}
.accordion-header .item-title {
  flex: 1;
  font-weight: 900;
  font-size: 3rem;
  color: #141414;
  padding-left: 9rem;
}
.icon-chevron {
  width: 3rem;
  transform-origin: center;
  transition: transform 0.4s ease;
}
.accordion-content {
  overflow: hidden;
  height: 0;
  opacity: 0;
  padding-left: 13rem;
  padding-right: 10rem;
}
.accordion-content p {
  margin: 0 0 3rem;
  color: #141414;
  font-size: 1.2rem;
  line-height: 1.6;
}

/* responsive Anpassungen */
@media (max-width: 1024px) {
  .intro-image-right {
    right: 1rem;
    width: 250px;
  }
  .intro-content {
    max-width: 500px;
  }
}
@media (max-width: 640px) {
  .intro-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  .intro-image-right,
  .intro-image-left {
    position: static;
    width: 100%;
    max-width: 100%;
    transform: none;
    margin-bottom: 2rem;
  }
  .intro-content {
    max-width: 100%;
  }
  .static-caption {
    width: 90%;
    margin: 1.5rem auto 0;
  }
  .caption-title {
    font-size: 2rem;
  }
  .caption-text {
    font-size: 0.9rem;
  }
  .accordion-header { padding: 0.75rem 0; }
  .accordion-content { padding-left: 1.5rem; }
  .accordion-content p { font-size: 0.9rem; }
}
</style>
