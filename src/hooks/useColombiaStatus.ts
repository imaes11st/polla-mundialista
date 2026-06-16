import { useMemo } from 'react'
import { useColombiaMatches } from './useMatches'

// Interfaz para dar tipado estricto a los partidos dentro del hook
interface TeamData {
  name: string
  code: string
  flag_url: string
}

interface MatchData {
  id: string
  status: string
  match_date: string
  home_score: number | null
  away_score: number | null
  home_team: TeamData
  away_team: TeamData
}

function isColombiaWin(match: MatchData): boolean {
  if (match.status !== 'finished') return false
  if (match.home_score === null || match.away_score === null) return false

  const homeName = (match.home_team?.name || '').toLowerCase()
  const awayName = (match.away_team?.name || '').toLowerCase()
  const homeCode = (match.home_team?.code || '').toLowerCase()
  const awayCode = (match.away_team?.code || '').toLowerCase()

  // Se añade soporte para códigos de 2 y 3 letras comunes de Colombia ('co', 'col')
  const colombiaIsHome = homeName === 'colombia' || homeCode === 'co' || homeCode === 'col'
  const colombiaIsAway = awayName === 'colombia' || awayCode === 'co' || awayCode === 'col'

  if (colombiaIsHome) {
    return match.home_score > match.away_score
  }
  if (colombiaIsAway) {
    return match.away_score > match.home_score
  }
  return false
}

export function useColombiaStatus(tournamentId: string) {
  const { data: matches, isLoading } = useColombiaMatches(tournamentId)

  const result = useMemo(() => {
    // Forzamos el tipado sobre la respuesta del hook padre
    const typedMatches = (matches as MatchData[]) || []

    if (typedMatches.length === 0) {
      return {
        hasWon: false,
        nextMatch: null,
        nextMatchCountdown: null,
        lastFinished: null,
        isLoading,
      }
    }

    // Check if most recent finished match is a Colombia win
    const finished = typedMatches
      .filter((m: MatchData) => m.status === 'finished')
      .sort((a: MatchData, b: MatchData) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

    const lastFinished = finished[0] || null
    const hasWon = lastFinished ? isColombiaWin(lastFinished) : false

    // Next upcoming match
    const upcoming = typedMatches
      .filter((m: MatchData) => m.status === 'scheduled' || m.status === 'live')
      .sort((a: MatchData, b: MatchData) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

    const nextMatch = upcoming[0] || null

    let nextMatchCountdown: { days: number; hours: number; minutes: number; seconds: number } | null = null
    if (nextMatch) {
      const diff = new Date(nextMatch.match_date).getTime() - Date.now()
      if (diff > 0) {
        const totalSeconds = Math.floor(diff / 1000)
        const days = Math.floor(totalSeconds / 86400)
        const hours = Math.floor((totalSeconds % 86400) / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        nextMatchCountdown = { days, hours, minutes, seconds }
      }
    }

    return { hasWon, nextMatch, nextMatchCountdown, lastFinished, isLoading }
  }, [matches, isLoading])

  return result
}