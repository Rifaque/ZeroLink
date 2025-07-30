// src/lib/axios.ts
import axios from 'axios'
import { auth } from './firebase'

/**
 * Axios instance for API calls with Firebase Auth token header
 */
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Firebase ID token to each request
API.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user && config.headers) {
      try {
        const token = await user.getIdToken(true)
        ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
      } catch (err) {
        console.error('Failed to get Firebase token:', err)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
