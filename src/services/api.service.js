import BaseService from '@/services/base.service'

class ApiService extends BaseService {
  static instance = null;

  constructor(baseURL) {
    super(baseURL)
  }

  static initialize(baseURL) {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService(baseURL)
    }
    return ApiService.instance
  }
  /**
   *
   * @param {Object} payload
   * @param {string} payload.email
   * @param {string} payload.password
   * @returns Promise
   */
  login(payload) {
    return this._axiosInstance.post('/login', payload)
  }

  register(payload, params) {
    return this._axiosInstance.post(`/createUser?uniqueCode=${params}`, payload)
  }

  verifyEmail(params) {
    return this._axiosInstance.get(`/verify-email?token=${params}`)
  }

  validateUniqueCode(params) {
    return this._axiosInstance.get(`/check-unique-caseid?caseID=${params}`)
  }

  resendVerificationEmail() {
    return this._axiosInstance.post('/resend-email')
  }

  fetchUserCases(params) {
    return this._axiosInstance.get(`/external-user-case-list?mail=${params}&caseId=`)
  }

  fetchUniversityCases() {
    return this._axiosInstance.get(`/university-user-case-list`)
  }

  fetchCaseDetails(id) {
    return this._axiosInstance.get(`/fetch-case?caseId=${id}`)
  }

  fetchDiscussions(userName, id) {
    return this._axiosInstance.get(`/external-user-case-list?username=${userName}&caseId=${id}`)
  }

  updateCase(params, payload) {
    return this._axiosInstance.put(`/update-case?caseId=${params}`, payload)
  }

  addCase(caseId, email) {
    return this._axiosInstance.post(`/check-case?mail=${email}&caseId=${caseId}`)
  }

  resetPassword(email, token, payload) {
    return this._axiosInstance.post(`/reset-password?email=${(email)}&token=${(token)}`, payload);
  }

  fetchCaseMessages(businessWorkspaceObjectId) {
    return this._axiosInstance.get(`/get-messages?itemId=${businessWorkspaceObjectId}`)
  }

  createMessage(payload) {
    return this._axiosInstance.put("/create-message", payload)
  }

  replyMessage(payload) {
    return this._axiosInstance.put("/reply-message", payload)
  }

  deleteMessage(payload) {
    return this._axiosInstance.put("/delete-message", payload)
  }

  uploadFile(caseId, payload) {
    return this._axiosInstance.post(`/file-upload?caseId=${caseId}`, payload)
  }

  uploadDecisionFile(caseId, payload) {
    return this._axiosInstance.post(`/university-decision-file-move?caseId=${caseId}`, payload)
  }

  listTempFiles(caseId) {
    return this._axiosInstance.get(`/list-uploaded-files?caseId=${caseId}`)
  }

  listMedicalFiles(caseId) {
    return this._axiosInstance.get(`/list-medical-files?caseId=${caseId}`)
  }

  listDownloadableFiles(caseId) {
    return this._axiosInstance.get(`/list-downloadable-files?caseId=${caseId}`)
  }

  deleteFile(fileId, fileName, caseId) {
    return this._axiosInstance.delete(`/file-delete?fileId=${fileId}&fileName=${fileName}&caseId=${caseId}`)
  }

  moveFile(fileId, fileName, caseId) {
    return this._axiosInstance.put(`/file-move?fileId=${fileId}&fileName=${fileName}&caseId=${caseId}`)
  }

  newDocumentArrives(caseId) {
    return this._axiosInstance.post(`/new-document-arrives?caseId=${caseId}`)
  }

  sendResetPasswordEmail(payload) {
    return this._axiosInstance.post('/reset-password-email', payload)

  }

  addMessageSender(payload) {
    return this._axiosInstance.put('/add-message-sender', payload)
  }
}

export default new ApiService()

export const getApiService = () => {
  if (!ApiService.instance) {
    throw new Error('ApiService must be initialized before use')
  }
  return ApiService.instance
}

export const initializeApiService = (baseURL) => {
  return ApiService.initialize(baseURL)
}
