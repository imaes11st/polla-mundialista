import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'

// ============================================================================
// EVENT BADGE - Notificación de eventos especiales
// ============================================================================

interface EventBadgeProps {
  type: 'leader' | 'colombia-win' | 'record' | 'milestone'
  message: string
  participantName?: string
  onClose: () => void
}

export function EventBadge({ type, message, participantName, onClose }: EventBadgeProps) {
  const icons = {
    leader: '🚀',
    'colombia-win': '🇨🇴',
    record: '⭐',
    milestone: '🏆',
  }

  const colors = {
    leader: 'from-purple-500 to-pink-500',
    'colombia-win': 'from-mundialYellow to-mundialBlue',
    record: 'from-cyan-500 to-blue-500',
    milestone: 'from-yellow-500 to-orange-500',
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`fixed top-6 right-6 z-50 bg-gradient-to-r ${colors[type]} rounded-2xl shadow-2xl overflow-hidden max-w-sm`}
      onMouseLeave={() => setTimeout(onClose, 3000)}
    >
      <div className="px-6 py-4 backdrop-blur-sm bg-black/30">
        <div className="flex items-start gap-4">
          <motion.div
            className="text-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
          >
            {icons[type]}
          </motion.div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{message}</h3>
            {participantName && (
              <p className="text-white/80 text-sm">🎯 {participantName}</p>
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="h-1 bg-gradient-to-r from-white/50 to-transparent"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4 }}
      />
    </motion.div>
  )
}

// ============================================================================
// SPECIAL QUESTION CARD
// ============================================================================

interface SpecialQuestionCardProps {
  question: string
  type: 'team' | 'player' | 'text'
  points: number
  answered?: boolean
  answer?: string
  onAnswer: (value: string) => void
  teams?: Array<{ id: string; name: string }>
}

export function SpecialQuestionCard({
  question,
  type,
  points,
  answered,
  answer: initialAnswer,
  onAnswer,
  teams = [],
}: SpecialQuestionCardProps) {
  const [localAnswer, setLocalAnswer] = React.useState(initialAnswer || '')

  React.useEffect(() => {
    setLocalAnswer(initialAnswer || '')
  }, [initialAnswer])

  const isDuel = question.toLowerCase().includes('messi') && question.toLowerCase().includes('ronaldo')

  const handleSave = () => {
    if (localAnswer.trim()) {
      onAnswer(localAnswer.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-mundialYellow/20 p-6 hover:border-mundialYellow/50 transition-colors shadow-lg"
    >
      {/* Points badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-mundialYellow to-orange-500 rounded-full px-4 py-2 shadow-md">
        <span className="font-bold text-slate-900 text-xs">+{points} pts</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-bold text-white mb-4 pr-24 leading-snug">{question}</h3>

      {/* Answer input based on type */}
      {!answered ? (
        <div className="space-y-4">
          {isDuel ? (
            <div className="grid grid-cols-2 gap-3">
              {['Messi', 'Cristiano Ronaldo'].map((player) => (
                <motion.button
                  key={player}
                  type="button"
                  onClick={() => onAnswer(player)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="py-3 px-4 bg-slate-700 hover:bg-mundialYellow hover:text-slate-900 text-white rounded-xl transition-all font-bold text-sm tracking-wide border border-white/5"
                >
                  {player}
                </motion.button>
              ))}
            </div>
          ) : type === 'team' ? (
            <div className="space-y-3">
              <select
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-mundialYellow focus:border-mundialYellow font-semibold"
              >
                <option value="" disabled>Selecciona un equipo...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <Button onClick={handleSave} disabled={!localAnswer} className="w-full py-2.5 text-sm font-bold">
                Guardar Selección
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {type === 'player' ? (
                <input
                  type="text"
                  placeholder="Nombre del jugador..."
                  value={localAnswer}
                  onChange={(e) => setLocalAnswer(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border border-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mundialYellow font-medium"
                />
              ) : (
                <textarea
                  placeholder="Tu respuesta..."
                  value={localAnswer}
                  onChange={(e) => setLocalAnswer(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-xl border border-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mundialYellow resize-none font-medium"
                />
              )}
              <Button onClick={handleSave} disabled={!localAnswer.trim()} className="w-full py-2.5 text-sm font-bold">
                Guardar Respuesta
              </Button>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
            <span>✅ Respuesta Guardada</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Tu respuesta:</p>
            <p className="font-bold text-white text-lg mt-0.5">{initialAnswer}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================================
// MATCH RESULT CARD
// ============================================================================

interface MatchResultCardProps {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  homeFlag?: string
  awayFlag?: string
  prediction?: {
    home: number
    away: number
    points: number
  }
}

export function MatchResultCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homeFlag,
  awayFlag,
  prediction,
}: MatchResultCardProps) {
  const wasExact = prediction && prediction.home === homeScore && prediction.away === awayScore

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-4 overflow-hidden"
    >
      {wasExact && (
        <motion.div
          className="absolute top-0 right-0 bg-gradient-to-r from-mundialYellow to-orange-500 text-slate-900 font-bold text-sm px-3 py-1 rounded-bl-lg"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ✅ EXACTO +{prediction.points}
        </motion.div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex-1 text-center">
          {homeFlag && (
            <img src={homeFlag} alt={homeTeam} className="w-12 h-8 mx-auto mb-2 rounded" />
          )}
          <p className="text-sm text-slate-400">{homeTeam}</p>
          <motion.p
            className="text-2xl font-bold text-mundialYellow"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {homeScore}
          </motion.p>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center">
          <p className="text-slate-500 text-xs font-semibold">FINAL</p>
          <p className="text-lg text-slate-400">-</p>
        </div>

        {/* Away team */}
        <div className="flex-1 text-center">
          {awayFlag && (
            <img src={awayFlag} alt={awayTeam} className="w-12 h-8 mx-auto mb-2 rounded" />
          )}
          <p className="text-sm text-slate-400">{awayTeam}</p>
          <motion.p
            className="text-2xl font-bold text-mundialYellow"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {awayScore}
          </motion.p>
        </div>
      </div>

      {prediction && (
        <motion.div
          className="mt-3 pt-3 border-t border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-slate-400 mb-2">Tu pronóstico:</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">
              {prediction.home} - {prediction.away}
            </span>
            <span className={`text-sm font-bold px-2 py-1 rounded ${
              wasExact
                ? 'bg-green-500/20 text-green-400'
                : 'bg-slate-700/50 text-slate-300'
            }`}>
              +{prediction.points} pts
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ============================================================================
// STATS SUMMARY
// ============================================================================

interface Stats {
  label: string
  value: number | string
  icon: string
  color: string
}

interface StatsSummaryProps {
  stats: Stats[]
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 relative overflow-hidden group`}
        >
          {/* Background glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" />

          <div className="relative z-10">
            <p className="text-sm text-white/70 mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl">{stat.icon}</span>
              <motion.span
                className="text-2xl md:text-3xl font-black text-white"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stat.value}
              </motion.span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
