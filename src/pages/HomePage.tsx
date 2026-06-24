import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BarChart3, CalendarClock, Medal, Sparkles, Trophy, Users } from 'lucide-react'
import { AnimatedBall } from '../components/decorative/Decorations'
import { Podium } from '../components/sport/SportComponents'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ColombiaConfetti } from '../components/visual/ColombiaConfetti'
import { FloatingFootballs } from '../components/visual/FloatingFootballs'
import { StadiumLights } from '../components/visual/StadiumLights'
import { WorldCupParticles } from '../components/visual/WorldCupParticles'
import { fadeInUp, staggerContainer, itemVariants, popIn } from '../design/animations'
import { useColombiaStatus } from '../hooks/useColombiaStatus'
import { useParticipant } from '../contexts/ParticipantContext'
import { useParticipantRanking } from '../hooks/useScoringCalculator'
import { supabaseService } from '../services/supabase'

function useCountdown(target: Date | null) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!target) return

    const tick = () => {
      const diff = target.getTime() - Date.now()
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
  }, [target])

  return countdown
}

function ColombiaFlagMark() {
  return (
    <div className="h-10 w-14 overflow-hidden rounded-lg border border-white/20 shadow-md flex-shrink-0" aria-hidden="true">
      <div className="h-1/2 bg-[#FCD116]" />
      <div className="h-1/4 bg-[#003893]" />
      <div className="h-1/4 bg-[#CE1126]" />
    </div>
  )
}

// Geometric SVG pattern inspired by FIFA 2026 branding
function HeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.04] pointer-events-none" aria-hidden="true">
      <svg className="absolute w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="heroGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0 L60 15 L60 45 L30 60 L0 45 L0 15 Z" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#heroGrid)" />
      </svg>
    </div>
  )
}

export function HomePage() {
  const { participant } = useParticipant()
  const [confettiActive, setConfettiActive] = useState(false)
  const [appLoading, setAppLoading] = useState(true)

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments-home'],
    queryFn: () => supabaseService.listTournaments().then((result) => result.data || []),
  })

  const activeTournamentId = tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || ''

  // Dynamic Ranking and Statistics
  const { data: rankingData } = useParticipantRanking(activeTournamentId)

  const topThree = useMemo(() => {
    if (!rankingData || rankingData.length === 0) {
      return [
        { position: 1, name: 'Cargando...', points: 0 },
        { position: 2, name: 'Cargando...', points: 0 },
        { position: 3, name: 'Cargando...', points: 0 },
      ]
    }
    return rankingData.slice(0, 3).map((r, index) => ({
      position: index + 1,
      name: r.full_name,
      points: r.total_points
    }))
  }, [rankingData])

  const stats = useMemo(() => {
    const totalTournaments = tournaments?.length || 1
    const totalParticipants = rankingData?.length || 0
    const totalPredictions = rankingData?.reduce((acc, curr) => acc + (curr.matches_predicted || 0), 0) || 0
    return { totalTournaments, totalParticipants, totalPredictions }
  }, [tournaments, rankingData])

  const { hasWon, nextMatch } = useColombiaStatus(activeTournamentId)
  const nextMatchDate = nextMatch?.match_date ? new Date(nextMatch.match_date) : null
  const countdown = useCountdown(nextMatchDate)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false)
      setConfettiActive(true)
    }, 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hasWon) setConfettiActive(true)
  }, [hasWon])

  // ─── Splash / Loading Screen ───
  if (appLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#00112f]">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(252,209,22,0.08)_0%,transparent_50%)]" />

        <motion.div
          animate={{
            rotate: 360,
            y: [0, -24, 0]
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 3, ease: "linear" },
            y: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
          }}
          className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #FCD116, #003893, #CE1126)',
            boxShadow: '0 0 60px rgba(252, 209, 22, 0.5), 0 0 120px rgba(252, 209, 22, 0.15)',
          }}
        >
          <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-white/20" />
          <span className="text-5xl">⚽</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-2xl md:text-3xl font-black text-white tracking-widest text-center"
        >
          POLLA FAMILIAR RINCÓN
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-mundialYellow uppercase tracking-[0.3em] mt-3 font-bold"
        >
          Mundial 2026
        </motion.p>

        <div className="w-60 h-1 bg-white/[0.06] rounded-full mt-8 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed rounded-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 md:space-y-8 pb-24 md:pb-20">
      <FloatingFootballs count={6} />
      <StadiumLights />
      <WorldCupParticles count={20} />
      <ColombiaConfetti active={confettiActive} duration={7000} onEnd={() => setConfettiActive(false)} />

      {/* ─── Hero Section ─── */}
      <motion.div
        className="relative z-10 overflow-hidden rounded-2xl md:rounded-3xl border border-mundialYellow/20 glass-card p-6 md:p-10 lg:p-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <HeroPattern />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed" />

        <motion.div
          className="relative z-10 max-w-2xl space-y-4 md:space-y-5"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeInUp} className="text-[11px] md:text-sm font-bold uppercase tracking-[0.3em] text-mundialYellow/80">
            Bienvenido a
          </motion.p>
          <motion.h1 variants={fadeInUp} className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-white">
            Polla Mundialista
            <br />
            <span className="text-gradient-tricolor">
              Familiar Rincon
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-sm md:text-lg leading-relaxed text-slate-300/80 max-w-lg">
            Pronostica los partidos, compite con tu familia y celebra tus aciertos. Ingresa con tu celular para acceder a tus pronósticos.
          </motion.p>
          <motion.div variants={fadeInUp} className="pt-2 md:pt-4 max-w-sm">
            {participant ? (
              <Link to="/dashboard">
                <Button size="lg" glow className="w-full gap-3">
                  <AnimatedBall /> Ir a Mis Pronósticos
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button size="lg" glow className="w-full gap-3">
                  <AnimatedBall /> REGISTRA TUS PRONÓSTICOS
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ─── Colombia Countdown ─── */}
      {nextMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
          className="relative z-10 overflow-hidden rounded-2xl md:rounded-3xl border border-mundialYellow/25 glass-card"
        >
          <div className="h-1.5 bg-gradient-to-r from-[#FCD116] via-[#003893] to-[#CE1126]" />
          <div className="space-y-4 p-5 md:p-6">
            <div className="flex items-center gap-4">
              <ColombiaFlagMark />
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-mundialYellow/80">
                  Próximo partido Colombia
                </p>
                <p className="text-base md:text-lg font-bold text-white truncate">
                  {nextMatch.home_team?.name || 'Por definir'} vs {nextMatch.away_team?.name || 'Por definir'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
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
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {[
                { label: 'Días', value: countdown.days },
                { label: 'Horas', value: countdown.hours },
                { label: 'Min', value: countdown.minutes },
                { label: 'Seg', value: countdown.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2.5 md:p-3 text-center">
                  <p className="tabular-nums text-xl md:text-2xl font-black text-mundialYellow">
                    {String(value).padStart(2, '0')}
                  </p>
                  <p className="mt-0.5 text-[9px] md:text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Stats Grid ─── */}
      <motion.div
        className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        variants={staggerContainer(0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          { label: 'Torneos activos', value: String(stats.totalTournaments), icon: Trophy },
          { label: 'Participantes', value: String(stats.totalParticipants), icon: Users },
          { label: 'Pronósticos', value: String(stats.totalPredictions), icon: BarChart3 },
          { label: 'Podio en vivo', value: 'Top 3', icon: Medal },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="glass-card glass-card-hover rounded-2xl p-4 text-center cursor-default"
          >
            <stat.icon className="mx-auto h-5 w-5 text-mundialYellow/70" />
            <p className="mt-2.5 text-[10px] md:text-xs uppercase tracking-wider text-slate-500 font-semibold">{stat.label}</p>
            <p className="mt-1.5 text-xl md:text-2xl font-black text-gradient-gold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Podium ─── */}
      <Card variant="glass" className="relative z-10 w-full">
        <motion.div className="space-y-4 md:space-y-6" variants={staggerContainer(0.15)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-mundialYellow/80">Clasificación general</p>
            <h2 className="mt-1 text-xl md:text-2xl font-black text-white">Top 3 del torneo</h2>
          </div>
          <Podium top3={topThree} />
        </motion.div>
      </Card>

      {/* ─── Features ─── */}
      <motion.div className="relative z-10 grid gap-3 md:gap-4 md:grid-cols-3" variants={staggerContainer(0.08)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {[
          { icon: CalendarClock, title: 'Pronostica fácil', desc: 'Ingresa con tu celular y marca el resultado de cada partido.' },
          { icon: Users, title: 'Compite en familia', desc: 'Sigue el ranking y celebra cada acierto en tiempo real.' },
          { icon: Sparkles, title: 'Gana puntos', desc: 'Los marcadores exactos y tendencias suman distinto puntaje.' },
        ].map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className="glass-card glass-card-hover rounded-2xl p-5 md:p-6 text-center cursor-default"
          >
            <div className="mx-auto mb-3 md:mb-4 w-12 h-12 rounded-xl bg-mundialYellow/10 flex items-center justify-center">
              <feature.icon className="h-6 w-6 text-mundialYellow" />
            </div>
            <p className="mb-1.5 font-bold text-white text-sm md:text-base">{feature.title}</p>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
