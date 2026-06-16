import { motion } from 'framer-motion'
import { Medal, TeamFlag } from '../decorative/Decorations'
import { Card } from '../ui/Card'
import { colors } from '../../design/tokens'
import { staggerContainer, itemVariants } from '../../design/animations'
import React from 'react'

export function Podium({ top3 }: { top3: Array<{ position: number; name: string; points: number }> }) {
  const heights = { 1: 'h-40', 2: 'h-32', 3: 'h-24' }
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <motion.div
      className="flex items-end justify-center gap-4 py-8"
      variants={staggerContainer(0.15)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {podiumOrder.map((entry, idx) => {
        const actualPosition = [2, 1, 3][idx]
        return (
          <motion.div key={actualPosition} variants={itemVariants} className="flex flex-col items-center gap-2">
            <Medal position={actualPosition} />
            <motion.div
              className={`${heights[actualPosition as keyof typeof heights]} w-20 rounded-t-3xl flex flex-col items-center justify-end p-4 text-center`}
              style={{
                background: `linear-gradient(180deg, ${[colors.primary.yellow, colors.primary.blue, colors.primary.red][actualPosition - 1]}, transparent)`,
                border: `2px solid ${[colors.primary.yellow, colors.primary.blue, colors.primary.red][actualPosition - 1]}`,
              }}
            >
              <p className="text-xs font-bold text-white">{entry.name}</p>
              <p className="text-lg font-bold text-white">{entry.points}</p>
            </motion.div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export function MatchCard({
  homeTeam,
  awayTeam,
  matchDate,
  stage,
  status,
  initialHomeScore = '',
  initialAwayScore = '',
  onSave,
  disabled = false,
  points,
}: {
  homeTeam: { name: string; flagUrl: string }
  awayTeam: { name: string; flagUrl: string }
  matchDate: string
  stage: string
  status: string
  initialHomeScore?: number | string | null
  initialAwayScore?: number | string | null
  onSave: (home: number, away: number) => void
  disabled?: boolean
  points?: number
}) {
  const [homeScore, setHomeScore] = React.useState<number | string>(initialHomeScore ?? '')
  const [awayScore, setAwayScore] = React.useState<number | string>(initialAwayScore ?? '')

  // 🔄 Sincronizar estado local cuando las props cambian (importante para carga asíncrona)
  React.useEffect(() => {
    setHomeScore(initialHomeScore ?? '')
    setAwayScore(initialAwayScore ?? '')
  }, [initialHomeScore, initialAwayScore])

  const isLive = status === 'live'
  const isFinished = status === 'finished'

  return (
    <Card variant="sport" interactive={!disabled}>
      {/* 🎨 Si está deshabilitado, aplicamos opacidad suave a toda la tarjeta */}
      <motion.div 
        className={`space-y-4 ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}`} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: (disabled && !isFinished) ? 0.6 : 1 }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">
            {new Date(matchDate).toLocaleString('es-CO', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <div className="flex items-center gap-2">
            {isFinished && points !== undefined && (
              <span className={`px-3 py-1 rounded-full text-xs font-black ${
                points >= 3 ? 'bg-green-500 text-white' : points > 0 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                +{points} PTS
              </span>
            )}
            <motion.span
              animate={isLive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isLive ? 'bg-red-500 text-white' : isFinished ? 'bg-slate-800 text-slate-400' : 'bg-white/10 text-slate-300'
              }`}
            >
              {isLive ? '🔴 EN VIVO' : isFinished ? 'FINALIZADO' : stage}
            </motion.span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <TeamFlag flagUrl={homeTeam.flagUrl} name={homeTeam.name} size="md" />
            <p className="text-sm font-semibold flex-1">{homeTeam.name}</p>
          </div>
          <span className="text-lg font-bold text-mundialYellow">vs</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <p className="text-sm font-semibold flex-1 text-right">{awayTeam.name}</p>
            <TeamFlag flagUrl={awayTeam.flagUrl} name={awayTeam.name} size="md" />
          </div>
        </div>

        <div className="flex gap-3 bg-white/5 rounded-2xl p-3">
          <input
            type="number"
            min={0}
            placeholder="0"
            value={homeScore}
            disabled={disabled} // 👈 Controla el input local
            onChange={(e) => setHomeScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1 w-16 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-center text-white text-lg font-bold outline-none focus:border-mundialYellow focus:ring-2 focus:ring-mundialYellow/25 disabled:bg-slate-900 disabled:text-slate-400 cursor-not-allowed"
          />
          <div className="flex items-center px-2 text-mundialYellow font-bold">-</div>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={awayScore}
            disabled={disabled} // 👈 Controla el input local
            onChange={(e) => setAwayScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1 w-16 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-center text-white text-lg font-bold outline-none focus:border-mundialYellow focus:ring-2 focus:ring-mundialYellow/25 disabled:bg-slate-900 disabled:text-slate-400 cursor-not-allowed"
          />
        </div>

        <motion.button
          whileHover={disabled ? {} : { scale: 1.02, boxShadow: `0 0 20px ${colors.primary.yellow}60` }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          disabled={disabled} // 👈 Bloquea la acción del botón
          onClick={() => onSave(Number(homeScore || 0), Number(awayScore || 0))}
          className={`w-full font-bold py-3 rounded-full uppercase tracking-widest text-sm transition ${
            disabled 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
              : 'bg-mundialYellow text-slate-950 hover:opacity-90'
          }`}
        >
          {disabled ? 'Pronóstico Bloqueado' : 'Guardar Pronóstico'}
        </motion.button>
      </motion.div>
    </Card>
  )
}

export function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down'
}) {
  return (
    <Card variant="dark" interactive>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400">{title}</p>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        <motion.p
          className="text-3xl font-bold text-mundialYellow"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
        >
          {value}
        </motion.p>
        {trend && (
          <p className={`text-xs font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑ Subiendo' : '↓ Bajando'}
          </p>
        )}
      </div>
    </Card>
  )
}

export function AnimatedCounter({ from = 0, to = 100, duration = 2 }) {
  const [count, setCount] = React.useState(from)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev < to ? Math.min(prev + 1, to) : to))
    }, (duration * 1000) / (to - from))
    return () => clearInterval(interval)
  }, [to, duration, from])

  return <motion.span className="font-bold text-mundialYellow">{count}</motion.span>
}

export function ParticipantChip({
  name,
  position,
  points,
  isSelected = false,
}: {
  name: string
  position?: number
  points?: number
  isSelected?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
        isSelected
          ? 'bg-mundialYellow text-slate-950 shadow-lg'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
      }`}
    >
      {position && <Medal position={position} />}
      <span>{name}</span>
      {points !== undefined && <span className="text-xs opacity-80">({points}pts)</span>}
    </motion.button>
  )
}

export function TeamLogo({
  flagUrl,
  name = 'team',
  size = 'md',
  animate = false,
}: {
  flagUrl: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }

  return (
    <motion.div
      animate={animate ? { rotateY: [0, 360, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <img
        src={flagUrl || 'https://flagcdn.com/un.svg'}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover shadow-md`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://flagcdn.com/un.svg'
        }}
      />
    </motion.div>
  )
}