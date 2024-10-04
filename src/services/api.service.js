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
    return this._axiosInstance.get(`/iowa/external-user-case-list?username=${params}&caseId=`)
  }

  fetchCaseDetails(id) {
    return this._axiosInstance.get(`/iowa/fetch-case?caseId=${id}`)
  }

  fetchDiscussions(userName, id) {
    return this._axiosInstance.get(`/iowa/external-user-case-list?username=${userName}&caseId=${id}`)
  }

  updateCase(params, payload) {
    return this._axiosInstance.post(`/iowa/update-case?id=${params}`, payload)
  }

  addCase(caseId, userName) {
    return this._axiosInstance.post(`/iowa/check-case?id=${caseId}&username=${userName}`)
  }

  resetPassword(email, token, payload) {
    return this._axiosInstance.post(`/iowa/reset-password?email=${(email)}&token=${(token)}`, payload);
  }

  fetchCaseMessages(businessWorkspaceId, businessObjectId) {
    return this._axiosInstance.get(`/iowa/get-messages?itemId=${businessWorkspaceId}.${businessObjectId}`)
  }

  saveMessage(payload){
    return this._axiosInstance.put("/home/iowa/app/entityRestService/Items", payload)
  }

  deleteMessage(payload){
    return this._axiosInstance.delete("/home/iowa/app/entityRestService/Items", payload)
  }

  uploadFile(businessWorkspaceIdParam, payload){
    return this._axiosInstance.post(`/iowa/file-upload?businessWorkspaceIdParam=${businessWorkspaceIdParam}`, payload)
  }
}

export default new ApiService()
