import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiBaseUrl: '',
    captchaSiteKey: '',
  }),
  actions: {
    setConfig(config) {
      this.apiBaseUrl = config.apiBaseUrl || ''
      this.captchaSiteKey = config.captchaSiteKey || ''
    },
  },
})
