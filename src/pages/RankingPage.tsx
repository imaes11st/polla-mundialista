import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { RankingTable } from '../components/RankingTable'
import { Podium } from '../components/sport/SportComponents'
import { staggerContainer, itemVariants } from '../design/animations'
import { useParticipantRanking } from '../hooks/useScoringCalculator'
import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '../services/supabase'

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
      className="space-y-6"
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="visible"
    >
      <Card variant="sport" interactive>
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-mundialYellow font-bold">Clasificación</p>
          <h1 className="text-3xl font-black text-white">¿Quién lidera?</h1>
          <p className="text-slate-300">Sigue el progreso de todos los participantes en tiempo real.</p>
        </motion.div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 border-4 border-mundialYellow border-t-transparent rounded-full animate-spin" />
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
          <motion.div variants={itemVariants} className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-mundialYellow font-bold">Tabla completa</p>
              <h2 className="text-2xl font-bold text-white mt-1">Todos los participantes</h2>
            </div>
            {formattedRanking.length > 0 ? (
              <RankingTable rows={formattedRanking} />
            ) : (
              <p className="text-center py-10 text-slate-400">Aún no hay puntos registrados.</p>
            )}
          </motion.div>
        </>
      )}

      {/* Otras estadísticas (ahora estáticas pero con contexto real si se desea expandir) */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {ranking.length > 0 && (
          <>
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-mundialYellow/20 bg-gradient-to-br from-slate-950 to-slate-900 p-6"
            >
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Mayor cantidad de exactos</p>
              <p className="text-2xl font-bold text-mundialYellow mt-2">{ranking[0].full_name}</p>
              <p className="text-sm text-slate-400 mt-1">{ranking[0].exact_predictions} aciertos</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-mundialYellow/20 bg-gradient-to-br from-slate-950 to-slate-900 p-6"
            >
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Participante más constante</p>
              <p className="text-2xl font-bold text-mundialYellow mt-2">{ranking[0].full_name}</p>
              <p className="text-sm text-slate-400 mt-1">{ranking[0].matches_predicted} partidos pronosticados</p>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
