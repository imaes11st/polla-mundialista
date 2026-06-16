import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'
import type { Tournament } from '../types'

export function useTournament(tournamentId: string) {
  return useQuery<Tournament | null>({
    queryKey: ['tournament', tournamentId],
    queryFn: () =>
      supabaseService.listTournaments().then((result) => result.data?.find((item) => item.id === tournamentId) ?? null),
  })
}
