import { motion } from 'framer-motion'
import { staggerContainer, itemVariants } from '../design/animations'
import { useParticipant } from '../contexts/ParticipantContext'

const MEDAL_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40', text: 'text-yellow-400', icon: '🥇' },
  2: { bg: 'from-slate-300/15 to-slate-400/8 border-slate-400/30', text: 'text-slate-300', icon: '🥈' },
  3: { bg: 'from-orange-600/15 to-orange-700/8 border-orange-600/30', text: 'text-orange-400', icon: '🥉' },
}

export function RankingTable({ rows }: { rows: Array<{ position: number; name: string; points: number }> }) {
  const { participant } = useParticipant()

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/60 shadow-glass backdrop-blur-glass"
      variants={staggerContainer(0.04)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="grid grid-cols-[48px_1fr_80px] md:grid-cols-[60px_1fr_100px] gap-3 border-b border-white/[0.08] bg-white/[0.03] px-4 md:px-5 py-3.5 text-[10px] md:text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">
        <span className="text-center">#</span>
        <span>Participante</span>
        <span className="text-center">Puntos</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {rows.map((row) => {
          const medal = MEDAL_STYLES[row.position]
          const isCurrentUser = participant?.full_name === row.name

          return (
            <motion.div
              key={row.position}
              variants={itemVariants}
              className={`grid grid-cols-[48px_1fr_80px] md:grid-cols-[60px_1fr_100px] gap-3 items-center px-4 md:px-5 py-3.5 transition-colors duration-200 ${
                isCurrentUser
                  ? 'bg-mundialYellow/[0.08] border-l-2 border-l-mundialYellow'
                  : medal
                    ? `bg-gradient-to-r ${medal.bg} border-l-2`
                    : 'hover:bg-white/[0.03]'
              }`}
            >
              {/* Position */}
              <span className="text-center">
                {medal ? (
                  <span className="text-lg">{medal.icon}</span>
                ) : (
                  <span className="text-sm font-bold text-slate-400">{row.position}</span>
                )}
              </span>

              {/* Name */}
              <span className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-mundialYellow' : 'text-slate-100'}`}>
                {row.name}
                {isCurrentUser && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider bg-mundialYellow/20 text-mundialYellow px-2 py-0.5 rounded-full font-black">
                    Tú
                  </span>
                )}
              </span>

              {/* Points */}
              <span className={`text-center text-sm font-black ${medal?.text || 'text-white'}`}>
                {row.points}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
