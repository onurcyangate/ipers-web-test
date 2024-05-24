import BaseService from '@/services/base.service'

class ApiService extends BaseService {
  constructor() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    super(baseUrl)
  }

  /**
   *
   * @param {Object} payload
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns Promise
   */
  login(payload) {
    return this._axiosInstance.post('auth/login', payload)
  }

  /**
   *
   * @param {Object} payload
   * @param {string} payload.refresh
   * @returns Promise
   */
  refreshToken(payload) {
    return this._axiosInstance.post('auth/token/refresh/', payload)
  }

  register(payload) {
    return this._axiosInstance.post('auth/register', payload)
  }
}

export default new ApiService()
