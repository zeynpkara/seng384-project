import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services/authService'

export function useAuth() {
  const { user, isAuthenticated, isAdmin, setAuth, clearAuth, updateUser } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login({ email, password })
    const profile = await authService.getProfile()
    setAuth(profile.data, data.access_token)
    navigate('/dashboard')
  }, [setAuth, navigate])

  const logout = useCallback(async () => {
    await authService.logout().catch(() => {})
    clearAuth()
    navigate('/login')
  }, [clearAuth, navigate])

  const register = useCallback(async (formData) => {
    await authService.register(formData)
    navigate('/login?registered=true')
  }, [navigate])

  return { user, isAuthenticated, isAdmin, login, logout, register, updateUser }
}
