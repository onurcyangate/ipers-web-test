import { defineStore } from 'pinia'

import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens
} from '@/utils/token'
import { consoleWarning } from '@/utils/logger'
import apiService from '@/services/api.service'

export const useAuthStore = defineStore('user', {
  state: () => ({
    user: null
  }),
  actions: {
    async fetchUser() {
      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          return
        }

        const response = await apiService.refreshToken({
          refresh: refreshToken
        })
        this.login(response.data)

      } catch (err) {
        consoleWarning('fetch user error ', err)
        clearTokens()
      }
    },
    login(loginResponse) {

      if (loginResponse.user) {
        this.user = loginResponse.user
      }
      setAccessToken(loginResponse.access)
      setRefreshToken(loginResponse.refresh)
    }
  }
})
