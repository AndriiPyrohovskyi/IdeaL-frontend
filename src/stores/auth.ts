import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithEmailAndPassword, signInWithCustomToken, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { authService, type User } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }
  const register = async (userData: {
    email: string
    password: string
    name: string
    username: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authService.register(userData)
      
      if (!response.success) {
        throw new Error(response.error || 'Registration failed')
      }
      if (response.customToken) {
        const userCredential = await signInWithCustomToken(auth, response.customToken)
        const idToken = await userCredential.user.getIdToken()
        localStorage.setItem('idToken', idToken)
        const userResponse = await authService.loginWithToken(idToken)
        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user)
        }
      }

      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()
      localStorage.setItem('idToken', idToken)
      const response = await authService.loginWithToken(idToken)
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed')
      }

      if (response.user) {
        setUser(response.user)
      }

      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('idToken')
      setUser(null)
      setError(null)
    } catch (err: any) {
      console.error('Logout error:', err)
    }
  }
  const initializeAuth = async () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken()
            localStorage.setItem('idToken', idToken)
            const response = await authService.getCurrentUser()
            if (response.success && response.data) {
              setUser(response.data)
            }
          } else {
            localStorage.removeItem('idToken')
            setUser(null)
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          localStorage.removeItem('idToken')
          setUser(null)
        } finally {
          isInitialized.value = true
          resolve()
        }
        unsubscribe()
      })
    })
  }
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('idToken')
      if (!token) {
        isInitialized.value = true
        return
      }

      setLoading(true)
      const response = await authService.getCurrentUser()
      
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        localStorage.removeItem('idToken')
        setUser(null)
      }
    } catch (err) {
      console.error('Check auth error:', err)
      localStorage.removeItem('idToken')
      setUser(null)
    } finally {
      setLoading(false)
      isInitialized.value = true
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isInitialized,
    register,
    login,
    logout,
    initializeAuth,
    checkAuth,
    setError
  }
})