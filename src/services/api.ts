import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('idToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface User {
  uid: string
  email: string
  username: string
  name: string
  role?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  user?: User
  error?: string
  message?: string
  customToken?: string
}

export const authService = {
  async register(userData: {
    email: string
    password: string
    name: string
    username: string
  }): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async loginWithToken(idToken: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/login', { idToken })
    return response.data
  },

  async loginWithCustomToken(customToken: string): Promise<ApiResponse<User>> {
    const response = await api.post('/auth/login-custom', { customToken })
    return response.data
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/users/me')
    return response.data
  }
}

export default api