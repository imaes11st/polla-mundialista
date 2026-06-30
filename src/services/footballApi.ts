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

        let home_score = isFootballData ? f.score?.fullTime?.home : f.goals?.home
        let away_score = isFootballData ? f.score?.fullTime?.away : f.goals?.away

        if (isFootballData && f.score?.duration === 'PENALTY_SHOOTOUT') {
          const regHome = f.score?.regularTime?.home !== null && f.score?.regularTime?.home !== undefined ? Number(f.score.regularTime.home) : 0;
          const regAway = f.score?.regularTime?.away !== null && f.score?.regularTime?.away !== undefined ? Number(f.score.regularTime.away) : 0;
          const extHome = f.score?.extraTime?.home !== null && f.score?.extraTime?.home !== undefined ? Number(f.score.extraTime.home) : 0;
          const extAway = f.score?.extraTime?.away !== null && f.score?.extraTime?.away !== undefined ? Number(f.score.extraTime.away) : 0;
          home_score = regHome + extHome;
          away_score = regAway + extAway;
        }

        // 90-minute score for knockout stages (used for scoring predictions)
        let home_score_regular: number | null = null
        let away_score_regular: number | null = null
        if (isFootballData) {
          // football-data.org provides regularTime directly
          home_score_regular = f.score?.regularTime?.home ?? null
          away_score_regular = f.score?.regularTime?.away ?? null
        } else {
          // api-sports.io: compute by subtracting extratime
          if (f.score?.extratime?.home != null) {
            home_score_regular = (f.goals?.home ?? 0) - (f.score.extratime.home ?? 0)
            away_score_regular = (f.goals?.away ?? 0) - (f.score.extratime.away ?? 0)
          }
        }

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
          home_score_regular: home_score_regular !== null ? Number(home_score_regular) : null,
          away_score_regular: away_score_regular !== null ? Number(away_score_regular) : null,
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

