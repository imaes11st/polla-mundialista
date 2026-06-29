import type { Match } from '../types'

export interface NormalizedTeam {
  id: string | number
  name: string
  code: string
  flagUrl: string
}

export interface NormalizedMatch {
  id: string | number
  matchDate: string
  stage: string
  status: string
  homeScore: number | null
  awayScore: number | null
  homeScoreRegular: number | null  // 90-minute score (null for group stage)
  awayScoreRegular: number | null  // 90-minute score (null for group stage)
  homeTeam: NormalizedTeam
  awayTeam: NormalizedTeam
}

export class ApiFootballService {
  private readonly apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || ''
  private readonly baseUrl = import.meta.env.VITE_FOOTBALL_API_URL || 'https://v3.football.api-sports.io'
  private readonly competitionCode = import.meta.env.VITE_FOOTBALL_COMPETITION_CODE || 'WC'
  private readonly season = import.meta.env.VITE_FOOTBALL_SEASON || '2026'

  async fetchMatches(leagueId?: string, season?: string): Promise<any[]> {
    if (!this.baseUrl) return []

    const competition = leagueId || this.competitionCode
    const seasonYear = season || this.season

    let url: string
    if (this.baseUrl.includes('football-data.org')) {
      url = `${this.baseUrl}/competitions/${competition}/matches?season=${seasonYear}`
    } else {
      url = `${this.baseUrl}/fixtures?league=${competition}&season=${seasonYear}`
    }

    const headers: Record<string, string> = {}

    if (this.apiKey) {
      if (this.baseUrl.includes('football-data.org')) {
        headers['X-Auth-Token'] = this.apiKey
      } else {
        headers['x-apisports-key'] = this.apiKey
      }
    }

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`API Football fetch matches failed: ${response.statusText}`)
    }
    const data = await response.json()
    return data.response || data.matches || []
  }

  async fetchTeams(leagueId?: string, _season?: string): Promise<any[]> {
    if (!this.baseUrl) return []

    const competition = leagueId || this.competitionCode

    let url: string
    if (this.baseUrl.includes('football-data.org')) {
      url = `${this.baseUrl}/competitions/${competition}/teams`
    } else {
      url = `${this.baseUrl}/teams?league=${competition}&season=${_season || this.season}`
    }

    const headers: Record<string, string> = {}

    if (this.apiKey) {
      if (this.baseUrl.includes('football-data.org')) {
        headers['X-Auth-Token'] = this.apiKey
      } else {
        headers['x-apisports-key'] = this.apiKey
      }
    }

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw new Error(`API Football fetch teams failed: ${response.statusText}`)
    }
    const data = await response.json()
    return data.response || data.teams || []
  }

  /**
   * Normaliza los equipos extrayendo correctamente la URL del escudo/bandera 
   * sin importar de qué proveedor provenga la información.
   */
  normalizeTeams(rawTeams: any[]): NormalizedTeam[] {
    const isFootballData = this.baseUrl.includes('football-data.org')

    return rawTeams.map((t) => {
      if (isFootballData) {
        return {
          id: t.id,
          name: t.name,
          code: t.tla || t.clubColors || '', // tla suele ser el código de 3 letras (ej: COL)
          flagUrl: t.crest || t.flag || '',  // URL directa de la imagen
        }
      } else {
        // Formato para API-Football (api-sports.io)
        return {
          id: t.team?.id,
          name: t.team?.name,
          code: t.team?.code || '',
          flagUrl: t.team?.logo || '', // URL directa del escudo (.png o .svg)
        }
      }
    })
  }

  /**
   * Normaliza los partidos para que la inserción o sincronización con 
   * tu base de datos de Supabase mantenga siempre las URLs mapeadas.
   */
  normalizeMatches(rawMatches: any[]): NormalizedMatch[] {
    const isFootballData = this.baseUrl.includes('football-data.org')

    return rawMatches.map((m) => {
      if (isFootballData) {
        // football-data.org provides score.regularTime for 90-min result
        const regularHome = m.score?.regularTime?.home ?? null
        const regularAway = m.score?.regularTime?.away ?? null
        return {
          id: m.id,
          matchDate: m.utcDate,
          stage: m.stage,
          status: m.status?.toLowerCase(),
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
          homeScoreRegular: regularHome,
          awayScoreRegular: regularAway,
          homeTeam: {
            id: m.homeTeam?.id,
            name: m.homeTeam?.name,
            code: m.homeTeam?.tla || '',
            flagUrl: m.homeTeam?.crest || '',
          },
          awayTeam: {
            id: m.awayTeam?.id,
            name: m.awayTeam?.name,
            code: m.awayTeam?.tla || '',
            flagUrl: m.awayTeam?.crest || '',
          },
        }
      } else {
        // api-sports.io: extratime is provided separately when match goes to ET
        const hasExtraTime = m.score?.extratime?.home != null
        const regularHome = hasExtraTime
          ? (m.goals?.home ?? 0) - (m.score?.extratime?.home ?? 0)
          : null
        const regularAway = hasExtraTime
          ? (m.goals?.away ?? 0) - (m.score?.extratime?.away ?? 0)
          : null
        return {
          id: m.fixture?.id,
          matchDate: m.fixture?.date,
          stage: m.league?.round,
          status: m.fixture?.status?.short?.toLowerCase() === 'ft' ? 'finished' : 'scheduled',
          homeScore: m.goals?.home ?? null,
          awayScore: m.goals?.away ?? null,
          homeScoreRegular: regularHome,
          awayScoreRegular: regularAway,
          homeTeam: {
            id: m.teams?.home?.id,
            name: m.teams?.home?.name,
            code: m.teams?.home?.code || '',
            flagUrl: m.teams?.home?.logo || '',
          },
          awayTeam: {
            id: m.teams?.away?.id,
            name: m.teams?.away?.name,
            code: m.teams?.away?.code || '',
            flagUrl: m.teams?.away?.logo || '',
          },
        }
      }
    })
  }
}

export const apiFootballService = new ApiFootballService()