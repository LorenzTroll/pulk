// src/stores/pricing.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePricingStore = defineStore('pricing', () => {
  const plans = reactive([
    {
      key:        'business',
      title:      'Business',
      audience:   'Unternehmen, Agenturen, Verbände',
      context:    'Gesamter Raum für Team- oder Business-Meetings, Workshops, Präsentationen, Weiterbildungen und Klausurtagungen bis',
      maxPersons: 'max. 40 Personen',

      price:      50,
      unit:       'Euro / Stunde',
      priceAlt:   '1–25 Personen: 50 €/h · 26–40 Personen: 65 €/h',
      priceNote:  'Preis zzgl. MwSt. · Tagessatz ab 7 Stunden',

      tiers: [
        { maxPersons: 25, hourRate: 50, dayRate: 350 },
        { maxPersons: 40, hourRate: 65, dayRate: 455 }
      ],

      buttonText: 'Business-Paket anfragen',

      features: [
        'Ganzer Raum 100 qm',
        'Saalbestuhlung',
        '7 Tische',
        'Teeküche / Tresen',
        'Fernseher 50 Zoll',
        'Beamer',
        'Pinnwand',
        'Whiteboard'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofonierung'
      ],

      description: ''
    },

    {
      key:        'gruppen',
      title:      'Community',
      audience:   'Vereine, Initiativen, Künstler:innen',
      context:    'Für Netzwerktreffen, Workshops, Sprints, Team-Meetings, Seminare und Vorträge bis',
      maxPersons: 'max. 25 Personen',

      price:      25,
      unit:       'Euro / Stunde',
      priceAlt:   '1–10 Personen: 25 €/h · 11–25 Personen: 30 €/h',
      priceNote:  'Preis zzgl. MwSt. · Tagessatz ab 7 Stunden',

      tiers: [
        { maxPersons: 10, hourRate: 25, dayRate: 175 },
        { maxPersons: 25, hourRate: 30, dayRate: 210 }
      ],

      buttonText: 'Community-Paket anfragen',

      features: [
        'Workshop-Bereich',
        '7 Tische',
        '4 Werkbänke',
        'Teeküche / Tresen',
        'Fernseher 50 Zoll',
        'Pinnwand',
        'Whiteboard'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofonierung',
        'Beamer'
      ],

      description: ''
    },

    {
      key:        'individuell',
      title:      'Individuell',
      audience:   ' ',
      context:    'Kein Paket gefunden? Dann fragt uns bitte direkt an. Gemeinsam finden wir ein maßgeschneidertes Angebot, das sowohl deinem Vorhaben als auch unseren Möglichkeiten entspricht.',
      maxPersons: '',

      price:      null,
      unit:       '',
      priceLabel: '',

      tiers: [],

      buttonText: 'Individuelle Anfrage schicken',

      features: [
        'Kleine Gruppen',
        'Vereinsversammlungen',
        'Veranstaltungsreihen',
        'Ausstellungen',
        'Kurse',
        'Lesungen',
        'Apéro'
      ],

      onRequest: [],

      description: ''
    }
  ])

  /**
   * Berechnet den Gesamtpreis für einen Plan.
   * Ab 8 Stunden gilt der Tagessatz.
   */
  function calculatePrice(planKey, persons, hours) {
    const plan = plans.find(p => p.key === planKey)
    if (!plan?.tiers?.length) return null
    const tier = plan.tiers.find(t => persons <= t.maxPersons)
    if (!tier) return null
    return hours >= 7 ? tier.dayRate : hours * tier.hourRate
  }

  /**
   * Gibt den passenden Tier für eine Personenzahl zurück.
   */
  function getTier(planKey, persons) {
    const plan = plans.find(p => p.key === planKey)
    if (!plan?.tiers?.length) return null
    return plan.tiers.find(t => persons <= t.maxPersons) ?? null
  }

  return { plans, calculatePrice, getTier }
})
