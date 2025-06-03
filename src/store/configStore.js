import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    apiBaseUrl: '',
    pdfPreviewBaseUrl: '',
    captchaSiteKey: '',
  }),
  actions: {
    setConfig(config) {
      this.apiBaseUrl = config.apiBaseUrl || ''
      this.pdfPreviewBaseUrl = config.pdfPreviewBaseUrl || ''
      this.captchaSiteKey = config.captchaSiteKey || ''
    },
  },
})
