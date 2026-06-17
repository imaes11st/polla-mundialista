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
    <div className="h-9 w-13 overflow-hidden rounded-lg border border-white/20 shadow-md flex-shrink-0" aria-hidden="true">
      <div className="h-1/2 bg-[#FCD116]" />
      <div className="h-1/4 bg-[#003893]" />
      <div className="h-1/4 bg-[#CE1126]" />
    </div>
  )
}

// User avatar with initials
function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-lg md:text-xl text-slate-950 flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #FCD116, #F6D365)',
        boxShadow: '0 0 20px rgba(252, 209, 22, 0.25)',
      }}
    >
      {initials}
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

  // Auto-sync matches from API on mount, throttled to run at most once every 5 minutes
  useEffect(() => {
    const SYNC_COOLDOWN = 5 * 60 * 1000 // 5 minutes
    const lastSync = localStorage.getItem('lastAutoSync')
    const now = Date.now()
    
    if (!lastSync || now - parseInt(lastSync, 10) > SYNC_COOLDOWN) {
      supabaseService.syncMatches()
        .then(() => {
          localStorage.setItem('lastAutoSync', String(now))
        })
        .catch((err) => {
          console.error('Auto-sync matches failed:', err)
        })
    }
  }, [])

  // Agrupamos por FECHAS para un orden absoluto
  const { groupedByDate, datesAvailable } = useMemo(() => {
    if (!matches) return { groupedByDate: {}, datesAvailable: [] }

    const startDate = new Date('2026-06-17T00:00:00Z')

    const filteredMatches = (matches || []).filter(match => {
      if (!match.match_date) return false
      const matchDate = new Date(match.match_date)
      return matchDate >= startDate
    })

    const grouped = filteredMatches.reduce(
      (acc: Record<string, any[]>, match: any) => {
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
      {} as Record<string, any[]>,
    )
    
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const matchA = grouped[a]?.[0]
      const matchB = grouped[b]?.[0]
      if (!matchA || !matchB) return 0
      const timeA = new Date(matchA.match_date).getTime()
      const timeB = new Date(matchB.match_date).getTime()
      return timeA - timeB
    })

    return { groupedByDate: grouped, datesAvailable: sortedDates }
  }, [matches])

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
  const activeMatches = currentActiveDate ? (groupedByDate[currentActiveDate] || []) : []
  const isLoading = isLoadingMatches || isLoadingTournaments || !activeTournamentId || !participant?.id

  // Encontrar posición del usuario actual
  const userRank = rankingData && Array.isArray(rankingData) 
    ? (rankingData.find(r => r.participant_id === participant?.id)?.rank || '-') 
    : '-'
  const totalParticipants = (rankingData && Array.isArray(rankingData)) ? rankingData.length : 0

  if (!participant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-slate-400">Por favor, inicia sesión para ver tu dashboard.</p>
        <Link to="/login" className="rounded-2xl bg-mundialYellow text-slate-950 px-6 py-2 font-bold">Ir a Login</Link>
      </div>
    )
  }

  return (
    <div className="relative pb-24 md:pb-8">
      <FloatingFootballs count={5} intensity="soft" />
      <StadiumLights />
      <WorldCupParticles count={28} />
      <ColombiaConfetti active={confettiActive} duration={7000} onEnd={() => setConfettiActive(false)} />

      <motion.div className="relative z-10 space-y-5 md:space-y-6" variants={staggerContainer(0.08)} initial="hidden" animate="visible">
        
        {/* ─── Welcome Header ─── */}
        <Card variant="glass">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <UserAvatar name={participant?.full_name || 'J'} />
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-mundialYellow/70">Dashboard</p>
                  <h1 className="text-xl md:text-2xl font-black text-white truncate">
                    Hola, <span className="text-gradient-gold">{participant?.full_name?.split(' ')[0] || 'Jugador'}</span>
                  </h1>
                </div>
              </div>
              <RulesModal />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Listo para tus pronósticos. Aquí tienes un resumen de tu actividad.</p>

            {hasWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 rounded-xl border border-mundialYellow/30 bg-mundialYellow/[0.08] px-4 py-2"
              >
                <ColombiaFlagMark />
                <span className="text-xs md:text-sm font-bold text-mundialYellow">Colombia ganó el último partido 🎉</span>
              </motion.div>
            )}
          </motion.div>
        </Card>

        {/* ─── Colombia Countdown ─── */}
        {nextMatch && (
          <motion.section
            variants={itemVariants}
            className="overflow-hidden rounded-2xl md:rounded-3xl border border-mundialYellow/20 glass-card"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#FCD116] via-[#003893] to-[#CE1126]" />
            <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <ColombiaFlagMark />
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-mundialYellow/70">
                    Cuenta regresiva Colombia
                  </p>
                  <h2 className="mt-0.5 text-base md:text-xl font-black text-white truncate">
                    {nextMatch.home_team?.name || 'Por definir'} vs {nextMatch.away_team?.name || 'Por definir'}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(nextMatch.match_date).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Bogota'
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
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 text-center">
                    <motion.p
                      key={value}
                      initial={{ scale: 1.1, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="tabular-nums text-lg md:text-xl font-black text-mundialYellow"
                    >
                      {String(value).padStart(2, '0')}
                    </motion.p>
                    <p className="mt-0.5 text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ─── Stats Row ─── */}
        <motion.div className="grid grid-cols-3 gap-3 md:gap-4" variants={staggerContainer(0.06)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {[
            { title: 'Tus puntos', value: userStats?.total_points ?? 0, icon: <Star className="h-5 w-5" /> },
            { title: 'Tu posición', value: userRank, icon: <Medal className="h-5 w-5" /> },
            { title: 'Jugadores', value: totalParticipants, icon: <BarChart3 className="h-5 w-5" /> },
          ].map((stat) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Special Questions CTA ─── */}
        <motion.div variants={itemVariants}>
          <Link to="/especiales">
            <div className="glass-card glass-card-hover rounded-2xl p-4 md:p-5 border-mundialYellow/20">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="rounded-xl bg-mundialYellow/10 p-2.5 md:p-3 flex-shrink-0">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-mundialYellow" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-white text-sm md:text-base truncate">🎯 Preguntas Especiales</h3>
                    <p className="text-[11px] md:text-sm text-slate-400 truncate">¡Gana hasta 38 puntos extra!</p>
                  </div>
                </div>
                <span className="hidden sm:block rounded-xl bg-mundialYellow/10 border border-mundialYellow/25 px-3 py-1.5 text-[10px] md:text-xs font-black text-mundialYellow uppercase">
                  Ir ahora →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ─── Matches Section ─── */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-end justify-between gap-3 border-b border-white/[0.06] pb-2">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-mundialYellow/70">Próximos partidos</p>
            </div>
            <CalendarClock className="h-6 w-6 text-mundialYellow/50" />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-8 w-8 border-3 border-mundialYellow border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Sincronizando partidos...</p>
            </div>
          )}
          
          {!isLoading && (!matches || matches.length === 0) && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏟️</p>
              <p className="text-sm text-slate-400">No hay partidos programados.</p>
            </div>
          )}

          {/* Date tabs */}
          {!isLoading && datesAvailable.length > 0 && (
            <div className="py-1 -mx-4 px-4 overflow-x-auto no-scrollbar">
              <div className="flex gap-2 min-w-max">
                {datesAvailable.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedStage(date)}
                    className={`px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                      currentActiveDate === date
                        ? 'bg-mundialYellow/15 text-mundialYellow border-mundialYellow/40 shadow-glow-yellow'
                        : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match list */}
          <motion.div
            className="space-y-3 md:space-y-4 pt-1"
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
          >
            {/* Date divider */}
            {currentActiveDate && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-mundialYellow/15 to-transparent" />
                <p className="text-[10px] font-bold text-mundialYellow/60 whitespace-nowrap uppercase tracking-widest">
                  {currentActiveDate}
                </p>
                <div className="flex-1 h-px bg-gradient-to-l from-mundialYellow/15 to-transparent" />
              </div>
            )}

            {!isLoading &&
              activeMatches.map((match: any) => {
                const prediction = match.predictions?.[0]
                const matchPoints = match.points?.[0]?.points_awarded;

                const matchTime = new Date(match.match_date).getTime();
                const isBlocked = match.status !== 'scheduled' || matchTime <= Date.now();

                return (
                  <motion.div key={match.id} variants={itemVariants}>
                    <MatchCard
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
                      points={matchPoints}
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
                  </motion.div>
                )
              })}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}