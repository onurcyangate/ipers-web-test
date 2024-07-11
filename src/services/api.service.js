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

  register(payload, params) {
    return this._axiosInstance.post(`/iowa/createUser?uniqueCode=${params}`, payload)
  }

  verifyEmail(params) {
    return this._axiosInstance.get(`/iowa/verify-email?token=${params}`)
  }

  validateUniqueCode(params) {
    return this._axiosInstance.get(`/iowa/check-unique-caseid?caseID=${params}`)
  }

  resendVerificationEmail() {
    return this._axiosInstance.post('/iowa/resend-email')
  }

  fetchUserCases(params) {
    return this._axiosInstance.get(`/iowa/external-user-case-list?username=${params}`)

  }

  resetPassword(email, token, payload) {
    return this._axiosInstance.post(`/iowa/reset-password?email=${(email)}&token=${(token)}`, payload);
  }
}

export default new ApiService()
