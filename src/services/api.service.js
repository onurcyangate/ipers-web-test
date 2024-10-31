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

  fetchUniversityCases() {
    return this._axiosInstance.get(`/iowa/university-user-case-list`)
  }

  fetchCaseDetails(id) {
    return this._axiosInstance.get(`/iowa/fetch-case?caseId=${id}`)
  }

  fetchDiscussions(userName, id) {
    return this._axiosInstance.get(`/iowa/external-user-case-list?username=${userName}&caseId=${id}`)
  }

  updateCase(params, payload) {
    return this._axiosInstance.put(`/iowa/update-case?id=${params}`, payload)
  }

  addCase(caseId, userName) {
    return this._axiosInstance.post(`/iowa/check-case?username=${userName}&caseId=${caseId}`)
  }

  resetPassword(email, token, payload) {
    return this._axiosInstance.post(`/iowa/reset-password?email=${(email)}&token=${(token)}`, payload);
  }

  fetchCaseMessages(businessWorkspaceObjectId) {
    return this._axiosInstance.get(`/iowa/get-messages?itemId=${businessWorkspaceObjectId}`)
  }

  createMessage(payload) {
    return this._axiosInstance.put("/iowa/create-message", payload)
  }

  replyMessage(payload) {
    return this._axiosInstance.put("/iowa/reply-message", payload)
  }

  deleteMessage(payload) {
    return this._axiosInstance.put("/iowa/delete-message", payload)
  }

  uploadFile(businessWorkspaceIdParam, payload) {
    return this._axiosInstance.post(`/iowa/file-upload?businessWorkspaceIdParam=${businessWorkspaceIdParam}`, payload)
  }

  listTempFiles(businessWorkspaceId) {
    return this._axiosInstance.get(`/iowa/list-uploaded-files?businessWorkspaceIdParam=${businessWorkspaceId}`)
  }

  listMedicalFiles(businessWorkspaceId) {
    return this._axiosInstance.get(`/iowa/list-medical-files?businessWorkspaceIdParam=${businessWorkspaceId}`)
  }

  listDownloadableFiles(businessWorkspaceId) {
    return this._axiosInstance.get(`/iowa/list-downloadable-files?businessWorkspaceIdParam=${businessWorkspaceId}`)
  }

  deleteFile(fileId) {
    return this._axiosInstance.delete(`/iowa/file-delete?fileId=${fileId}`)
  }

  moveFile(fileId, fileName, businessWorkspaceId) {
    return this._axiosInstance.put(`/iowa/file-move?fileId=${fileId}&fileName=${fileName}&businessWorkspaceId=${businessWorkspaceId}`)
  }

  newDocumentArrives(caseId) {
    return this._axiosInstance.post(`/iowa/new-document-arrives?caseId=${caseId}`)
  }
}

export default new ApiService()
