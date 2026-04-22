import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [],
    loading: false,
    loaded: false,
    error: null
  }),
  actions: {
    async fetchEvents() {
      if (this.loading || this.loaded) return
      this.loading = true
      this.error = null
      try {
        const res = await fetch('/reservations.json', { cache: 'no-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        this.events = (Array.isArray(data) ? data : []).map((item, idx) => ({
          id: idx + 1,
          title: item.title || 'Reserviert',
          dates: {
            start: item.start,
            end: item.end || item.start
          }
        }))
        this.loaded = true
      } catch (err) {
        this.error = err.message
        console.warn('[calendar] reservations.json konnte nicht geladen werden:', err.message)
      } finally {
        this.loading = false
      }
    },
    addEvent(evt) {
      this.events.push(evt)
    }
  }
})
