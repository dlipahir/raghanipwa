import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  userData: any
  login: (token: string, userData: any) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload.exp) return false // If no exp, treat as not expired
    // exp is in seconds, Date.now() in ms
    return Date.now() >= payload.exp * 1000
  } catch (e) {
    // If token is malformed, treat as expired
    return true
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check for stored auth token on app load
    const storedToken = localStorage.getItem('authToken')
    const storedUserData = localStorage.getItem('userData')
    
    if (storedToken && storedUserData) {
      if (isTokenExpired(storedToken)) {
        // Token expired, remove from storage
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        setToken(null)
        setUserData(null)
        setIsAuthenticated(false)
      } else {
        setToken(storedToken)
        setUserData(JSON.parse(storedUserData))
        setIsAuthenticated(true)
      }
    }
  }, [])

  const login = (authToken: string, user: any) => {
    setToken(authToken)
    setUserData(user)
    setIsAuthenticated(true)
    localStorage.setItem('authToken', authToken)
    localStorage.setItem('userData', JSON.stringify(user))
  }

  const logout = () => {
    setToken(null)
    setUserData(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }

  const value = {
    isAuthenticated,
    token,
    userData,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 