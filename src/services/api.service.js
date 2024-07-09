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
    return this._axiosInstance.post('iowa/login', payload)
  }

  /**
   *
   * @param {Object} payload
   * @param {string} payload.refresh
   * @returns Promise
   */
  refreshToken(payload) {
    return this._axiosInstance.post('token/refresh/', payload)
  }

  register(payload) {
    return this._axiosInstance.post('/iowa/createUser', payload)
  }

  verifyEmail(params) {
    return this._axiosInstance.get(`/iowa/verify-email?token=${params}`)
  }

  resendVerificationEmail() {
    return this._axiosInstance.post('/iowa/resend-email')
  }

  fetchUserCases(){
    return this._axiosInstance.post('/iowa/list-cases')
  }
}

export default new ApiService()
