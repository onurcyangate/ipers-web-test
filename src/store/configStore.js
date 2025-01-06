import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiBaseUrl: '',
  }),
  actions: {
    setConfig(config) {
      this.apiBaseUrl = config.apiBaseUrl || ''
    },
  },
})
