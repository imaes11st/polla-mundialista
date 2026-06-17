import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { MatchCard } from '../components/sport/SportComponents'
import { staggerContainer, itemVariants } from '../design/animations'

import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'
import { useMatches, MatchData } from '../hooks/useMatches' 
import { useParticipant } from '../contexts/ParticipantContext'
import { usePredictions } from '../hooks/usePredictions'
import { useToast } from '../contexts/ToastContext'

export function PredictionsPage() {
  const { participant } = useParticipant()
  const { showToast } = useToast()
  const [selectedStage, setSelectedStage] = useState<string>('')

  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['tournaments-predictions'],
    queryFn: () => supabaseService.listTournaments().then((r) => r.data || []),
  })
  
  const activeTournamentId = useMemo(() => 
    tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || '',
    [tournaments]
  )

  const { data: matches, isLoading: isLoadingMatches } = useMatches(activeTournamentId, participant?.id)
  const { data: predictions, isLoading: isLoadingPredictions, save } = usePredictions(participant?.id || '', activeTournamentId)

  // Agrupamos por FECHAS para un orden absoluto
  const { groupedByDate, datesAvailable } = useMemo(() => {
    const startDate = new Date('2026-06-17T00:00:00Z')
    const filteredMatches = (matches || []).filter(match => {
      if (!match.match_date) return false
      const matchDate = new Date(match.match_date)
      return matchDate >= startDate
    })

    const grouped = filteredMatches.reduce(
      (acc: Record<string, MatchData[]>, match: MatchData) => {
        // Formateamos la fecha como "17 JUN" o "17 JUNIO"
        const dateObj = new Date(match.match_date)
        const dateLabel = dateObj.toLocaleDateString('es-CO', { 
          day: '2-digit', 
          month: 'short',
          timeZone: 'America/Bogota'
        }).toUpperCase().replace('.', '')
        
        if (!acc[dateLabel]) acc[dateLabel] = []
        acc[dateLabel].push(match)
        return acc
      },
      {} as Record<string, MatchData[]>,
    )
    
    // Ordenamos las fechas cronológicamente usando el primer partido de cada grupo
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const timeA = new Date(grouped[a][0].match_date).getTime()
      const timeB = new Date(grouped[b][0].match_date).getTime()
      return timeA - timeB
    })

    return { groupedByDate: grouped, datesAvailable: sortedDates }
  }, [matches])

  // Selección dinámica por FECHA
  const defaultDate = useMemo(() => {
    if (datesAvailable.length === 0) return ''
    const todayLabel = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      timeZone: 'America/Bogota'
    }).toUpperCase().replace('.', '')
    return datesAvailable.includes(todayLabel) ? todayLabel : datesAvailable[0]
  }, [datesAvailable])

  const currentActiveDate = selectedStage || defaultDate
  const activeMatches = groupedByDate[currentActiveDate] || []
  const isLoading = isLoadingMatches || isLoadingTournaments || !activeTournamentId || !participant?.id

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
    >
      <Card variant="sport" interactive>
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-mundialYellow font-bold">Pronósticos</p>
          <h1 className="text-3xl font-black text-white">Realiza tus pronósticos</h1>
          <p className="text-slate-300">Selecciona un día del mundial para ver los partidos y guardar tus resultados.</p>
        </motion.div>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-8 w-8 border-4 border-mundialYellow border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Sincronizando datos del mundial...</p>
        </div>
      )}

      {!isLoading && datesAvailable.length > 0 && (
        <div className="py-2 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {datesAvailable.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedStage(date)}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  currentActiveDate === date
                    ? 'bg-mundialYellow text-slate-950 border-mundialYellow shadow-lg shadow-mundialYellow/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLoading && activeMatches.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-mundialYellow/20 to-transparent" />
            <p className="text-sm font-bold text-mundialYellow whitespace-nowrap">
              Partidos del {currentActiveDate}
            </p>
            <div className="flex-1 h-px bg-gradient-to-l from-mundialYellow/20 to-transparent" />
          </div>
          
          <div className="space-y-4">
            {activeMatches.map((match) => {
              // Extraer el pronóstico del JOIN de la base de datos
              const prediction = match.predictions?.[0]
              const matchPoints = match.points?.[0]?.points_awarded;

              // Bloqueamos si: (1) DB dice que no está 'scheduled' O (2) la hora del partido ya pasó (en UTC/local)
              const matchTime = new Date(match.match_date).getTime();
              const isMatchLocked = match.status !== 'scheduled' || matchTime <= Date.now();

              return (
                <MatchCard
                  key={match.id}
                  homeTeam={{ 
                    name: match.home_team?.name || '', 
                    flagUrl: match.home_team?.flag_url || '' 
                  }}
                  awayTeam={{ 
                    name: match.away_team?.name || '', 
                    flagUrl: match.away_team?.flag_url || '' 
                  }}
                  matchDate={match.match_date}
                  stage={match.stage}
                  status={match.status}
                  initialHomeScore={prediction?.predicted_home}
                  initialAwayScore={prediction?.predicted_away}
                  disabled={isMatchLocked}
                  points={matchPoints} // 👈 Pasamos los puntos del backend
                  onSave={(home, away) => {
                    if (isMatchLocked) {
                      showToast('Este partido ya comenzó o su hora ha pasado. No se permiten modificaciones.', 'error')
                      return
                    }

                    if (!participant) {
                      showToast('Por favor selecciona tu nombre en la página de inicio para guardar pronósticos.', 'info')
                      return
                    }
                    
                    save.mutate(
                      {
                        participant_id: participant.id,
                        match_id: match.id,
                        predicted_home: Number(home),
                        predicted_away: Number(away),
                      },
                      {
                        onSuccess: () => {
                          showToast('¡Pronóstico guardado exitosamente!', 'success')
                        },
                        onError: (err: any) => {
                          showToast(`Error al guardar: ${err.message}`, 'error')
                        },
                      },
                    )
                  }}
                />
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}