import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'

// ============================================================================
// Type Definitions
// ============================================================================

export interface PredictionInput {
  participant_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
}

export interface ParticipantScore {
  rank: number
  participant_id: string
  full_name: string
  total_points: number
  matches_predicted: number
  exact_predictions: number
  created_at: string
}

export interface ParticipantStats {
  total_points: number
  matches_predicted: number
  exact_predictions: number
  tendency_predictions: number
  accuracy_percentage: number
  biggest_stage: string
  created_at: string
}

// ============================================================================
// HOOKS
// ============================================================================

export function useParticipantRanking(tournamentId?: string) {
  return useQuery({
    queryKey: ['ranking', tournamentId],
    queryFn: async () => {
      const client = supabaseService.supabase
      if (!client) throw new Error('Supabase client not initialized')

      // 1. Intentar obtener el ranking desde la función RPC
      const { data: rankingData, error: rankingError } = await client
        .rpc('get_participant_ranking', {
          p_tournament_id: tournamentId || null,
        })

      if (rankingError) {
        console.error('Error in get_participant_ranking RPC:', rankingError)
      }

      // 2. Si el ranking está vacío o falló, intentamos obtener la lista base de participantes
      if (!rankingData || rankingData.length === 0) {
        const { data: participants, error: participantsError } = await supabaseService.listParticipants()
        if (participantsError) throw participantsError
        
        return (participants || []).map((p: any, idx: number) => ({
          rank: idx + 1,
          participant_id: p.id,
          full_name: p.full_name,
          total_points: 0,
          matches_predicted: 0,
          exact_predictions: 0,
          created_at: p.created_at
        })) as ParticipantScore[]
      }

      return rankingData as ParticipantScore[]
    },
    refetchInterval: 30000,
    staleTime: 10000,
  })
}

export function useParticipantStats(participantId: string) {
  return useQuery({
    queryKey: ['stats', participantId],
    queryFn: async () => {
      const client = supabaseService.supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { data, error } = await client
        .rpc('get_participant_stats', {
          p_participant_id: participantId,
        })

      if (error) {
        console.error('Error in get_participant_stats RPC:', error)
        throw error
      }
      
      return (data?.[0] || {
        total_points: 0,
        matches_predicted: 0,
        exact_predictions: 0,
        tendency_predictions: 0,
        accuracy_percentage: 0,
        biggest_stage: '-',
        created_at: ''
      }) as ParticipantStats
    },
    enabled: !!participantId,
    staleTime: 30000,
  })
}

export function useRecalculateRankings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const client = supabaseService.supabase
      if (!client) throw new Error('Supabase client not initialized')

      const { error } = await client.rpc('recalculate_all_rankings')
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
