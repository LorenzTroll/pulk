<script setup>
import { ref, nextTick } from 'vue'
import staticGalleryImg from '@/assets/slider-1.jpg'
import pulkArrow from '@/assets/pulk-arrow-accordeon.svg'

import gsap from 'gsap'
import { useRevealUp } from '@/composables/useRevealUp'
useRevealUp('.reveal-up')

import pulkHero from '@/assets/Pulk-hero-image_E2.svg'

// --- Accordion ---
const openIndex   = ref(null)
const contentRefs = []
const arrowRefs   = []

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
</script>

<template>
  <main class="landing-container">
    <!-- Hero-Image -->
    <div class="hero-container">
      <img :src="pulkHero" alt="PULK Hero Image" />
    </div>

    <!-- Intro -->
    <section class="intro-section">
      <div class="intro-image intro-image-left reveal-up">
        <img src="@/assets/intro-left.png" alt="Studio Eingang" />
      </div>

      <div class="intro-content">
        <h1>DEIN RAUM FÜR WORKSHOPS UND VERANSTALTUNGEN</h1>
        <p>
          100 Quadratmeter entworfen und gebaut, damit ihr ungestört Großes bewegen könnt.
          Gemütlich, privat, und möglichst vielseitig. Hier springen Ideen leichter von Kopf zu Kopf,
          werden aus Teammeetings Meilensteine und aus Präsentationen Momente, die hängen bleiben.
        </p>
      </div>

      <div class="intro-image intro-image-right reveal-up">
        <img src="@/assets/intro-right.jpg" alt="Studio Details" />
      </div>
    </section>

      <div class="static-preview">
        <img :src="staticGalleryImg" alt="Static Preview" />
      </div>

    <!-- Caption -->
    <div class="static-caption reveal-up">
      <h2 class="caption-title">MIETE DICH<br/>BEI UNS EIN</h2>
      <p class="caption-text reveal-up">
        Pulk passt sich euch an: wird Bühne, wird Ideenwerkstatt, wird Zuhörort. Möbel, die sich bewegen. Vorhänge, die den Raum neu zeichnen.
        Wohnlich, aber professionell. Privat, aber repräsentativ. Strukturiert, aber beweglich. Ein Raum an dem euer Team nicht nur zusammen sitzt,
        sondern vorankommt.
      </p>
    </div>

    <!-- Accordion -->
    <section class="accordion-section">
      <div
        v-for="(item, idx) in [
          { label: 'Nutzung',     content: 'Pulk ist vielseitig nutzbar: Ob Workshop, Team-Meeting, Präsentation, Lesung oder was auch immer euch einfällt. Partys gehören nicht zum Repertoire. Ihr mietet bei Workshops stundenweise. Angerechnet wird jede angebrochene Stunde. Bei Veranstaltungen und individuellen Anfragen werden, je nach Personenanzahl und Art der Veranstaltung, Festpreise berechnet. Die Details sprechen wir einfach gemeinsam durch.' },
          { label: 'Ausstattung', content: 'Damit ihr euch auf Inhalte konzentrieren könnt, ist alles da, was ihr braucht: 50-Zoll-Fernseher auf Rollen, Sound, grundsätzliche Workshopmaterialien, Pinnwände, Whiteboard, ausreichend Sitzmöglichkeiten und Werkbänke. Basics wie Toilette, Wasser, Strom, Teeküche, und Internet fehlen natürlich auch nicht. Mikrofone und Beamer müssen aktuell von euch mitgebracht oder extern gemietet werden.' },
          { label: 'Catering',    content: 'Was ihr braucht, wisst ihr am besten. Für die Organisation eines Cateringservice müsst ihr euch eigenständig kümmern. Gerne empfehlen wir euch auch lokale Partner: für veganes Catering ist das Anna Müller und für Gunnar Franke Getränke aus der Burgstraße.' },
          { label: 'Vertrag',     content: 'Unser Ziel: verbindliche Vereinbarung, transparente Preise, ohne versteckte Kosten. Dazu dient unser Vertrag, der das gewünschte Paket für alle Seiten festhält. Eine Nutzungsvereinbarung, der Umgang mit Schäden, ob Gegenstände, unbewegliches Mobiliar oder Personen, ist im Vertrag geregelt. Die Bezahlung muss vor deinem Workshop oder deiner Veranstaltung auf unserem Konto eingehen. Je nach Umfang und Personenanzahl kann eine Kaution erhoben werden und die Reinigungspauschale variieren.' }
        ]"
        :key="idx"
        class="accordion-item reveal-up"
      >
        <div class="accordion-header" @click="toggleAccordion(idx)">
          <h2 class="item-title">{{ item.label }}</h2>
          <img
            :src="pulkArrow"
            alt="toggle"
            class="icon-chevron"
            :ref="el => arrowRefs[idx] = el"
          />
        </div>
        <div class="accordion-content" :ref="el => contentRefs[idx] = el">
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
  padding: 2rem 1rem 1rem 1rem;
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

/* Intro */
.intro-section {
  position: relative;
  display: flex;
  align-items: center;
  padding: 5rem 6rem;
  gap: 1rem;
}
.intro-image-left { flex: 1 1 200px; max-width: 300px; }
.intro-image-left img {
  width: 110%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translate(-9rem, 3rem);
}
.intro-content {
  flex: 2 1 400px;
  max-width: 150%;
  text-align: left;
  display: flex;
  gap: 2rem;
  padding: 8rem 3rem 0 0;
}
.intro-content h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 900;
  margin-block-start: 0;
}
.intro-content p {
  font-size: 1.2rem;
  line-height: 1.5;
  width: 90%;
  color: rgba(255,255,255,0.85);
  margin-block-start: 0;
}
.intro-image-right { position: absolute; right: 17rem; top: 50%; width: 300px; }
.intro-image-right img {
  width: 90%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateY(-31rem);
}

/* Static Preview */
.preview-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 5rem 0 3rem;
}
.static-preview {
  width: 82%;
  height: 50rem;
  overflow: hidden;
  border-radius: 0.5rem;
  margin: 5rem auto;
  box-shadow: 0 4px 20px rgba(47, 35, 35, 0.1);
}
.static-preview img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  object-fit: cover;
}

/* Caption */
.static-caption { width: 80%; margin: 2.5rem auto 12rem; display: flex; }
.caption-title {
  flex: 0 40%;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #fff;
  margin: 0;
  line-height: 1.2;
  padding-left: 3rem;
}
.caption-text {
  flex: 0 0 50%;
  font-size: 1.2rem;
  line-height: 1.5;
  color: rgba(255,255,255,0.85);
  margin: 0;
}

/* Accordion */
.accordion-section { width: 74%; margin: 0 auto 15rem; border-top: 1px solid #141414; }
.accordion-item { border-bottom: 2px solid rgba(20,20,20,0.3); }
.accordion-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0; cursor: pointer;
}
/* Index-Styles entfernt */
.accordion-header .item-title {
  flex: 1; font-weight: 900; font-size: 3rem; color: #141414; padding-left: 0;
}
.icon-chevron { width: 3rem; transform-origin: center; transition: transform 0.4s ease; }
.accordion-content { overflow: hidden; height: 0; opacity: 0; padding: 0 9rem 1rem 0; }
.accordion-content p { margin: 0 0 3rem; color: #141414; font-size: 1.2rem; line-height: 1.6; }

/* responsive */
@media (max-width: 1024px) {
  .intro-image-right { right: 1rem; width: 250px; }
  .intro-content { max-width: 500px; }
}
@media (max-width: 640px) {
  .intro-section { flex-direction: column; text-align: center; padding: 2rem 1rem; }
  .intro-image-right, .intro-image-left { position: static; width: 100%; max-width: 100%; transform: none; margin-bottom: 2rem; }
  .intro-content { max-width: 100%; }
  .static-caption { width: 90%; margin: 1.5rem auto 0; }
  .caption-title { font-size: 2rem; }
  .caption-text { font-size: 0.9rem; }
  .accordion-header { padding: 0.75rem 0; }
  .accordion-content { padding-left: 1.5rem; }
  .accordion-content p { font-size: 0.9rem; }
}
</style>
