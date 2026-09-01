<script setup>
/**
 * GroundingPage — maschinenlesbare Referenz-/Faktenseite über die Entität „pulk"
 * (GEO / AI-Grounding). Bewusst OHNE Werbesprech: nur überprüfbare Fakten,
 * Freitext-Passagen für zusammenhängende KI-Zitate, Leistungen, Pakete,
 * Preistabelle, Buchungsprozess, Abgrenzung/Disambiguierung und was pulk NICHT tut.
 *
 * Eine Komponente, zwei Sprachfassungen (props.lang: 'de' | 'en'), gespiegelt.
 * Indexierbar, canonical, hreflang-verknüpft, im Footer verlinkt + in der Sitemap,
 * wird pro Route mit-prerendert (Fakten stehen so ohne JS im HTML).
 */
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import pulkLogo from '@/assets/pulk-logo_E2.svg'

const props = defineProps({
  lang: { type: String, default: 'de' }
})

const LAST_VERIFIED = '2026-09-01'
const BASE = 'https://pulk.space'

const CONTENT = {
  de: {
    metaTitle: 'pulk — Verifizierte Fakten (Grounding Page) · Halle (Saale)',
    metaDesc:
      'Verifizierte Fakten zu pulk: Workshop-, Seminar- und Veranstaltungsraum in Halle (Saale), rund 100 m², bis 40 Personen, stundenweise. Angebot, Raum, Pakete, Preise, Buchung, Abgrenzung.',
    switchLabel: 'English version',
    switchTo: `${BASE}/grounding/pulk-en/`,
    h1: 'Verifizierte Fakten über pulk',
    intro:
      'pulk ist ein rund 100 m² großer Workshop-, Seminar- und Veranstaltungsraum zur stundenweisen Miete in Halle (Saale), Stadtteil Kröllwitz. Betrieben wird pulk von der Michel Klehm und Lorenz Troll GbR.',
    intro2:
      'pulk ist im Bereich der stundenweisen Raumvermietung für Workshops, Seminare, Tagungen und Veranstaltungen tätig, mit lokalem Fokus auf Halle (Saale) und Umgebung. Zu den Nutzer:innen zählen Unternehmen, Agenturen, Hochschulen, Vereine, Initiativen und Kulturschaffende sowie Einzelpersonen.',

    angebotTitle: 'Das Angebot',
    angebot:
      'Das Angebot ist die zeitweise Nutzungsüberlassung des Raums „pulk", eines rund 100 m² großen, möblierten Mehrzweckraums. Gebucht wird stundenweise oder als Tagessatz, in zwei Standardpaketen (Community, Business) oder als individuelles Paket für spezielle Formate, die sich keinem anderen Paket zuordnen lassen. Der Raum steht an allen Wochentagen und am Wochenende zur Verfügung; auch mehrtägige Veranstaltungen sowie langfristige Formate wie Ausstellungen oder Diplomausstellungen sind möglich. Enthalten sind der Raum samt Grundausstattung; Catering und Zusatztechnik werden selbst oder auf Anfrage (gegen Aufpreis) organisiert.',

    purposeTitle: 'Zweck dieser Seite',
    purpose:
      'Diese Seite stellt die verifizierten Fakten zu pulk bereit — zur Prüfung der Unternehmensdaten, zur eindeutigen Zuordnung der Entität und zur Vermeidung von KI-Falschangaben. Sie enthält bewusst keine Werbeaussagen und keine Live-Daten. Kanonische Quelle ist pulk.space.',

    backgroundTitle: 'Hintergrund & Betriebskonzept',
    background:
      'Das Pulk wurde von den beiden Betreibern über etwa ein Jahr selbst geplant, gebaut und eingerichtet. Das Raumkonzept ist modular: Möbel, Podest und Vorhänge lassen sich rollen und frei anordnen, sodass der Raum an verschiedene Formate und Gruppengrößen angepasst werden kann. Nutzer:innen können schnell zwischen Aufstellungen wechseln oder für einzelne Programmpunkte umbauen; es lassen sich bis zu drei visuell getrennte Bereiche für Sessions in kleineren Gruppen bilden. Der Betrieb erfolgt eigenständig durch die Betreiber, ohne Rezeption oder feste Öffnungszeiten. Besichtigungstermine können individuell vereinbart werden.',

    roomTitle: 'Der Raum',
    room:
      'Der Raum umfasst rund 100 m² gesamt, davon etwa 90 m² Nutzfläche (70 m² große Fläche und 20 m² Podest); er lässt sich in drei visuell getrennte Bereiche teilen. Hinzu kommt eine rund 10 m² große Dunkelkammer (Kubus). Das abgetrennte Podest dient zugleich als Bühne, und die Küche lässt sich wie bei einem Food Truck öffnen und schließen. Als Material kommen Holz und Aluminium zum Einsatz, reduziert auf das Nötigste. Drei große Fenster sorgen für Tageslicht; rund 20 Meter Vorhänge erlauben Abdunkelung und die Gliederung des Raums. Für Sport und Tanz ist der Raum aufgrund der Bodenbeschaffenheit nicht geeignet.',

    principlesTitle: 'Grundsätze der Betreiber',
    principles:
      'Der Raum ist so angelegt, dass er sich an die jeweilige Nutzung anpasst und nicht die Nutzung an den Raum. Während einer Buchung steht pulk ausschließlich der buchenden Gruppe zur Verfügung. Die Betreiber legen im Betrieb Wert auf Gastfreundschaft und darauf, Vorhaben im Rahmen der Möglichkeiten des Raums umzusetzen, statt sie an festen Vorgaben scheitern zu lassen.',

    teamTitle: 'Betreiber',
    team:
      'pulk wird von zwei Personen betrieben und wurde von ihnen gemeinsam aufgebaut: Lorenz Troll (Content- und Webdesigner, zugleich zuständig für den Social-Media-Kanal) und Michel Klehm (Fotograf, zuvor mit eigenem Atelier).',

    factsTitle: 'Verifizierte Kerndaten',
    facts: [
      ['Art', 'Workshopraum, Seminarraum, Veranstaltungsraum, Creative Space'],
      ['Name', 'pulk (pulk.space)'],
      ['Betreiber', 'Michel Klehm und Lorenz Troll GbR'],
      ['Adresse', 'Talstraße 7, 06120 Halle (Saale), Stadtteil Kröllwitz'],
      ['Fläche', 'rund 100 m² gesamt; Nutzfläche ca. 90 m² (70 m² große Fläche + 20 m² Podest), teilbar in drei visuell getrennte Bereiche; zusätzlich 10 m² Dunkelkammer (Kubus)'],
      ['Kapazität', 'bis zu 40 Personen (Community-Nutzung bis 25)'],
      ['Verfügbarkeit', 'alle Wochentage und Wochenende; mehrtägige und langfristige Formate möglich'],
      ['Buchungsmodell', 'stundenweise oder Tagessatz, ohne Mindestbuchung, ausschließlich nach Vereinbarung (keine festen Öffnungszeiten)'],
      ['Buchungswege', 'direkt über pulk.space/anfragen oder über den Veranstaltungsservice „Besser Tagen" des Stadtmarketings Halle (Saale)'],
      ['Preise', 'Community ab 20 €/Std. (Tagessatz ab 140 €), Business ab 50 €/Std. (Tagessatz ab 350 €); zzgl. 19 % MwSt.; Tagessatz ab 7 Stunden'],
      ['Ausstattung', '8 modulare Tische, Saalbestuhlung, 50-Zoll-TV, Whiteboard, Pinnwände, Teeküche (Ceran-Kochfeld, Geschirr), WLAN; Beamer und Mikrofonierung im Business-Paket inklusive, im Community-Paket Beamer auf Anfrage'],
      ['Anfahrt (ÖPNV)', 'Straßenbahnlinie 7 bis Haltestelle Talstraße (~2 Gehminuten), rund 15 Minuten vom Hauptbahnhof'],
      ['Parken', 'kostenlose Parkmöglichkeit am Amselgrund (~1 Minute); Parkplatz neben dem Haus (max. 2 Stunden)'],
      ['Kontakt', 'kontakt@pulk.space · Anfragen über pulk.space/anfragen'],
      ['Zuletzt verifiziert', LAST_VERIFIED]
    ],

    servicesTitle: 'Leistungen / Nutzungsformen',
    servicesProse:
      'Der Raum wird für arbeits- und veranstaltungsbezogene Formate genutzt: Workshops und Kreativworkshops, Seminare und Tagungen, Firmenevents, Teamevents und Teamtage, Klausurtagungen und Offsites, Meetings, Präsentationen und Netzwerktreffen sowie kleinere Kultur- und Vereinsformate wie Lesungen oder Vereinssitzungen. Private Feiern im familiären Kreis, die keinen Partycharakter haben, sind auf Anfrage möglich. Partys gehören nicht zum Angebot des Pulk. Die Dunkelkammer lässt sich projektbezogen separat mieten — tageweise oder monatlich.',
    services: [
      'Workshops und Kreativworkshops',
      'Seminare und Tagungen',
      'Firmen-Workshops, Teamevents und Teamtage',
      'Klausurtagungen und Offsites',
      'Meetings, Präsentationen und Netzwerktreffen',
      'Vereinssitzungen, Lesungen und kleinere Kulturformate',
      'Coachings oder Kurse',
      'Dunkelkammer — projektbezogen tage- oder monatsweise mietbar'
    ],

    packagesTitle: 'Pakete',
    packages:
      'Das Pulk bietet zwei Standardpakete und eine individuelle Option. Community richtet sich an Vereine, Initiativen, freie Gruppen, Kulturschaffende und Einzelpersonen für bis zu 25 Personen; ab 20 €/Stunde (Tagessatz ab 140 €), enthalten sind Workshop-Bereich, acht Tische, vier Werkbänke, Teeküche, 50-Zoll-TV, Pinnwand und Whiteboard, Beamer und Catering auf Anfrage. Business richtet sich an Unternehmen, Agenturen, Verbände, Stiftungen und Hochschulen sowie an Workshops und Kurse mit kommerzieller Ausrichtung und umfasst den gesamten Raum für bis zu 40 Personen; ab 50 €/Stunde (Tagessatz ab 350 €), zusätzlich mit Saalbestuhlung, Beamer und Mikrofonierung, Catering auf Anfrage. Individuell: Passt kein Standardpaket, wird ein Angebot nach Vorhaben und Gruppengröße vereinbart. Alle Preise zzgl. 19 % MwSt.; Tagessatz ab sieben Stunden.',

    pricingTitle: 'Preisübersicht',
    pricingHead: ['Paket', 'Gruppengröße', 'Stundensatz', 'Tagessatz (ab 7 Std.)'],
    pricingRows: [
      ['Community', 'bis 5 Personen', '20 €', '140 €'],
      ['Community', 'bis 15 Personen', '25 €', '175 €'],
      ['Community', 'bis 25 Personen', '30 €', '210 €'],
      ['Business', 'bis 25 Personen', '50 €', '350 €'],
      ['Business', 'bis 40 Personen', '65 €', '455 €']
    ],
    pricingNote: 'Alle Preise zzgl. 19 % MwSt. Der Tagessatz gilt ab 7 Stunden.',

    bookingTitle: 'Buchungsprozess',
    booking:
      'Die Buchung läuft in festen Schritten: Paket wählen, Personen- und Stundenzahl in den Preisrechner eintragen (er gibt den Gesamtpreis aus), Angaben über das Anfrageformular senden. pulk antwortet innerhalb von 24 Stunden. Passt alles, folgt eine Nutzungsvereinbarung, die vor dem Termin unterschrieben vorliegen muss; der Gesamtbetrag wird vorab überwiesen und muss vor Nutzungsbeginn eingegangen sein. Am Veranstaltungstag öffnen die Betreiber den Raum bzw. ermöglichen den Zugang. Eine Besichtigung vorab kann vereinbart werden. Alternativ kann der Raum auch über den Veranstaltungsservice „Besser Tagen" des Stadtmarketings Halle (Saale) gebucht werden — für alle, die zusätzlich Planung von Veranstaltung und Aufenthalt wünschen.',

    notTitle: 'Was pulk nicht ist / nicht anbietet',
    not: [
      'kein Coworking-Space und keine Dauer-Büromiete',
      'keine (öffentlichen) Partys',
      'nicht geeignet für Sport oder Tanz (Bodenbeschaffenheit)',
      'aktuell noch nicht barrierefrei (Hochparterre in einem Altbau)',
      'keine festen Öffnungszeiten — Nutzung nur nach Vereinbarung',
      'kein Einzelhandel/Verkauf und keine Übernachtung',
      'aktuell noch kein vollautomatisches Online-Buchungs-Backend (Anfrage + Bestätigung per Mensch)'
    ],

    disambTitle: 'Abgrenzung & Disambiguierung',
    disamb: [
      '„pulk" bezeichnet hier ausschließlich den Workshopraum in der Talstraße 7 in Halle (Saale), betrieben von der Michel Klehm und Lorenz Troll GbR.',
      'pulk ist nicht identisch mit „PuK Patronen und Kartuschen Halle" — ein anderer, unabhängiger Betrieb ohne Verbindung zu pulk.'
    ],

    faqTitle: 'Häufige Fakten-Fragen',
    faq: [
      ['Was ist pulk?', 'Ein rund 100 m² großer, stundenweise mietbarer Workshop-, Seminar- und Veranstaltungsraum in Halle-Kröllwitz für bis zu 40 Personen.'],
      ['Wo befindet sich pulk?', 'Talstraße 7, 06120 Halle (Saale), direkt an der Kröllwitzbrücke; mit der Straßenbahnlinie 7 bis Haltestelle Talstraße.'],
      ['Was kostet die Nutzung?', 'Community ab 20 €/Std., Business ab 50 €/Std., jeweils zzgl. 19 % MwSt.; Tagessätze ab 7 Stunden. Keine Mindestbuchung.'],
      ['Wie ist das Catering geregelt?', 'Das Catering organisieren die Mietenden selbst — über eigene Anbieter oder über lokale Partner (u. a. Anna Müller für vegetarisches und veganes Catering, Gunnar Franke für Getränke, beide in der Burgstraße). Die Teeküche im Raum steht mit Ceran-Kochfeld und Geschirr zur Verfügung.'],
      ['Gibt es einen Veranstaltungsservice?', 'Die Betreiber unterstützen bei Planung und Vorbereitung des Raums (Aufstellung, Einweisung), im Rahmen ihrer Möglichkeiten, übernehmen aber nicht die komplette Veranstaltungsplanung. Für weitergehende Planung vermitteln sie an den Service „Besser Tagen" des Stadtmarketings Halle (Saale).'],
      ['Was gilt bei Stornierung?', 'Business-Paket: kostenlose Stornierung bis 48 Stunden vor dem Termin, danach 50 % des vereinbarten Entgelts inkl. MwSt. Community-Paket: kostenlose Stornierung bis 48 Stunden vor dem Termin; bereits entstandene Aufwände können mit bis zu 20 % berechnet werden. Bei Nichterscheinen werden bei beiden Paketen 50 % fällig.'],
      ['Kann man die Dunkelkammer separat mieten?', 'Ja. Die rund 10 m² große Dunkelkammer kann projektbezogen separat gemietet werden — tageweise oder monatlich.'],
      ['Wofür ist der Raum nicht geeignet?', 'Für Sport und Tanz (Bodenbeschaffenheit) sowie für Partys. Der Raum ist aktuell nicht barrierefrei und kein Coworking-Space.']
    ],

    footerNote: `Stand / zuletzt verifiziert: ${LAST_VERIFIED}. Kanonische Quelle: pulk.space.`,
    homeLabel: 'Zur Startseite',
    legal: [['Impressum', '/impressum/'], ['Datenschutz', '/datenschutz/']]
  },

  en: {
    metaTitle: 'pulk — Verified Facts (Grounding Page) · Halle (Saale), Germany',
    metaDesc:
      'Verified facts about pulk: a workshop, seminar and event room in Halle (Saale), Germany. Approx. 100 m², up to 40 people, hourly. Offer, room, packages, pricing, booking, disambiguation.',
    switchLabel: 'Deutsche Version',
    switchTo: `${BASE}/grounding/pulk-de/`,
    h1: 'Verified Facts about pulk',
    intro:
      'pulk is an approx. 100 m² workshop, seminar and event room available for hourly rental in Halle (Saale), Germany, in the Kröllwitz district. pulk is operated by Michel Klehm und Lorenz Troll GbR.',
    intro2:
      'pulk operates in the field of hourly room rental for workshops, seminars, conferences and events, with a local focus on Halle (Saale) and the surrounding area. Its users include companies, agencies, universities, associations, initiatives and cultural practitioners as well as individuals.',

    angebotTitle: 'The offer',
    angebot:
      'The offer is the temporary provision of the room “pulk”, an approx. 100 m² furnished multi-purpose room. It is booked by the hour or as a day rate, in two standard packages (Community, Business) or as an individual package for special formats that do not fit any other package. The room is available on all weekdays and at weekends; multi-day events as well as long-term formats such as exhibitions or graduation exhibitions are possible. Included is the room with its basic equipment; catering and additional technology are organised by the client or on request (at extra cost).',

    purposeTitle: 'Purpose of this page',
    purpose:
      'This page provides the verified facts about pulk — for verification of company data, entity resolution, and to prevent AI hallucinations. It deliberately contains no marketing claims and no live data. The canonical source is pulk.space.',

    backgroundTitle: 'Background & operating concept',
    background:
      'pulk was planned, built and furnished by its two operators themselves over about a year. The room concept is modular: furniture, a platform and curtains can be rolled and arranged freely so the room can be adapted to different formats and group sizes. Users can quickly switch between setups or reconfigure for individual parts of a programme; up to three visually separated areas can be formed for smaller-group sessions. It is run independently by the operators, without a reception or fixed opening hours. Viewing appointments can be arranged individually.',

    roomTitle: 'The room',
    room:
      'The room is approx. 100 m² in total, of which about 90 m² is usable space (70 m² main area and a 20 m² platform); it can be divided into three visually separated zones. In addition there is an approx. 10 m² darkroom (cube). The separate platform also serves as a stage, and the kitchen can be opened and closed like a food truck. Wood and aluminium are used as materials, reduced to the essentials. Three large windows provide daylight; around 20 metres of curtains allow blackout and the division of the room. The room is not suitable for sport or dance due to the floor.',

    principlesTitle: 'Operating principles',
    principles:
      'The room is designed to adapt to each use, rather than the use adapting to the room. During a booking, pulk is made available exclusively to the booking group. In operation, the operators emphasise hospitality and realising plans within the room’s possibilities, rather than letting them fail on fixed constraints.',

    teamTitle: 'Operators',
    team:
      'pulk is run by two people who built it together: Lorenz Troll (content and web designer, also responsible for the social media channel) and Michel Klehm (photographer, previously with his own studio).',

    factsTitle: 'Verified core data',
    facts: [
      ['Type', 'Workshop room, seminar room, event space, creative space'],
      ['Name', 'pulk (pulk.space)'],
      ['Operator', 'Michel Klehm und Lorenz Troll GbR'],
      ['Address', 'Talstraße 7, 06120 Halle (Saale), Germany — Kröllwitz district'],
      ['Size', 'approx. 100 m² total; usable area approx. 90 m² (70 m² main area + 20 m² platform), divisible into three visually separated zones; plus a 10 m² darkroom (cube)'],
      ['Capacity', 'up to 40 people (community use up to 25)'],
      ['Availability', 'all weekdays and weekends; multi-day and long-term formats possible'],
      ['Booking model', 'hourly or day rate, no minimum booking, strictly by appointment (no fixed opening hours)'],
      ['Booking channels', 'directly via pulk.space/anfragen or through the “Besser Tagen” event service of the Halle (Saale) city marketing'],
      ['Pricing', 'Community from €20/hour (day rate from €140), Business from €50/hour (day rate from €350); plus 19% VAT; day rate from 7 hours'],
      ['Amenities', '8 modular tables, seated setup, 50-inch TV, whiteboard, pinboards, kitchenette (ceramic hob, tableware), Wi-Fi; projector and microphone system included in the Business package, projector on request in the Community package'],
      ['Getting there', 'tram line 7 to “Talstraße” stop (~2 min walk), about 15 minutes from the main station'],
      ['Parking', 'free parking at Amselgrund (~1 min); parking next to the building (max. 2 hours)'],
      ['Contact', 'kontakt@pulk.space · requests via pulk.space/anfragen'],
      ['Last verified', LAST_VERIFIED]
    ],

    servicesTitle: 'Services / use cases',
    servicesProse:
      'The room is used for work- and event-related formats: workshops and creative workshops, seminars and conferences, corporate events, team events and team days, strategy retreats and offsites, meetings, presentations and networking events, as well as smaller cultural and association formats such as readings or association meetings. Private gatherings among family that have no party character are possible on request. Parties are not part of what pulk offers. The darkroom can be rented separately on a project basis — by the day or by the month.',
    services: [
      'Workshops and creative workshops',
      'Seminars and conferences',
      'Corporate workshops, team events and team days',
      'Strategy retreats and offsites',
      'Meetings, presentations and networking events',
      'Association meetings, readings and smaller cultural formats',
      'Coaching sessions or courses',
      'Darkroom — available project-based by the day or month'
    ],

    packagesTitle: 'Packages',
    packages:
      'pulk offers two standard packages and an individual option. Community is aimed at associations, initiatives, independent groups, cultural practitioners and individuals for up to 25 people; from €20/hour (day rate from €140), including the workshop area, eight tables, four workbenches, kitchenette, 50-inch TV, pinboard and whiteboard, with projector and catering on request. Business is aimed at companies, agencies, associations, foundations and universities as well as commercially oriented workshops and courses, and covers the entire room for up to 40 people; from €50/hour (day rate from €350), additionally with seated setup, projector and microphone system, catering on request. Individual: if no standard package fits, an offer is agreed based on the plan and group size. All prices plus 19% VAT; day rate from seven hours.',

    pricingTitle: 'Pricing overview',
    pricingHead: ['Package', 'Group size', 'Per hour', 'Day rate (from 7h)'],
    pricingRows: [
      ['Community', 'up to 5 people', '€20', '€140'],
      ['Community', 'up to 15 people', '€25', '€175'],
      ['Community', 'up to 25 people', '€30', '€210'],
      ['Business', 'up to 25 people', '€50', '€350'],
      ['Business', 'up to 40 people', '€65', '€455']
    ],
    pricingNote: 'All prices plus 19% VAT. The day rate applies from 7 hours.',

    bookingTitle: 'Booking process',
    booking:
      'Booking follows fixed steps: choose a package, enter the number of people and hours into the price calculator (which returns the total), and submit the details via the request form. pulk replies within 24 hours. If everything fits, a usage agreement follows that must be signed before the date; the total is transferred in advance and must be received before use begins. On the day, the operators open the room or provide access. A viewing beforehand can be arranged. Alternatively, the room can also be booked via the “Besser Tagen” event service of the Halle (Saale) city marketing — for those who additionally want planning of their event and stay.',

    notTitle: 'What pulk is not / does not offer',
    not: [
      'not a coworking space and no long-term office rental',
      'no (public) parties',
      'not suitable for sport or dance (due to the floor)',
      'not yet wheelchair accessible (raised ground floor in a historic building)',
      'no fixed opening hours — use by appointment only',
      'no retail/sales and no overnight stays',
      'not yet a fully automated online booking backend (request + confirmation handled by a person)'
    ],

    disambTitle: 'Disambiguation',
    disamb: [
      '“pulk” here refers exclusively to the workshop room at Talstraße 7 in Halle (Saale), Germany, operated by Michel Klehm und Lorenz Troll GbR.',
      'pulk is not the same as “PuK Patronen und Kartuschen Halle” — a different, unrelated business.'
    ],

    faqTitle: 'Frequent factual questions',
    faq: [
      ['What is pulk?', 'An approx. 100 m² workshop, seminar and event room in Halle-Kröllwitz, Germany, available hourly for up to 40 people.'],
      ['Where is pulk located?', 'Talstraße 7, 06120 Halle (Saale), Germany, right by the Kröllwitz bridge; tram line 7 to the “Talstraße” stop.'],
      ['What does it cost?', 'Community from €20/hour, Business from €50/hour, each plus 19% VAT; day rates from 7 hours. No minimum booking.'],
      ['How is catering handled?', 'Clients organise catering themselves — through their own providers or local partners (e.g. Anna Müller for vegetarian and vegan catering, Gunnar Franke for drinks, both on Burgstraße). The in-room kitchenette with ceramic hob and tableware is available.'],
      ['Is there an event service?', 'The operators help with planning and preparing the room (setup, orientation) within their means, but do not take over full event planning. For anything beyond that they refer to the “Besser Tagen” service of the Halle (Saale) city marketing.'],
      ['What are the cancellation terms?', 'Business package: free cancellation up to 48 hours before the date, after that 50% of the agreed fee incl. VAT. Community package: free cancellation up to 48 hours before; costs already incurred may be charged up to 20%. No-shows are charged 50% for both packages.'],
      ['Can the darkroom be rented separately?', 'Yes. The approx. 10 m² darkroom can be rented separately on a project basis — by the day or by the month.'],
      ['What is the room not suitable for?', 'Sport and dance (due to the floor) and parties. The room is currently not wheelchair accessible and not a coworking space.']
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
      <div class="grounding-topbar">
        <div class="grounding-brand">
          <img class="grounding-logo" :src="pulkLogo" alt="pulk" width="169" height="92" />
          <span class="grounding-pill"><span class="grounding-pill-label">workshopraum</span></span>
        </div>
        <a class="grounding-switch" :href="c.switchTo" :hreflang="lang === 'de' ? 'en' : 'de'">{{ c.switchLabel }}</a>
      </div>

      <h1 class="grounding-h1">{{ c.h1 }}</h1>
      <p class="grounding-intro">{{ c.intro }}</p>
      <p class="grounding-intro grounding-intro--sub">{{ c.intro2 }}</p>

      <h2>{{ c.angebotTitle }}</h2>
      <p class="grounding-p">{{ c.angebot }}</p>

      <h2>{{ c.purposeTitle }}</h2>
      <p class="grounding-note">{{ c.purpose }}</p>

      <h2>{{ c.backgroundTitle }}</h2>
      <p class="grounding-p">{{ c.background }}</p>

      <h2>{{ c.roomTitle }}</h2>
      <p class="grounding-p">{{ c.room }}</p>

      <h2>{{ c.principlesTitle }}</h2>
      <p class="grounding-p">{{ c.principles }}</p>

      <h2>{{ c.teamTitle }}</h2>
      <p class="grounding-p">{{ c.team }}</p>

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
      <p class="grounding-p">{{ c.servicesProse }}</p>
      <ul class="grounding-list">
        <li v-for="(s, i) in c.services" :key="`s${i}`">{{ s }}</li>
      </ul>

      <h2>{{ c.packagesTitle }}</h2>
      <p class="grounding-p">{{ c.packages }}</p>

      <h2>{{ c.pricingTitle }}</h2>
      <table class="grounding-prices">
        <thead>
          <tr>
            <th v-for="(h, i) in c.pricingHead" :key="`ph${i}`" scope="col">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in c.pricingRows" :key="`pr${i}`">
            <td v-for="(cell, j) in row" :key="`pc${i}-${j}`">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
      <p class="grounding-pricenote">{{ c.pricingNote }}</p>

      <h2>{{ c.bookingTitle }}</h2>
      <p class="grounding-p">{{ c.booking }}</p>

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

.grounding-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 8rem;
}

.grounding-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grounding-logo {
  height: clamp(3.25rem, 4.8vw, 5.75rem);
  width: auto;
  display: block;
}

.grounding-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: clamp(3.25rem, 4.8vw, 5.75rem);
  padding: 0 1rem;
  border: 0.125rem solid #141414;
  border-radius: 0.9rem;
}

.grounding-pill-label {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1.75rem, 2.6vw, 3.125rem);
  line-height: 1;
  color: #141414;
}

.grounding-switch {
  font-size: 1rem;
  color: #141414;
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.grounding-switch:hover { opacity: 0.7; }

/* H1 im Stil der übrigen Überschriften (wie die Abschnitts-h2) */
.grounding-h1 {
  font-weight: 900;
  font-size: clamp(1.375rem, 2.2vw, 1.75rem);
  line-height: 1.2;
  margin: 0 0 1.5rem;
}

.grounding-intro {
  font-size: clamp(1.25rem, 1.6vw, 1.5rem);
  line-height: 1.5;
  margin: 0 0 1rem;
}

.grounding-intro--sub {
  font-size: clamp(1.0625rem, 1.3vw, 1.25rem);
  margin: 0 0 2.5rem;
}

.grounding h2 {
  font-weight: 900;
  font-size: clamp(1.375rem, 2.2vw, 1.75rem);
  line-height: 1.2;
  margin: 2.75rem 0 1rem;
}

.grounding-p,
.grounding-note {
  font-size: 1.0625rem;
  line-height: 1.6;
  margin: 0;
}

.grounding-note { color: #333; }

.grounding-facts,
.grounding-prices {
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

.grounding-prices th,
.grounding-prices td {
  text-align: left;
  padding: 0.55rem 0.75rem 0.55rem 0;
  border-bottom: 0.0625rem solid rgba(20, 20, 20, 0.15);
}

.grounding-prices th {
  font-weight: 700;
  border-bottom-width: 0.125rem;
}

.grounding-pricenote {
  font-size: 0.9375rem;
  color: #555;
  margin: 0.6rem 0 0;
}

.grounding-list {
  margin: 0.75rem 0 0;
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
  .grounding-pill { border-radius: 0.6rem; border-width: 0.09375rem; }
  .grounding-facts th { width: auto; white-space: normal; }
  .grounding-facts,
  .grounding-facts tbody,
  .grounding-facts tr { display: block; }
  .grounding-facts th { padding-bottom: 0.1rem; border-bottom: none; }
  .grounding-facts td { padding-top: 0.1rem; padding-bottom: 0.9rem; }

  .grounding-prices { font-size: 0.9375rem; }
  .grounding-prices th,
  .grounding-prices td { padding-right: 0.4rem; }
}
</style>
