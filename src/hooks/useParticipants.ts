import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'
import type { Participant } from '../types'

export function useParticipants() {
  return useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: () => supabaseService.listParticipants().then((result) => result.data ?? []),
  })
}
