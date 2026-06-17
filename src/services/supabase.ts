import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
}) : null

function ensureClient() {
  if (!supabase) {
    throw new Error('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
  }
  return supabase
}

export const supabaseService = {
  supabase, // Exportamos el cliente para llamadas directas como RPC
  async listParticipants() {
    return ensureClient().from('participants').select('*').eq('is_active', true)
  },

  async getParticipantById(id: string) {
    return ensureClient().from('participants').select('*').eq('id', id).single()
  },

  async getParticipantByPhone(phone: string) {
    return ensureClient()
      .from('participants')
      .select('*')
      .eq('phone_number', phone)
      .eq('is_active', true)
      .maybeSingle()
  },

  async saveParticipant(participant: { id?: string; full_name: string; phone_number?: string; is_active?: boolean }) {
    return ensureClient()
      .from('participants')
      .upsert(participant)
      .select()
  },

  async deleteParticipant(id: string) {
    // Soft delete to avoid breaking historical score tables / predictions
    return ensureClient()
      .from('participants')
      .update({ is_active: false })
      .eq('id', id)
  },

  async listTournaments() {
    return ensureClient().from('tournaments').select('*').eq('is_active', true)
  },

  async listUpcomingMatches(tournamentId: string) {
    return ensureClient()
      .from('matches')
      .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
      .eq('tournament_id', tournamentId)
      .in('status', ['scheduled', 'live'])
      .order('match_date', { ascending: true })
  },

  async listAllMatches(tournamentId: string) {
    return ensureClient()
      .from('matches')
      .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
      .eq('tournament_id', tournamentId)
      .order('match_date', { ascending: true })
  },

  async listMatchesWithPredictions(tournamentId: string, participantId: string) {
    if (!participantId || !tournamentId) return { data: [], error: null };
    
    return ensureClient()
      .from('matches')
      .select(`
        *,
        home_team:home_team_id(*),
        away_team:away_team_id(*),
        predictions!left(
          id,
          predicted_home,
          predicted_away,
          participant_id
        ),
        points:participant_points!left(
          points_awarded,
          participant_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('predictions.participant_id', participantId)
      .eq('points.participant_id', participantId)
      .order('match_date', { ascending: true })
  },

  // CORREGIDO: Filtra por participante y torneo. Los puntos se manejan preferiblemente en listMatchesWithPredictions.
  async getPredictions(participantId: string, tournamentId: string) {
    if (!participantId || !tournamentId) return { data: [], error: null };

    return ensureClient()
      .from('predictions')
      .select(`
        *,
        match:match_id!inner(*)
      `)
      .eq('participant_id', participantId)
      .eq('match.tournament_id', tournamentId)
  },

  async listSpecialQuestions(tournamentId: string) {
    if (!tournamentId) return { data: [], error: null };
    return ensureClient()
      .from('special_questions')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('is_active', true)
  },

  async listSpecialAnswers(participantId: string) {
    if (!participantId) return { data: [], error: null };
    return ensureClient()
      .from('special_answers')
      .select('*')
      .eq('participant_id', participantId)
  },

  async saveSpecialAnswer(payload: {
    question_id: string
    participant_id: string
    answer: string
  }) {
    return ensureClient()
      .from('special_answers')
      .upsert(payload, { onConflict: 'question_id,participant_id' })
      .select()
  },

  async updateMatchResult(
    matchId: string,
    payload: {
      home_score: number
      away_score: number
      status: 'scheduled' | 'live' | 'finished'
    }
  ) {
    return ensureClient()
      .from('matches')
      .update(payload)
      .eq('id', matchId)
      .select()
  },

  // OPTIMIZADO: Agregamos el .select() al final para forzar el retorno de los datos guardados
  async savePrediction(payload: {
    participant_id: string
    match_id: string
    predicted_home: number
    predicted_away: number
  }) {
    return ensureClient()
      .from('predictions')
      .upsert(payload, { onConflict: 'participant_id,match_id' })
      .select()
  },

  async listTeams() {
    return ensureClient().from('teams').select('*').order('name', { ascending: true })
  },

  async syncMatches() {
    return ensureClient().functions.invoke('sync-matches')
  },
}