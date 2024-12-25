import axios from 'axios'

export default class BaseService {
  constructor(baseURL) {
    this._axiosInstance = axios.create({
      baseURL
    })

    this._setupInterceptors()
  }

  _setupInterceptors() {
    this._axiosInstance.interceptors.request.use(BaseService.requestInterceptor)
    this._axiosInstance.interceptors.response.use(
      BaseService.responseInterceptor,
      (err) => this.responseErrorInterceptor(err)
    )
  }

  static requestInterceptor(config) {
    return config
  }

  static responseInterceptor(response) {
    return response
  }

  async responseErrorInterceptor(error) {
    const originalRequest = error.config

    // if (error.response.status === 401 && !originalRequest._retry) {
    // }
    return Promise.reject(error)
  }
}
