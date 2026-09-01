<script setup>
/**
 * GroundingPage — maschinenlesbare Referenz-/Faktenseite über die Entität „pulk"
 * (GEO / AI-Grounding). Bewusst OHNE Werbesprech: nur überprüfbare Fakten,
 * Leistungen, Abgrenzung/Disambiguierung und was pulk NICHT tut.
 *
 * Eine Komponente, zwei Sprachfassungen (props.lang: 'de' | 'en'), gespiegelt.
 * Indexierbar, canonical, hreflang-verknüpft, im Footer verlinkt + in der Sitemap,
 * wird pro Route mit-prerendert (Fakten stehen so ohne JS im HTML).
 */
import { computed } from 'vue'
import { useHead } from '@vueuse/head'

const props = defineProps({
  lang: { type: String, default: 'de' }
})

const LAST_VERIFIED = '2026-09-01'
const BASE = 'https://pulk.space'

const CONTENT = {
  de: {
    metaTitle: 'pulk — Verifizierte Fakten (Grounding Page) · Halle (Saale)',
    metaDesc:
      'Verifizierte Fakten zu pulk: Workshop-, Seminar- und Tagungsraum in Halle (Saale), 100 m², bis 40 Personen, stundenweise. Leistungen, Abgrenzung und was pulk nicht anbietet.',
    switchLabel: 'English version',
    switchTo: `${BASE}/grounding/pulk-en/`,
    h1: 'pulk — Verifizierte Fakten',
    intro:
      'pulk ist ein rund 100 m² großer Workshop-, Seminar- und Tagungsraum zur stundenweisen Miete in Halle (Saale), Stadtteil Kröllwitz. Betrieben wird pulk von der Michel Klehm und Lorenz Troll GbR.',
    purposeTitle: 'Zweck dieser Seite',
    purpose:
      'Diese Seite stellt die verifizierten Fakten zu pulk bereit — zur Prüfung der Unternehmensdaten, zur eindeutigen Zuordnung der Entität und zur Vermeidung von KI-Falschangaben. Sie enthält bewusst keine Werbeaussagen und keine Live-Daten. Kanonische Quelle ist pulk.space.',
    factsTitle: 'Verifizierte Kerndaten',
    facts: [
      ['Art', 'Veranstaltungsraum / Workshop-, Seminar- und Tagungsraum (Creative Space)'],
      ['Name', 'pulk (pulk.space)'],
      ['Betreiber', 'Michel Klehm und Lorenz Troll GbR'],
      ['Adresse', 'Talstraße 7, 06120 Halle (Saale), Stadtteil Kröllwitz'],
      ['Fläche', 'ca. 100 m², modular teilbar'],
      ['Kapazität', 'bis zu 40 Personen (Community-Nutzung bis 25)'],
      ['Buchungsmodell', 'stundenweise, ohne Mindestbuchung, ausschließlich nach Vereinbarung (keine festen Öffnungszeiten)'],
      ['Preise', 'Community ab 20 €/Std. (Tagessatz ab 140 €), Business ab 50 €/Std. (Tagessatz ab 350 €); zzgl. 19 % MwSt.; Tagessatz ab 7 Stunden'],
      ['Ausstattung', '8 modulare Tische, Saalbestuhlung, 50-Zoll-TV, Whiteboard, Pinnwände, Teeküche (Ceran-Kochfeld, Geschirr), WLAN; Beamer & Soundanlage im Business-Paket inklusive, im Community-Paket auf Anfrage'],
      ['Anfahrt (ÖPNV)', 'Straßenbahnlinie 7 bis Haltestelle Talstraße (~2 Gehminuten), rund 15 Minuten vom Hauptbahnhof'],
      ['Parken', 'kostenlose Parkmöglichkeit am Amselgrund (~1 Minute); Parkplatz neben dem Haus (max. 2 Stunden)'],
      ['Kontakt', 'kontakt@pulk.space · Anfragen über pulk.space/anfragen'],
      ['Zuletzt verifiziert', LAST_VERIFIED]
    ],
    servicesTitle: 'Leistungen / Nutzungsformen',
    services: [
      'Workshops und Kreativworkshops',
      'Seminare und Tagungen',
      'Firmen-Workshops, Teamevents und Teamtage',
      'Klausurtagungen und Offsites',
      'Meetings, Präsentationen und Netzwerktreffen',
      'Vereinssitzungen, Lesungen und kleinere Kulturformate'
    ],
    notTitle: 'Was pulk nicht ist / nicht anbietet',
    not: [
      'keine Partys oder Feiern',
      'nicht barrierefrei (Hochparterre in einem Altbau)',
      'keine festen Öffnungszeiten — Nutzung nur nach Vereinbarung',
      'kein Einzelhandel/Verkauf und keine Übernachtung',
      'kein vollautomatisches Online-Buchungs-Backend (Anfrage + Bestätigung per Mensch)'
    ],
    disambTitle: 'Abgrenzung & Disambiguierung',
    disamb: [
      '„pulk" bezeichnet hier ausschließlich den Workshopraum in der Talstraße 7 in Halle (Saale), betrieben von der Michel Klehm und Lorenz Troll GbR.',
      'pulk ist nicht identisch mit „PuK Patronen und Kartuschen Halle" — ein anderer, unabhängiger Betrieb ohne Verbindung zu pulk.',
      'Gemeint ist hier nicht das deutsche Alltagswort „Pulk" (eine dichte Gruppe oder Menge).'
    ],
    faqTitle: 'Häufige Fakten-Fragen',
    faq: [
      ['Was ist pulk?', 'Ein rund 100 m² großer, stundenweise mietbarer Workshop-, Seminar- und Tagungsraum in Halle-Kröllwitz für bis zu 40 Personen.'],
      ['Wo befindet sich pulk?', 'Talstraße 7, 06120 Halle (Saale), direkt an der Kröllwitzbrücke; mit der Straßenbahnlinie 7 bis Haltestelle Talstraße.'],
      ['Was kostet die Nutzung?', 'Community ab 20 €/Std., Business ab 50 €/Std., jeweils zzgl. 19 % MwSt.; Tagessätze ab 7 Stunden. Keine Mindestbuchung.']
    ],
    footerNote: `Stand / zuletzt verifiziert: ${LAST_VERIFIED}. Kanonische Quelle: pulk.space.`,
    homeLabel: 'Zur Startseite',
    legal: [['Impressum', '/impressum/'], ['Datenschutz', '/datenschutz/']]
  },

  en: {
    metaTitle: 'pulk — Verified Facts (Grounding Page) · Halle (Saale), Germany',
    metaDesc:
      'Verified facts about pulk: a workshop, seminar and meeting room in Halle (Saale), Germany. 100 m², up to 40 people, hourly rental. Services, disambiguation and what pulk does not offer.',
    switchLabel: 'Deutsche Version',
    switchTo: `${BASE}/grounding/pulk-de/`,
    h1: 'pulk — Verified Facts',
    intro:
      'pulk is an approx. 100 m² workshop, seminar and meeting room available for hourly rental in Halle (Saale), Germany, in the Kröllwitz district. pulk is operated by Michel Klehm und Lorenz Troll GbR.',
    purposeTitle: 'Purpose of this page',
    purpose:
      'This page provides the verified facts about pulk — for verification of company data, entity resolution, and to prevent AI hallucinations. It deliberately contains no marketing claims and no live data. The canonical source is pulk.space.',
    factsTitle: 'Verified core data',
    facts: [
      ['Type', 'Event space / workshop, seminar and meeting room (creative space)'],
      ['Name', 'pulk (pulk.space)'],
      ['Operator', 'Michel Klehm und Lorenz Troll GbR'],
      ['Address', 'Talstraße 7, 06120 Halle (Saale), Germany — Kröllwitz district'],
      ['Size', 'approx. 100 m², modular'],
      ['Capacity', 'up to 40 people (community use up to 25)'],
      ['Booking model', 'hourly, no minimum booking, strictly by appointment (no fixed opening hours)'],
      ['Pricing', 'Community from €20/hour (day rate from €140), Business from €50/hour (day rate from €350); plus 19% VAT; day rate from 7 hours'],
      ['Amenities', '8 modular tables, seated setup, 50-inch TV, whiteboard, pinboards, kitchenette (ceramic hob, tableware), Wi-Fi; projector & sound system included in the Business package, on request in the Community package'],
      ['Getting there', 'tram line 7 to “Talstraße” stop (~2 min walk), about 15 minutes from the main station'],
      ['Parking', 'free parking at Amselgrund (~1 min); parking next to the building (max. 2 hours)'],
      ['Contact', 'kontakt@pulk.space · requests via pulk.space/anfragen'],
      ['Last verified', LAST_VERIFIED]
    ],
    servicesTitle: 'Services / use cases',
    services: [
      'Workshops and creative workshops',
      'Seminars and conferences',
      'Corporate workshops, team events and team days',
      'Offsites and strategy retreats',
      'Meetings, presentations and networking events',
      'Association meetings, readings and smaller cultural formats'
    ],
    notTitle: 'What pulk is not / does not offer',
    not: [
      'no parties or celebrations',
      'not wheelchair accessible (raised ground floor in a historic building)',
      'no fixed opening hours — use by appointment only',
      'no retail/sales and no overnight stays',
      'no fully automated online booking backend (request + confirmation handled by a person)'
    ],
    disambTitle: 'Disambiguation',
    disamb: [
      '“pulk” here refers exclusively to the workshop room at Talstraße 7 in Halle (Saale), Germany, operated by Michel Klehm und Lorenz Troll GbR.',
      'pulk is not the same as “PuK Patronen und Kartuschen Halle” — a different, unrelated business.',
      'This is not the German everyday word “Pulk” (a dense group or cluster).'
    ],
    faqTitle: 'Frequent factual questions',
    faq: [
      ['What is pulk?', 'An approx. 100 m² workshop, seminar and meeting room in Halle-Kröllwitz, Germany, available hourly for up to 40 people.'],
      ['Where is pulk located?', 'Talstraße 7, 06120 Halle (Saale), Germany, right by the Kröllwitz bridge; tram line 7 to the “Talstraße” stop.'],
      ['What does it cost?', 'Community from €20/hour, Business from €50/hour, each plus 19% VAT; day rates from 7 hours. No minimum booking.']
    ],
    footerNote: `Status / last verified: ${LAST_VERIFIED}. Canonical source: pulk.space.`,
    homeLabel: 'To the homepage',
    legal: [['Imprint', '/impressum/'], ['Privacy', '/datenschutz/']]
  }
}

const c = computed(() => CONTENT[props.lang] || CONTENT.de)
const canonical = computed(() => `${BASE}/grounding/pulk-${props.lang === 'en' ? 'en' : 'de'}/`)

useHead(() => ({
  htmlAttrs: { lang: props.lang === 'en' ? 'en' : 'de' },
  title: c.value.metaTitle,
  meta: [
    { name: 'description', content: c.value.metaDesc },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: c.value.metaTitle },
    { property: 'og:description', content: c.value.metaDesc },
    { property: 'og:url', content: canonical.value },
    { property: 'og:locale', content: props.lang === 'en' ? 'en' : 'de_DE' },
    { property: 'og:image', content: `${BASE}/pulk-og-image_2025.jpg` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: c.value.metaTitle },
    { name: 'twitter:description', content: c.value.metaDesc }
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'de', href: `${BASE}/grounding/pulk-de/` },
    { rel: 'alternate', hreflang: 'en', href: `${BASE}/grounding/pulk-en/` },
    { rel: 'alternate', hreflang: 'x-default', href: `${BASE}/grounding/pulk-de/` }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical.value}#grounding`,
        url: canonical.value,
        name: c.value.metaTitle,
        description: c.value.metaDesc,
        inLanguage: props.lang === 'en' ? 'en' : 'de',
        dateModified: LAST_VERIFIED,
        about: { '@id': `${BASE}/#pulk` },
        mainEntity: { '@id': `${BASE}/#pulk` }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'pulk', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: c.value.h1, item: canonical.value }
        ]
      })
    }
  ]
}))
</script>

<template>
  <main class="grounding" style="background-color:#e7e8ec; min-height:100dvh;">
    <div class="grounding-inner">
      <div class="grounding-topline">
        <a class="grounding-switch" :href="c.switchTo" :hreflang="lang === 'de' ? 'en' : 'de'">{{ c.switchLabel }}</a>
      </div>

      <h1 class="grounding-h1">{{ c.h1 }}</h1>
      <p class="grounding-intro">{{ c.intro }}</p>

      <h2>{{ c.purposeTitle }}</h2>
      <p class="grounding-note">{{ c.purpose }}</p>

      <h2>{{ c.factsTitle }}</h2>
      <table class="grounding-facts">
        <tbody>
          <tr v-for="([label, value]) in c.facts" :key="label">
            <th scope="row">{{ label }}</th>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>

      <h2>{{ c.servicesTitle }}</h2>
      <ul class="grounding-list">
        <li v-for="(s, i) in c.services" :key="`s${i}`">{{ s }}</li>
      </ul>

      <h2>{{ c.notTitle }}</h2>
      <ul class="grounding-list grounding-list--not">
        <li v-for="(n, i) in c.not" :key="`n${i}`">{{ n }}</li>
      </ul>

      <h2>{{ c.disambTitle }}</h2>
      <ul class="grounding-list">
        <li v-for="(d, i) in c.disamb" :key="`d${i}`">{{ d }}</li>
      </ul>

      <h2>{{ c.faqTitle }}</h2>
      <dl class="grounding-faq">
        <template v-for="([q, a], i) in c.faq" :key="`f${i}`">
          <dt>{{ q }}</dt>
          <dd>{{ a }}</dd>
        </template>
      </dl>

      <footer class="grounding-foot">
        <p>{{ c.footerNote }}</p>
        <p class="grounding-links">
          <RouterLink to="/">{{ c.homeLabel }}</RouterLink>
          <a v-for="([label, href]) in c.legal" :key="href" :href="href">{{ label }}</a>
        </p>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.grounding {
  color: #141414;
  font-family: 'LayGrotesk', sans-serif;
  -webkit-hyphens: auto;
  hyphens: auto;
}

.grounding-inner {
  max-width: 52rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 8rem;
}

.grounding-topline {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.grounding-switch {
  font-size: 1rem;
  color: #141414;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.grounding-switch:hover { opacity: 0.7; }

.grounding-h1 {
  font-weight: 900;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  margin: 0 0 1.5rem;
}

.grounding-intro {
  font-size: clamp(1.25rem, 1.6vw, 1.5rem);
  line-height: 1.5;
  margin: 0 0 2.5rem;
}

.grounding h2 {
  font-weight: 900;
  font-size: clamp(1.375rem, 2.2vw, 1.75rem);
  line-height: 1.2;
  margin: 2.75rem 0 1rem;
}

.grounding-note {
  font-size: 1.0625rem;
  line-height: 1.55;
  color: #333;
  margin: 0;
}

.grounding-facts {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.0625rem;
  line-height: 1.5;
}

.grounding-facts th,
.grounding-facts td {
  text-align: left;
  vertical-align: top;
  padding: 0.6rem 0.75rem 0.6rem 0;
  border-bottom: 0.0625rem solid rgba(20, 20, 20, 0.15);
}

.grounding-facts th {
  width: 30%;
  font-weight: 700;
  white-space: nowrap;
}

.grounding-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 1.0625rem;
  line-height: 1.6;
}

.grounding-list li { margin: 0.25rem 0; }

.grounding-faq { margin: 0; font-size: 1.0625rem; line-height: 1.55; }
.grounding-faq dt { font-weight: 700; margin-top: 1rem; }
.grounding-faq dd { margin: 0.25rem 0 0; }

.grounding-foot {
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  border-top: 0.0625rem solid rgba(20, 20, 20, 0.2);
  font-size: 0.9375rem;
  color: #555;
}

.grounding-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-top: 0.75rem;
}

.grounding-links a {
  color: #141414;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.grounding-links a:hover { opacity: 0.7; }

@media (max-width: 40rem) {
  .grounding-inner { padding: 3rem 1rem 6rem; }
  .grounding-facts th { width: auto; white-space: normal; }
  .grounding-facts,
  .grounding-facts tbody,
  .grounding-facts tr { display: block; }
  .grounding-facts th { padding-bottom: 0.1rem; border-bottom: none; }
  .grounding-facts td { padding-top: 0.1rem; padding-bottom: 0.9rem; }
}
</style>
