import { useParticipant } from '../contexts/ParticipantContext'

export function useCurrentParticipant() {
  const { participant, setParticipant } = useParticipant()

  const login = (newParticipant: any) => {
    setParticipant(newParticipant)
  }

  const logout = () => {
    setParticipant(null)
  }

  return {
    participant,
    isAuthenticated: !!participant,
    login,
    logout,
  }
}
