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
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('predictions.participant_id', participantId)
      .order('match_date', { ascending: true })
  },

  // CORREGIDO: Filtra por participante y torneo, e incluye los puntos otorgados desde la tabla participant_points
  async getPredictions(participantId: string, tournamentId: string) {
    if (!participantId || !tournamentId) return { data: [], error: null };

    return ensureClient()
      .from('predictions')
      .select('*, match:match_id!inner(*), points:participant_points!participant_id_match_id_fkey(points_awarded)')
      .eq('participant_id', participantId)
      .eq('match.tournament_id', tournamentId)
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

  async syncMatches() {
    return ensureClient().functions.invoke('sync-matches')
  },
}