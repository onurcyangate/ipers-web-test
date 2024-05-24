import apiService from '@/services/api.service'
import storage from '@/utils/localStorage'
import { consoleError, consoleLog } from '@/utils/logger'
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY
} from '@/constants/token'

export const getAccessToken = () => storage.getItem(ACCESS_TOKEN_STORAGE_KEY)

export const getRefreshToken = () => storage.getItem(REFRESH_TOKEN_STORAGE_KEY)

export const refreshToken = async () => {
  consoleLog('Auth token expired, refreshing...')

  try {
    const refresh = getRefreshToken()
    const { data } = await apiService.refreshToken({ refresh })

    setAccessToken(data.access)
    setRefreshToken(data.refresh)
    consoleLog('Token refreshed')
    return data.access
  } catch (err) {
    consoleError('Token refresh error: ', err)
    clearTokens()
  }
}

export const setAccessToken = (accessToken) => {
  storage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
}

export const setRefreshToken = (refreshToken) => {
  storage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export const clearTokens = () => {
  storage.removeItems([ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY])
}
