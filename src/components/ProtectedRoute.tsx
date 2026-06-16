import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useCurrentParticipant()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
