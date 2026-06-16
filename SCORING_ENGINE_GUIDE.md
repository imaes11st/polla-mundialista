# 🎯 SCORING ENGINE IMPLEMENTATION GUIDE
## Complete Technical Instructions for Phase 6

**Objective**: Connect React frontend to Supabase PL/pgSQL scoring functions  
**Estimated Time**: 2 hours  
**Priority**: CRITICAL - Blocks all point calculations

---

## ARCHITECTURE OVERVIEW

```
User Makes Prediction (React)
           ↓
   usePredictionSubmit Hook
           ↓
   POST /predictions
           ↓
   Supabase RPC Call
           ↓
   award_match_points() [PL/pgSQL]
           ↓
   Calculate & Update Points
           ↓
   Trigger: Real-time Update
           ↓
   React Query Refetch
           ↓
   UI Updates Score + Ranking
```

---

## STEP 1: Create Scoring Hook

**File**: `src/hooks/useScoringCalculator.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'

// ============================================================================
// Type Definitions
// ============================================================================

interface PredictionInput {
  participant_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
}

interface PredictionResult {
  id: string
  participant_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
  points_awarded?: number
  created_at: string
}

interface MatchResult {
  id: string
  home_score: number
  away_score: number
  stage: string
}

interface ParticipantScore {
  rank: number
  participant_id: string
  full_name: string
  total_points: number
  matches_predicted: number
  exact_predictions: number
  created_at: string
}

// ============================================================================
// HOOK 1: Submit Prediction
// ============================================================================

export function useSubmitPrediction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prediction: PredictionInput) => {
      // 1. Insert prediction into database
      const { data, error } = await supabaseService.supabase
        ?.from('predictions')
        .insert({
          participant_id: prediction.participant_id,
          match_id: prediction.match_id,
          predicted_home: prediction.predicted_home,
          predicted_away: prediction.predicted_away,
        })
        .select()

      if (error) throw error
      return data?.[0]
    },
    onSuccess: () => {
      // Invalidate queries to refresh
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ============================================================================
// HOOK 2: Register Match Result
// ============================================================================

export function useRegisterMatchResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (result: MatchResult & { id: string }) => {
      // 1. Update match result
      const { data: updateData, error: updateError } = await supabaseService.supabase
        ?.from('matches')
        .update({
          home_score: result.home_score,
          away_score: result.away_score,
          status: 'finished',
        })
        .eq('id', result.id)
        .select()

      if (updateError) throw updateError

      // 2. Call PL/pgSQL function to award points
      const { data: pointsData, error: pointsError } = await supabaseService.supabase
        ?.rpc('award_match_points', {
          p_match_id: result.id,
        })

      if (pointsError) throw pointsError

      return { match: updateData?.[0], points: pointsData }
    },
    onSuccess: () => {
      // Invalidate all ranking queries
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}

// ============================================================================
// HOOK 3: Get Ranking (Real-time)
// ============================================================================

export function useParticipantRanking(tournamentId?: string) {
  return useQuery({
    queryKey: ['ranking', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabaseService.supabase
        ?.rpc('get_participant_ranking', {
          p_tournament_id: tournamentId || null,
        })

      if (error) throw error
      return data as ParticipantScore[]
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  })
}

// ============================================================================
// HOOK 4: Get Participant Statistics
// ============================================================================

export function useParticipantStats(participantId: string) {
  return useQuery({
    queryKey: ['stats', participantId],
    queryFn: async () => {
      const { data, error } = await supabaseService.supabase
        ?.rpc('get_participant_stats', {
          p_participant_id: participantId,
        })

      if (error) throw error
      return data?.[0]
    },
    enabled: !!participantId,
    staleTime: 30000,
  })
}

// ============================================================================
// HOOK 5: Get Match with Predictions
// ============================================================================

export function useMatchWithPredictions(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await supabaseService.supabase
        ?.rpc('get_match_with_predictions', {
          p_match_id: matchId,
        })

      if (error) throw error
      return data?.[0]
    },
    enabled: !!matchId,
    staleTime: 15000,
  })
}

// ============================================================================
// HOOK 6: Recalculate All Rankings
// ============================================================================

export function useRecalculateRankings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabaseService.supabase
        ?.rpc('recalculate_all_rankings')

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
```

---

## STEP 2: Update MatchCard Component

**File**: `src/components/MatchCard.tsx`

```typescript
import { MatchCard as BaseMatchCard } from '../components/sport/SportComponents'
import { useSubmitPrediction } from '../hooks/useScoringCalculator'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface MatchCardProps {
  homeTeam: string
  awayTeam: string
  matchDate: string
  stage: string
  matchId: string
  participantId: string
  homeFlag?: string
  awayFlag?: string
  onPredictionSaved?: () => void
}

export function MatchCardWithScoring({
  homeTeam,
  awayTeam,
  matchDate,
  stage,
  matchId,
  participantId,
  homeFlag,
  awayFlag,
  onPredictionSaved,
}: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  const submitPrediction = useSubmitPrediction()

  const handleSavePrediction = async () => {
    try {
      await submitPrediction.mutateAsync({
        participant_id: participantId,
        match_id: matchId,
        predicted_home: homeScore,
        predicted_away: awayScore,
      })

      onPredictionSaved?.()

      // Show success toast
      showSuccessNotification('✅ Pronóstico guardado')
    } catch (error) {
      console.error('Error saving prediction:', error)
      showErrorNotification('❌ Error al guardar')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-4"
    >
      <div className="grid md:grid-cols-12 gap-4 items-center">
        {/* Teams */}
        <div className="md:col-span-4">
          <div className="flex justify-between items-center gap-3">
            <div className="text-center flex-1">
              <img src={homeFlag} alt={homeTeam} className="w-10 h-6 mx-auto rounded" />
              <p className="text-sm font-bold text-white mt-1">{homeTeam}</p>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="bg-slate-700 text-white font-bold text-center rounded px-2 py-1"
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="bg-slate-700 text-white font-bold text-center rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="text-center flex-1">
              <img src={awayFlag} alt={awayTeam} className="w-10 h-6 mx-auto rounded" />
              <p className="text-sm font-bold text-white mt-1">{awayTeam}</p>
            </div>
          </div>
        </div>

        {/* Date & Stage */}
        <div className="md:col-span-3">
          <p className="text-xs text-slate-400 mb-1">FECHA</p>
          <p className="font-bold text-white">{matchDate}</p>
          <p className="text-xs text-mundialYellow mt-1">{stage}</p>
        </div>

        {/* Save Button */}
        <div className="md:col-span-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSavePrediction}
            disabled={submitPrediction.isPending}
            className="w-full bg-gradient-to-r from-mundialYellow to-orange-500 hover:from-mundialYellow/90 hover:to-orange-600 disabled:opacity-50 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
          >
            {submitPrediction.isPending ? 'Guardando...' : 'Guardar Pronóstico'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
```

---

## STEP 3: Update RankingPage Component

**File**: `src/pages/RankingPage.tsx`

```typescript
import { useParticipantRanking } from '../hooks/useScoringCalculator'
import { Card } from '../components/ui/Card'
import { motion } from 'framer-motion'

export function RankingPage() {
  const { data: ranking, isLoading } = useParticipantRanking()

  if (isLoading) return <div>Cargando ranking...</div>

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-black text-white mb-4">🏆 Ranking en Vivo</h1>
      </Card>

      {/* Podium */}
      {ranking && ranking.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Silver */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-5xl mb-2">🥈</div>
            <Card className="bg-gradient-to-b from-slate-700 to-slate-800">
              <p className="font-bold text-white text-lg">{ranking[1].full_name}</p>
              <p className="text-3xl font-black text-mundialYellow">{ranking[1].total_points}</p>
              <p className="text-sm text-slate-400">Puesto #{ranking[1].rank}</p>
            </Card>
          </motion.div>

          {/* Gold */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:-translate-y-4"
          >
            <div className="text-6xl mb-2 animate-bounce">🥇</div>
            <Card className="bg-gradient-to-b from-mundialYellow/30 to-mundialYellow/10 border border-mundialYellow/50">
              <p className="font-black text-mundialYellow text-xl">{ranking[0].full_name}</p>
              <p className="text-4xl font-black text-mundialYellow">{ranking[0].total_points}</p>
              <p className="text-sm text-mundialYellow">¡LÍDER!</p>
            </Card>
          </motion.div>

          {/* Bronze */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="text-5xl mb-2">🥉</div>
            <Card className="bg-gradient-to-b from-slate-700 to-slate-800">
              <p className="font-bold text-white text-lg">{ranking[2].full_name}</p>
              <p className="text-3xl font-black text-mundialYellow">{ranking[2].total_points}</p>
              <p className="text-sm text-slate-400">Puesto #{ranking[2].rank}</p>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Full Table */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Ranking Completo</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Pos</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-300">Participante</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">Puntos</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-300">Exactos</th>
              </tr>
            </thead>
            <tbody>
              {ranking?.map((participant) => (
                <motion.tr
                  key={participant.participant_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-slate-700 hover:bg-slate-700/20"
                >
                  <td className="px-4 py-3 font-bold text-mundialYellow">
                    {participant.rank === 1
                      ? '🥇'
                      : participant.rank === 2
                        ? '🥈'
                        : participant.rank === 3
                          ? '🥉'
                          : `#${participant.rank}`}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{participant.full_name}</td>
                  <td className="px-4 py-3 text-right font-black text-mundialYellow">
                    {participant.total_points}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {participant.exact_predictions}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
```

---

## STEP 4: Add Supabase RPC Calls

**File**: `src/services/supabase.ts`

```typescript
// Add to existing supabaseService

export const scoringService = {
  /**
   * Submit a prediction for a match
   */
  async submitPrediction(
    participantId: string,
    matchId: string,
    predictedHome: number,
    predictedAway: number
  ) {
    if (!supabase) throw new Error('Supabase not initialized')
    
    return supabase
      .from('predictions')
      .insert({
        participant_id: participantId,
        match_id: matchId,
        predicted_home: predictedHome,
        predicted_away: predictedAway,
      })
      .select()
  },

  /**
   * Register a match result and trigger scoring
   */
  async registerMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number
  ) {
    if (!supabase) throw new Error('Supabase not initialized')

    // 1. Update match
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
      })
      .eq('id', matchId)

    if (updateError) throw updateError

    // 2. Call scoring function
    return supabase.rpc('award_match_points', {
      p_match_id: matchId,
    })
  },

  /**
   * Get participant ranking (RPC)
   */
  async getParticipantRanking(tournamentId?: string) {
    if (!supabase) throw new Error('Supabase not initialized')

    return supabase.rpc('get_participant_ranking', {
      p_tournament_id: tournamentId || null,
    })
  },

  /**
   * Get participant statistics (RPC)
   */
  async getParticipantStats(participantId: string) {
    if (!supabase) throw new Error('Supabase not initialized')

    return supabase.rpc('get_participant_stats', {
      p_participant_id: participantId,
    })
  },

  /**
   * Recalculate all rankings (Admin only)
   */
  async recalculateAllRankings() {
    if (!supabase) throw new Error('Supabase not initialized')

    return supabase.rpc('recalculate_all_rankings')
  },
}
```

---

## STEP 5: Testing Checklist

### Unit Tests to Write
```typescript
// tests/scoring.test.ts
describe('Scoring Engine', () => {
  it('should award exact points correctly', () => {})
  it('should award tendency points only', () => {})
  it('should return 0 for incorrect predictions', () => {})
  it('should calculate ranking after multiple predictions', () => {})
  it('should handle edge cases (0-0, high scores)', () => {})
})
```

### Manual Testing Steps
1. **Submit Prediction**
   - [ ] Navigate to Predictions page
   - [ ] Enter score (e.g., 2-1)
   - [ ] Click "Guardar Pronóstico"
   - [ ] Verify in database

2. **Register Match Result**
   - [ ] Go to Admin > Resultados
   - [ ] Enter actual score (e.g., 2-1)
   - [ ] Click "Guardar"
   - [ ] Verify points awarded

3. **Check Ranking**
   - [ ] Navigate to Ranking page
   - [ ] Verify participant score updated
   - [ ] Check podium medals correct

4. **Check Statistics**
   - [ ] Go to Admin > Estadísticas
   - [ ] Verify Top Participantes updated
   - [ ] Check accuracy percentages

---

## DEPLOYMENT NOTES

After implementing, run:
```bash
npm run build
npm run dev
```

Visit:
- http://localhost:4176/pronosticos → Test predictions
- http://localhost:4176/ranking → Test ranking
- http://localhost:4176/admin → Register results

---

## TROUBLESHOOTING

### Error: "RPC function not found"
**Solution**: Ensure `postgres-functions.sql` was executed in Supabase

### Error: "Invalid column"
**Solution**: Check that all tables were created from `supabase-schema.sql`

### Ranking not updating
**Solution**: 
1. Check that `postgres-triggers.sql` was executed
2. Verify match status is 'finished'
3. Check browser console for errors

---

**Next**: Implement API Football integration after scoring is working! 🚀
