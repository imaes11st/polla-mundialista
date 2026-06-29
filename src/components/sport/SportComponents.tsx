import { motion } from 'framer-motion'
import { Medal, TeamFlag } from '../decorative/Decorations'
import { Card } from '../ui/Card'
import { colors, gradients } from '../../design/tokens'
import { staggerContainer, itemVariants, popIn, countUp } from '../../design/animations'
import React from 'react'

export function formatStage(stage: string): string {
  if (!stage) return ''
  const upper = stage.toUpperCase()
  if (upper.startsWith('GROUP_') || upper.startsWith('GROUP ')) {
    return stage.replace(/GROUP_STAGE/i, 'Fase de Grupos')
                .replace(/GROUP_/i, 'Grupo ')
                .replace(/GROUP /i, 'Grupo ')
  }
  switch (upper) {
    case 'GROUP_STAGE': return 'Fase de Grupos'
    case 'ROUND_OF_32':
    case 'LAST_32': return 'Dieciseisavos de Final'
    case 'ROUND_OF_16':
    case 'LAST_16': return 'Octavos de Final'
    case 'QUARTER_FINALS': return 'Cuartos de Final'
    case 'SEMI_FINALS': return 'Semifinal'
    case 'THIRD_PLACE': return 'Tercer Puesto'
    case 'FINAL': return 'Final'
    default: return stage
  }
}

// ─── Crown SVG for 1st place ───
function GoldCrown() {
  return (
    <motion.svg
      viewBox="0 0 32 24"
      className="w-8 h-6"
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.6 }}
    >
      <path
        d="M2 20 L6 8 L12 14 L16 4 L20 14 L26 8 L30 20 Z"
        fill="url(#crownGradient)"
        stroke="#FCD116"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="crownGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FCD116" />
        </linearGradient>
      </defs>
      {/* Gems */}
      <circle cx="10" cy="18" r="1.5" fill="#CE1126" opacity="0.8" />
      <circle cx="16" cy="17" r="1.8" fill="#003893" opacity="0.8" />
      <circle cx="22" cy="18" r="1.5" fill="#CE1126" opacity="0.8" />
    </motion.svg>
  )
}

export function Podium({ top3 }: { top3: Array<{ position: number; name: string; points: number }> }) {
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  const podiumConfig: Record<number, { heightClass: string; barHeight: number; color: string; delay: number }> = {
    1: { heightClass: 'h-36 md:h-44', barHeight: 176, color: gradients.gold, delay: 0.3 },
    2: { heightClass: 'h-28 md:h-36', barHeight: 144, color: gradients.silver, delay: 0.15 },
    3: { heightClass: 'h-20 md:h-28', barHeight: 112, color: gradients.bronze, delay: 0.45 },
  }

  return (
    <motion.div
      className="flex items-end justify-center gap-3 md:gap-5 py-6 md:py-8"
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {podiumOrder.map((entry, idx) => {
        const pos = [2, 1, 3][idx]
        const config = podiumConfig[pos]

        return (
          <motion.div
            key={pos}
            variants={itemVariants}
            className="flex flex-col items-center gap-2"
          >
            {/* Crown or Medal */}
            {pos === 1 ? <GoldCrown /> : <Medal position={pos} />}

            {/* Name above bar */}
            <motion.p
              variants={popIn}
              className="text-[11px] md:text-xs font-bold text-white text-center max-w-[70px] md:max-w-[90px] truncate"
              title={entry.name}
            >
              {entry.name.split(' ')[0]}
            </motion.p>

            {/* Podium Bar */}
            <motion.div
              className={`${config.heightClass} w-[60px] md:w-[76px] rounded-t-2xl flex flex-col items-center justify-end p-2 md:p-3 relative overflow-hidden`}
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: 'auto', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 80, damping: 16, delay: config.delay }}
              style={{
                background: config.color,
                border: `1.5px solid rgba(255,255,255,0.15)`,
              }}
            >
              {/* Shimmer effect on gold */}
              {pos === 1 && (
                <div
                  className="absolute inset-0 animate-shimmer pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                    backgroundSize: '200% auto',
                  }}
                />
              )}

              {/* Position number */}
              <span className="text-[10px] md:text-xs font-black text-white/70 mb-1">{pos}°</span>

              {/* Points */}
              <motion.p
                variants={countUp}
                className="text-lg md:text-2xl font-black text-white drop-shadow-md"
              >
                {entry.points}
              </motion.p>
              <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-white/60 font-semibold">pts</span>
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
  actualHomeScore,
  actualAwayScore,
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
  actualHomeScore?: number | null
  actualAwayScore?: number | null
}) {
  const [homeScore, setHomeScore] = React.useState<number | string>(initialHomeScore ?? '')
  const [awayScore, setAwayScore] = React.useState<number | string>(initialAwayScore ?? '')
  const [justSaved, setJustSaved] = React.useState(false)

  React.useEffect(() => {
    setHomeScore(initialHomeScore ?? '')
    setAwayScore(initialAwayScore ?? '')
  }, [initialHomeScore, initialAwayScore])

  const isLive = status === 'live'
  const isFinished = status === 'finished'
  const hasStarted = new Date(matchDate).getTime() <= Date.now()
  const isPastButNotSynced = hasStarted && status === 'scheduled'

  const handleSave = () => {
    onSave(Number(homeScore || 0), Number(awayScore || 0))
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  return (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${isLive ? 'border-red-500/40' : disabled ? '' : 'glass-card-hover'
        }`}
      variants={itemVariants}
    >
      {/* Top status bar */}
      <div
        className={`h-1 ${isLive
            ? 'bg-red-500 animate-pulse'
            : isFinished
              ? 'bg-gradient-to-r from-slate-600 to-slate-700'
              : 'bg-gradient-to-r from-mundialYellow/60 via-mundialBlue/40 to-mundialRed/60'
          }`}
      />

      <div className={`p-4 md:p-5 space-y-4 ${disabled && !isFinished ? 'opacity-55' : ''}`}>
        {/* Header: date + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] md:text-xs text-slate-400 font-medium">
            {new Date(matchDate).toLocaleString('es-CO', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/Bogota',
            })}
          </span>

          <div className="flex items-center gap-2">
            {/* Points badge */}
            {isFinished && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`px-3 py-1 rounded-full text-xs font-black ${points !== undefined && points >= 3
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : points !== undefined && points > 0
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}
              >
                {points !== undefined ? `+${points} PTS` : '0 PTS'}
              </motion.span>
            )}

            {/* Status badge */}
            <motion.span
              animate={isLive ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
              className={`px-3 py-1 rounded-xl text-[10px] md:text-xs font-bold ${isLive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : isFinished
                    ? 'bg-slate-800/80 text-slate-500'
                    : isPastButNotSynced
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
                }`}
            >
              {isLive
                ? '🔴 EN VIVO'
                : isFinished
                  ? 'FINALIZADO'
                  : isPastButNotSynced
                    ? '⏳ ESPERANDO'
                    : formatStage(stage)}
            </motion.span>
          </div>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-2">
          {/* Home team */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <TeamFlag flagUrl={homeTeam.flagUrl} name={homeTeam.name} size="md" />
            <p className="text-sm font-semibold text-white truncate">{homeTeam.name}</p>
          </div>

          {/* VS divider */}
          <div className="flex-shrink-0 px-2">
            <span className="text-sm font-black text-mundialYellow/60">VS</span>
          </div>

          {/* Away team */}
          <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
            <p className="text-sm font-semibold text-white truncate text-right">{awayTeam.name}</p>
            <TeamFlag flagUrl={awayTeam.flagUrl} name={awayTeam.name} size="md" />
          </div>
        </div>

        {/* Actual score for finished matches */}
        {isFinished && actualHomeScore !== undefined && actualHomeScore !== null && actualAwayScore !== undefined && actualAwayScore !== null && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center mb-2">Resultado Final</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-semibold text-slate-400 truncate max-w-[80px] text-right flex-1">{homeTeam.name}</span>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-mundialYellow/10 border border-mundialYellow/25">
                <span className="text-xl font-black text-mundialYellow tabular-nums">{actualHomeScore}</span>
                <span className="text-sm font-bold text-mundialYellow/50">-</span>
                <span className="text-xl font-black text-mundialYellow tabular-nums">{actualAwayScore}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 truncate max-w-[80px] flex-1">{awayTeam.name}</span>
            </div>
          </div>
        )}

        {/* Score inputs — user prediction */}
        {isFinished && (
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Tu Pronóstico</p>
        )}
        <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
          <input
            type="number"
            min={0}
            max={20}
            placeholder="0"
            value={homeScore}
            disabled={disabled}
            onChange={(e) => setHomeScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="input-premium flex-1 w-14 rounded-xl px-2 py-2.5 text-center text-white text-lg font-black"
          />
          <div className="flex items-center px-1">
            <span className="text-mundialYellow/50 font-bold text-lg">—</span>
          </div>
          <input
            type="number"
            min={0}
            max={20}
            placeholder="0"
            value={awayScore}
            disabled={disabled}
            onChange={(e) => setAwayScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="input-premium flex-1 w-14 rounded-xl px-2 py-2.5 text-center text-white text-lg font-black"
          />
        </div>

        {/* Save button */}
        <motion.button
          whileHover={disabled ? {} : { scale: 1.015 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          disabled={disabled}
          onClick={handleSave}
          className={`relative w-full font-bold py-3 rounded-xl uppercase tracking-wider text-sm transition-all overflow-hidden ${disabled
              ? 'bg-white/[0.04] text-slate-600 cursor-not-allowed border border-white/[0.05]'
              : justSaved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-mundialYellow via-yellow-400 to-mundialYellow text-slate-950 shadow-glow-yellow'
            }`}
        >
          {/* Shimmer effect */}
          {!disabled && !justSaved && (
            <span
              className="absolute inset-0 animate-shimmer pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                backgroundSize: '200% auto',
              }}
              aria-hidden="true"
            />
          )}
          <span className="relative z-10">
            {disabled ? '🔒 Bloqueado' : justSaved ? '✓ ¡Guardado!' : 'Guardar Pronóstico'}
          </span>
        </motion.button>
      </div>
    </motion.div>
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
    <Card variant="glass" interactive>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 font-semibold">{title}</p>
          {icon && <span className="text-mundialYellow opacity-70">{icon}</span>}
        </div>
        <motion.p
          className="text-2xl md:text-3xl font-black text-gradient-gold"
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
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
    if (to <= from) return
    const interval = setInterval(() => {
      setCount((prev) => (prev < to ? Math.min(prev + 1, to) : to))
    }, (duration * 1000) / (to - from))
    return () => clearInterval(interval)
  }, [to, duration, from])

  return <motion.span className="font-black text-gradient-gold">{count}</motion.span>
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
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${isSelected
          ? 'bg-mundialYellow text-slate-950 shadow-glow-yellow'
          : 'glass-card hover:border-mundialYellow/20 text-white'
        }`}
    >
      {position && <Medal position={position} />}
      <span>{name}</span>
      {points !== undefined && <span className="text-xs opacity-70">({points}pts)</span>}
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
        className={`${sizeMap[size]} rounded-full object-cover shadow-md ring-1 ring-white/10`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://flagcdn.com/un.svg'
        }}
      />
    </motion.div>
  )
}