import { useEffect, useState } from 'react'
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
import { fadeInUp, staggerContainer } from '../design/animations'
import { useColombiaStatus } from '../hooks/useColombiaStatus'
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
    <div className="h-11 w-16 overflow-hidden rounded-md border border-white/30 shadow-md" aria-hidden="true">
      <div className="h-1/2 bg-[#FCD116]" />
      <div className="h-1/4 bg-[#003893]" />
      <div className="h-1/4 bg-[#CE1126]" />
    </div>
  )
}

export function HomePage() {
  const [confettiActive, setConfettiActive] = useState(false)

  const topThree = [
    { position: 1, name: 'Ana Torres', points: 42 },
    { position: 2, name: 'Carlos Rincon', points: 36 },
    { position: 3, name: 'Maria Perez', points: 30 },
  ]

  const { data: tournaments } = useQuery({
    queryKey: ['tournaments-home'],
    queryFn: () => supabaseService.listTournaments().then((result) => result.data || []),
  })

  const activeTournamentId = tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || ''
  const { hasWon, nextMatch } = useColombiaStatus(activeTournamentId)
  const nextMatchDate = nextMatch?.match_date ? new Date(nextMatch.match_date) : null
  const countdown = useCountdown(nextMatchDate)

  useEffect(() => {
    if (hasWon) setConfettiActive(true)
  }, [hasWon])

  return (
    <div className="relative space-y-6 pb-20">
      <FloatingFootballs count={10} />
      <StadiumLights />
      <WorldCupParticles count={54} />
      <ColombiaConfetti active={confettiActive} duration={7000} onEnd={() => setConfettiActive(false)} />

      <motion.div
        className="relative z-10 overflow-hidden rounded-3xl border border-mundialYellow/30 bg-slate-950/88 p-7 shadow-2xl backdrop-blur-sm md:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed" />
        <motion.div
          className="relative z-10 max-w-2xl space-y-4"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeInUp} className="text-sm font-semibold uppercase tracking-[0.3em] text-mundialYellow">
            Bienvenido a
          </motion.p>
          <motion.h1 variants={fadeInUp} className="text-4xl font-black leading-tight text-white md:text-5xl">
            Polla Mundialista
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-mundialYellow via-sky-300 to-mundialRed">
              Familiar Rincon
            </span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-slate-300">
            Pronostica los partidos, compite con tu familia y celebra tus aciertos. Ingresa con tu celular:
            futbol, ranking y puntos en un solo lugar.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Link to="/dashboard" className="flex-1">
              <Button size="lg" className="w-full">
                <AnimatedBall /> Ir a Mis Pronósticos
              </Button>
            </Link>
            <Link to="/ranking" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                <Trophy className="h-5 w-5" /> Ver Ranking
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {nextMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 overflow-hidden rounded-3xl border border-mundialYellow/35 bg-slate-950/72 backdrop-blur-sm"
        >
          <div className="h-2 bg-gradient-to-r from-[#FCD116] via-[#003893] to-[#CE1126]" />
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <ColombiaFlagMark />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-mundialYellow">
                  Proximo partido Colombia
                </p>
                <p className="text-lg font-bold text-white">
                  {nextMatch.home_team?.name || 'Por definir'} vs {nextMatch.away_team?.name || 'Por definir'}
                </p>
                <p className="text-xs text-slate-400">
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
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Dias', value: countdown.days },
                { label: 'Horas', value: countdown.hours },
                { label: 'Min', value: countdown.minutes },
                { label: 'Seg', value: countdown.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-mundialYellow/20 bg-white/[0.06] p-3 text-center">
                  <motion.p
                    key={value}
                    initial={{ scale: 1.12, opacity: 0.72 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="tabular-nums text-2xl font-black text-mundialYellow"
                  >
                    {String(value).padStart(2, '0')}
                  </motion.p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4"
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {[
          { label: 'Torneos activos', value: '3', icon: Trophy },
          { label: 'Participantes', value: '15', icon: Users },
          { label: 'Pronosticos hoy', value: '42', icon: BarChart3 },
          { label: 'Podio en vivo', value: 'Top 3', icon: Medal },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-sm">
            <stat.icon className="mx-auto h-5 w-5 text-mundialYellow" />
            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-mundialYellow">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <Card variant="sport" className="relative z-10 w-full">
        <motion.div className="space-y-6" variants={staggerContainer(0.15)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-mundialYellow">Clasificacion general</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Top 3 del torneo</h2>
          </div>
          <Podium top3={topThree} />
        </motion.div>
      </Card>

      <motion.div className="relative z-10 grid gap-4 md:grid-cols-3" variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        {[
          { icon: CalendarClock, title: 'Pronostica facil', desc: 'Ingresa con tu celular y marca el resultado de cada partido.' },
          { icon: Users, title: 'Compite en familia', desc: 'Sigue el ranking y celebra cada acierto en tiempo real.' },
          { icon: Sparkles, title: 'Gana puntos', desc: 'Los marcadores exactos y tendencias suman distinto puntaje.' },
        ].map((feature) => (
          <motion.div key={feature.title} variants={fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center backdrop-blur-sm transition hover:bg-white/[0.1]">
            <feature.icon className="mx-auto mb-4 h-9 w-9 text-mundialYellow" />
            <p className="mb-2 font-bold text-white">{feature.title}</p>
            <p className="text-sm text-slate-400">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
