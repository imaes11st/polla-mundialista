import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'
import type { Participant } from '../types'

interface ParticipantContextState {
  participant: Participant | null
  setParticipant: (participant: Participant | null) => void
}

const ParticipantContext = createContext<ParticipantContextState | undefined>(undefined)

interface ParticipantProviderProps {
  children: ReactNode
}

export function ParticipantProvider({ children }: ParticipantProviderProps) {
  const queryClient = useQueryClient()

  // 1. Cargamos el objeto COMPLETO de manera síncrona desde el primer instante
  const [participant, setParticipantState] = useState<Participant | null>(() => {
    const saved = localStorage.getItem('active_participant_user')
    return saved ? JSON.parse(saved) : null
  })

  // Mantenemos el ID para sincronización en segundo plano con la DB
  const participantId = participant?.id || null

  const { data: dbParticipant } = useQuery<Participant | null>({
    queryKey: ['current-participant', participantId],
    queryFn: async () => {
      if (!participantId) return null
      try {
        const { data } = await supabaseService.getParticipantById(participantId)
        return data
      } catch (err) {
        console.error('Failed to load participant details from database:', err)
        return null
      }
    },
    enabled: !!participantId,
  })

  // 2. Si los datos cambian en la base de datos en segundo plano, actualizamos el almacenamiento local de forma transparente
  useEffect(() => {
    if (dbParticipant && JSON.stringify(dbParticipant) !== JSON.stringify(participant)) {
      localStorage.setItem('active_participant_user', JSON.stringify(dbParticipant))
      setParticipantState(dbParticipant)
    }
  }, [dbParticipant, participant])

  // 3. Función de login/logout limpia y síncrona
  const setParticipant = (p: Participant | null) => {
    if (p) {
      localStorage.setItem('active_participant_user', JSON.stringify(p))
      setParticipantState(p)
    } else {
      localStorage.removeItem('active_participant_user')
      setParticipantState(null)
      // Limpiamos las consultas de React Query al cerrar sesión
      queryClient.invalidateQueries()
    }
  }

  return (
    <ParticipantContext.Provider value={{ participant, setParticipant }}>
      {children}
    </ParticipantContext.Provider>
  )
}

export function useParticipant() {
  const context = useContext(ParticipantContext)
  if (!context) {
    throw new Error('useParticipant must be used within ParticipantProvider')
  }
  return context
}