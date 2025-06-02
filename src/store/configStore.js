import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiBaseUrl: '',
    proxyTarget: '',
    captchaSiteKey: '',
  }),
  actions: {
    setConfig(config) {
      this.apiBaseUrl = config.apiBaseUrl || ''
      this.proxyTarget = config.proxyTarget || ''
      this.captchaSiteKey = config.captchaSiteKey || ''
    },
  },
})
