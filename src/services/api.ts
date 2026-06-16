import { Match, Participant, Prediction, Tournament } from '../types'

export interface FootballApiClient {
  fetchMatches(tournamentId: string): Promise<Match[]>
  fetchTeams(): Promise<void>
  fetchStandings(tournamentId: string): Promise<void>
  fetchPlayerStats(tournamentId: string): Promise<void>
}

export interface SupabaseApi {
  getParticipants(): Promise<Participant[]>
  getTournament(id: string): Promise<Tournament | null>
  getPredictions(participantId: string, tournamentId: string): Promise<Prediction[]>
}
