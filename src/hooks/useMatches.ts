import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'

// Exportamos la interfaz para poder usarla en las vistas u otros componentes
export interface MatchData {
  id: string
  match_date: string
  stage: string
  status: string
  home_score: number | null
  away_score: number | null
  home_team: { name: string; code: string; flag_url: string }
  away_team: { name: string; code: string; flag_url: string }
  predictions?: {
    id: string
    predicted_home: number | null
    predicted_away: number | null
    participant_id: string
  }[]
}

export function useMatches(tournamentId: string, participantId?: string) {
  return useQuery<MatchData[]>({
    queryKey: ['matches', tournamentId, participantId],
    enabled: !!tournamentId,
    queryFn: () => {
      if (participantId) {
        return supabaseService.listMatchesWithPredictions(tournamentId, participantId).then((res) => res.data || [])
      }
      return supabaseService.listAllMatches(tournamentId).then((res) => res.data || [])
    },
  })
}

export function useUpcomingMatches(tournamentId: string) {
  return useQuery<MatchData[]>({
    queryKey: ['upcomingMatches', tournamentId],
    enabled: !!tournamentId, 
    queryFn: () => 
      supabaseService.listUpcomingMatches(tournamentId).then((res) => res.data || []),
  })
}

export function useColombiaMatches(tournamentId: string) {
  return useQuery<MatchData[]>({
    queryKey: ['colombiaMatches', tournamentId],
    enabled: !!tournamentId,
    queryFn: async () => {
      const all = await supabaseService.listAllMatches(tournamentId).then((res) => (res.data as MatchData[]) || [])
      
      return all.filter((m: MatchData) => {
        const homeName = m.home_team?.name?.toLowerCase() || ''
        const awayName = m.away_team?.name?.toLowerCase() || ''
        const homeCode = m.home_team?.code?.toLowerCase() || ''
        const awayCode = m.away_team?.code?.toLowerCase() || ''
        
        return (
          homeName === 'colombia' ||
          awayName === 'colombia' ||
          homeCode === 'co' ||
          homeCode === 'col' ||
          awayCode === 'co' ||
          awayCode === 'col'
        )
      })
    },
  })
}