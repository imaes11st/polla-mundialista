import { motion } from 'framer-motion'

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
}

export function SpecialQuestionCard({
  question,
  type,
  points,
  answered,
  answer: initialAnswer,
  onAnswer,
}: SpecialQuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-mundialYellow/20 p-6 hover:border-mundialYellow/50 transition-colors"
    >
      {/* Points badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-mundialYellow to-orange-500 rounded-full px-4 py-2">
        <span className="font-bold text-slate-900 text-sm">+{points} pts</span>
      </div>

      {/* Question */}
      <h3 className="text-lg font-bold text-white mb-4 pr-20">{question}</h3>

      {/* Answer input based on type */}
      {!answered ? (
        <div className="space-y-3">
          {type === 'team' && (
            <div className="grid grid-cols-2 gap-2">
              {['Colombia', 'Argentina', 'Brasil', 'México'].map((team) => (
                <motion.button
                  key={team}
                  onClick={() => onAnswer(team)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-3 bg-slate-700 hover:bg-mundialYellow hover:text-slate-900 text-white rounded-lg transition-colors font-semibold"
                >
                  {team}
                </motion.button>
              ))}
            </div>
          )}

          {type === 'player' && (
            <input
              type="text"
              placeholder="Nombre del jugador..."
              onChange={(e) => onAnswer(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mundialYellow"
            />
          )}

          {type === 'text' && (
            <textarea
              placeholder="Tu respuesta..."
              onChange={(e) => onAnswer(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mundialYellow resize-none"
            />
          )}
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm text-slate-300">Tu respuesta:</p>
              <p className="font-semibold text-white">{initialAnswer}</p>
            </div>
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
