export interface Tournament {
  id: string
  name: string
  year: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export interface Participant {
  id: string
  full_name: string
  phone_number: string | null
  is_active: boolean
  created_at: string
}

export interface Team {
  id: string
  name: string
  code: string
  flag_url: string
  created_at: string
}

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Match {
  id: string
  tournament_id: string
  external_id: string | null
  home_team_id: string
  away_team_id: string
  match_date: string
  stage: string
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  created_at: string
}

export interface Prediction {
  id: string
  participant_id: string
  match_id: string
  predicted_home: number | null
  predicted_away: number | null
  points_awarded?: number // Sincronizado con la lógica autónoma del backend
  created_at: string
  updated_at: string
  // Datos extendidos opcionales que vienen de JOINS
  match?: Match
  points?: { points_awarded: number }[] | { points_awarded: number }
}

export interface ScoringRule {
  id: string
  stage: string
  exact_points: number
  tendency_points: number
}

export interface ParticipantPoint {
  id: string
  participant_id: string
  match_id: string
  points_awarded: number
  created_at: string
}

export interface SpecialQuestion {
  id: string
  tournament_id: string
  question: string
  type: 'team' | 'player' | 'text'
  points: number
  is_active: boolean
}

export interface SpecialAnswer {
  id: string
  question_id: string
  participant_id: string
  answer: string
}
