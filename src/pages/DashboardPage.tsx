import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart3, CalendarClock, Medal, Star } from 'lucide-react'
import { ColombiaConfetti } from '../components/visual/ColombiaConfetti'
import { FloatingFootballs } from '../components/visual/FloatingFootballs'
import { StadiumLights } from '../components/visual/StadiumLights'
import { WorldCupParticles } from '../components/visual/WorldCupParticles'
import { RulesModal } from '../components/RulesModal'
import { Card } from '../components/ui/Card'
import { MatchCard, StatCard } from '../components/sport/SportComponents'
import { useParticipant } from '../contexts/ParticipantContext'
import { useToast } from '../contexts/ToastContext'
import { itemVariants, staggerContainer } from '../design/animations'
import { useColombiaStatus } from '../hooks/useColombiaStatus'
import { useMatches, useUpcomingMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useParticipantRanking, useParticipantStats } from '../hooks/useScoringCalculator'
import { supabaseService } from '../services/supabase'

function useCountdown(targetDateString: string | null | undefined) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!targetDateString) return

    const targetTime = new Date(targetDateString).getTime()
    if (isNaN(targetTime)) return

    const tick = () => {
      const diff = targetTime - Date.now()
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      setCountdown({
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [targetDateString])

  return countdown
}

function ColombiaFlagMark() {
  return (
    <div className="h-9 w-14 overflow-hidden rounded-sm border border-white/30 shadow-md" aria-hidden="true">
      <div className="h-1/2 bg-[#FCD116]" />
      <div className="h-1/4 bg-[#003893]" />
      <div className="h-1/4 bg-[#CE1126]" />
    </div>
  )
}

export function DashboardPage() {
  const { participant } = useParticipant()
  const { showToast } = useToast()
  const [confettiActive, setConfettiActive] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')

  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['tournaments-dashboard'],
    queryFn: () => supabaseService.listTournaments().then((result) => result.data || []),
  })

  const activeTournamentId = useMemo(() => 
    tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || '',
    [tournaments]
  )
  
  const { data: matches, isLoading: isLoadingMatches } = useMatches(activeTournamentId, participant?.id)
  const { hasWon, nextMatch } = useColombiaStatus(activeTournamentId)
  
  const { data: predictions, isLoading: isLoadingPredictions, save } = usePredictions(participant?.id || '', activeTournamentId)
  
  const { data: userStats } = useParticipantStats(participant?.id || '')
  const { data: rankingData } = useParticipantRanking(activeTournamentId)

  const countdown = useCountdown(nextMatch?.match_date)

  useEffect(() => {
    if (hasWon) setConfettiActive(true)
  }, [hasWon])

  // Agrupamos por FECHAS para un orden absoluto
  const { groupedByDate, datesAvailable } = useMemo(() => {
    // Definimos la fecha límite (16 de Junio 2026)
    const startDate = new Date('2026-06-16T00:00:00')

    const filteredMatches = (matches || []).filter(match => {
      const matchDate = new Date(match.match_date)
      return matchDate >= startDate
    })

    const grouped = filteredMatches.reduce(
      (acc: Record<string, any[]>, match: any) => {
        const dateObj = new Date(match.match_date)
        const dateLabel = dateObj.toLocaleDateString('es-CO', { 
          day: '2-digit', 
          month: 'short' 
        }).toUpperCase().replace('.', '')
        
        if (!acc[dateLabel]) acc[dateLabel] = []
        acc[dateLabel].push(match)
        return acc
      },
      {} as Record<string, any[]>,
    )
    
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const timeA = new Date(grouped[a][0].match_date).getTime()
      const timeB = new Date(grouped[b][0].match_date).getTime()
      return timeA - timeB
    })

    return { groupedByDate: grouped, datesAvailable: sortedDates }
  }, [matches])

  const currentActiveDate = selectedStage || datesAvailable[0] || ''
  const activeMatches = groupedByDate[currentActiveDate] || []
  const isLoading = isLoadingMatches || isLoadingTournaments || !activeTournamentId || !participant?.id

  // Encontrar posición del usuario actual
  const userRank = rankingData?.find(r => r.participant_id === participant?.id)?.rank || '-'
  const totalParticipants = rankingData?.length || 0

  return (
    <div className="relative">
      <FloatingFootballs count={7} intensity="soft" />
      <StadiumLights />
      <WorldCupParticles count={36} />
      <ColombiaConfetti active={confettiActive} duration={7000} onEnd={() => setConfettiActive(false)} />

      <motion.div className="relative z-10 space-y-6" variants={staggerContainer(0.1)} initial="hidden" animate="visible">
        <Card variant="sport" interactive>
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-widest text-mundialYellow">Dashboard</p>
              <RulesModal />
            </div>
            <h1 className="text-3xl font-black text-white">
              Bienvenido, <span className="text-mundialYellow">{participant?.full_name || 'Jugador'}</span>
            </h1>
            <p className="text-slate-300">Listo para tus pronósticos. Aquí tienes un resumen de tu actividad.</p>

            {hasWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 rounded-full border border-mundialYellow/40 bg-gradient-to-r from-mundialYellow/20 to-mundialRed/20 px-4 py-2"
              >
                <ColombiaFlagMark />
                <span className="text-sm font-bold text-mundialYellow">Colombia ganó el último partido</span>
              </motion.div>
            )}
          </motion.div>
        </Card>

        {nextMatch && (
          <motion.section
            variants={itemVariants}
            className="overflow-hidden rounded-3xl border border-mundialYellow/30 bg-slate-950/70 backdrop-blur-sm"
          >
            <div className="h-2 bg-gradient-to-r from-[#FCD116] via-[#003893] to-[#CE1126]" />
            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="flex items-center gap-4">
                <ColombiaFlagMark />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mundialYellow">
                    Cuenta regresiva Colombia
                  </p>
                  <h2 className="mt-1 text-xl font-black text-white">
                    {nextMatch.home_team?.name || 'Por definir'} vs {nextMatch.away_team?.name || 'Por definir'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(nextMatch.match_date).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Días', value: countdown.days },
                  { label: 'Horas', value: countdown.hours },
                  { label: 'Min', value: countdown.minutes },
                  { label: 'Seg', value: countdown.seconds },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center">
                    <motion.p
                      key={value}
                      initial={{ scale: 1.1, opacity: 0.75 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="tabular-nums text-xl font-black text-mundialYellow"
                    >
                      {String(value).padStart(2, '0')}
                    </motion.p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {[
            { title: 'Tus puntos', value: userStats?.total_points ?? 0, icon: <Star className="h-6 w-6" /> },
            { title: 'Tu posición', value: userRank, icon: <Medal className="h-6 w-6" /> },
            { title: 'Participantes', value: totalParticipants, icon: <BarChart3 className="h-6 w-6" /> },
          ].map((stat) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
            </motion.div>
          ))}
        </motion.div>

        {/* Sección de Preguntas Especiales */}
        <motion.div variants={itemVariants}>
          <Link to="/especiales">
            <Card variant="dark" interactive className="border-mundialYellow/40 bg-gradient-to-r from-slate-900 to-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-mundialYellow/20 p-3">
                    <Star className="h-6 w-6 text-mundialYellow" />
                  </div>
                  <div>
                    <h3 className="font-black text-white">🎯 Preguntas Especiales (Batacazos)</h3>
                    <p className="text-sm text-slate-400">¡Gana hasta 38 puntos extra con el campeón, goleadores y más!</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="rounded-full bg-mundialYellow px-3 py-1 text-xs font-black text-slate-950 uppercase">Ir ahora</span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-slate-800 pb-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-mundialYellow">Próximos partidos</p>
            </div>
            <CalendarClock className="h-7 w-7 text-mundialYellow" />
          </div>

          {isLoading && (
            <p className="text-sm text-slate-400 text-center py-8">⚽ Sincronizando usuario y cargando partidos reales...</p>
          )}
          
          {!isLoading && (!matches || matches.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-8">No hay partidos programados.</p>
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

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-mundialYellow/20 to-transparent" />
              <p className="text-xs font-bold text-mundialYellow whitespace-nowrap uppercase tracking-widest">
                Partidos del {currentActiveDate}
              </p>
              <div className="flex-1 h-px bg-gradient-to-l from-mundialYellow/20 to-transparent" />
            </div>

            {!isLoading &&
              activeMatches.map((match: any) => {
                // Extraer el pronóstico del JOIN de la base de datos
                const prediction = match.predictions?.[0]
                const matchPoints = predictions?.find((p: any) => String(p.match_id || p.match?.id) === String(match.id))?.points_awarded;

                // 🛡️ REGLA DE BLOQUEO ESTANDARIZADA
                // La fuente de verdad es el estado del partido en la base de datos.
                // Solo se permite editar si el estado es 'scheduled'.
                const isBlocked = match.status !== 'scheduled';

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
                    disabled={isBlocked}
                    points={matchPoints} // 👈 Pasamos los puntos del backend
                    onSave={(home, away) => {
                      if (isBlocked) {
                        showToast('Este partido ya comenzó o cambió su estado. No se permiten modificaciones.', 'error');
                        return;
                      }

                      if (!participant) {
                        showToast('Selecciona tu usuario en el inicio para guardar.', 'info')
                        return
                      }
                      save.mutate({
                        participant_id: participant.id,
                        match_id: match.id,
                        predicted_home: Number(home),
                        predicted_away: Number(away),
                      }, {
                        onSuccess: () => {
                          showToast('¡Pronóstico guardado exitosamente!', 'success')
                        },
                        onError: (err: any) => {
                          showToast(`Error al guardar: ${err.message}`, 'error')
                        }
                      })
                    }}
                  />
                )
              })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}