import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'

export function useDashboard(tournamentId: string) {
  return useQuery({
    queryKey: ['dashboard', tournamentId],
    queryFn: async () => {
      const matches = await supabaseService.listUpcomingMatches(tournamentId)
      const participants = await supabaseService.listParticipants()
      return {
        matches: matches.data ?? [],
        participants: participants.data ?? [],
      }
    },
  })
}
