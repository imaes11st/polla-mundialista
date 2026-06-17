import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { RankingTable } from '../components/RankingTable'
import { Podium } from '../components/sport/SportComponents'
import { staggerContainer, itemVariants } from '../design/animations'
import { useParticipantRanking } from '../hooks/useScoringCalculator'
import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'
import { Trophy, Target } from 'lucide-react'

export function RankingPage() {
  const { data: tournaments } = useQuery({
    queryKey: ['tournaments-ranking'],
    queryFn: () => supabaseService.listTournaments().then((r) => r.data || []),
  })
  
  const activeTournamentId = tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || ''
  const { data: ranking = [], isLoading } = useParticipantRanking(activeTournamentId)

  // Adaptar datos del ranking para los componentes
  const formattedRanking = ranking.map(r => ({
    position: r.rank,
    name: r.full_name,
    points: r.total_points
  }))

  return (
    <motion.div
      className="space-y-5 md:space-y-6 pb-24 md:pb-8"
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <Card variant="glass">
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-mundialYellow/70 font-bold">Clasificación</p>
          <h1 className="text-2xl md:text-3xl font-black text-white">¿Quién lidera? 🏆</h1>
          <p className="text-xs md:text-sm text-slate-400">Sigue el progreso de todos los participantes en tiempo real.</p>
        </motion.div>
      </Card>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-10 w-10 border-3 border-mundialYellow border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Calculando ranking...</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {formattedRanking.length > 0 && (
            <motion.div variants={itemVariants}>
              <Podium top3={formattedRanking.slice(0, 3)} />
            </motion.div>
          )}

          {/* Full ranking */}
          <motion.div variants={itemVariants} className="space-y-3 md:space-y-4">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-mundialYellow/70 font-bold">Tabla completa</p>
              <h2 className="text-lg md:text-2xl font-bold text-white mt-1">Todos los participantes</h2>
            </div>
            {formattedRanking.length > 0 ? (
              <RankingTable rows={formattedRanking} />
            ) : (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm text-slate-400">Aún no hay puntos registrados.</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Stats */}
      {ranking.length > 0 && (
        <motion.div
          className="grid md:grid-cols-2 gap-3 md:gap-4"
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-mundialYellow/10 p-2.5 flex-shrink-0">
                <Trophy className="h-5 w-5 text-mundialYellow" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">Mayor exactos</p>
                <p className="text-lg md:text-xl font-black text-gradient-gold mt-1 truncate">{ranking[0].full_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ranking[0].exact_predictions} aciertos exactos</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="glass-card glass-card-hover rounded-2xl p-5 md:p-6"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-mundialYellow/10 p-2.5 flex-shrink-0">
                <Target className="h-5 w-5 text-mundialYellow" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">Más constante</p>
                <p className="text-lg md:text-xl font-black text-gradient-gold mt-1 truncate">{ranking[0].full_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ranking[0].matches_predicted} partidos pronosticados</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
