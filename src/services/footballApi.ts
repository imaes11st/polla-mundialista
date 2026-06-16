import type { FootballApiClient } from './api'
import type { Match } from '../types'
import { apiFootballService } from './apiFootball'

export class FootballApiService implements FootballApiClient {
  async fetchMatches(tournamentId: string): Promise<Match[]> {
    try {
      const fixtures = await apiFootballService.fetchMatches()
      return fixtures.map((f: any) => {
        const isFootballData = !!f.utcDate
        const id = isFootballData ? String(f.id) : String(f.fixture.id)
        const match_date = isFootballData ? f.utcDate : f.fixture.date
        const stage = isFootballData ? (f.stage || 'Grupo') : (f.league?.round || 'Grupo')
        
        let status: 'scheduled' | 'live' | 'finished' = 'scheduled'
        const statStr = isFootballData ? f.status : f.fixture?.status?.short
        if (['FT', 'FINISHED', 'AET', 'PEN'].includes(statStr?.toUpperCase())) {
          status = 'finished'
        } else if (['LIVE', 'IN_PLAY', 'PAUSED', '1H', '2H', 'HT', 'ET'].includes(statStr?.toUpperCase())) {
          status = 'live'
        }

        const home_score = isFootballData ? f.score?.fullTime?.home : f.goals?.home
        const away_score = isFootballData ? f.score?.fullTime?.away : f.goals?.away

        return {
          id,
          tournament_id: tournamentId,
          external_id: id,
          home_team_id: isFootballData ? String(f.homeTeam?.id) : String(f.teams?.home?.id),
          away_team_id: isFootballData ? String(f.awayTeam?.id) : String(f.teams?.away?.id),
          match_date,
          stage,
          status,
          home_score: home_score !== null && home_score !== undefined ? Number(home_score) : null,
          away_score: away_score !== null && away_score !== undefined ? Number(away_score) : null,
          created_at: new Date().toISOString()
        } as Match
      })
    } catch (error) {
      console.error('Failed to fetch matches:', error)
      return []
    }
  }

  async fetchTeams(): Promise<void> {
    try {
      await apiFootballService.fetchTeams()
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    }
  }

  async fetchStandings(tournamentId: string): Promise<void> {
    return undefined
  }

  async fetchPlayerStats(tournamentId: string): Promise<void> {
    return undefined
  }
}

