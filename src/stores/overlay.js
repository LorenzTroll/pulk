import { defineStore } from 'pinia'

export const useOverlayStore = defineStore('overlay', {
  state: () => ({
    current: null
  }),
  actions: {
    open(name) { this.current = name },
    close()    { this.current = null }
  }
})