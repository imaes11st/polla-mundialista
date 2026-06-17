import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabaseService } from '../../services/supabase'

export function AdminMatches() {
  const [syncing, setSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

  // 1. Obtener torneos para saber cuál es el activo
  const { data: tournaments } = useQuery({
    queryKey: ['tournaments-admin-matches'],
    queryFn: () => supabaseService.listTournaments().then((res) => res.data || []),
  })

  const activeTournamentId = useMemo(() => 
    tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || '',
    [tournaments]
  )

  // 2. Obtener partidos de Supabase
  const { data: dbMatches = [] } = useQuery({
    queryKey: ['admin-matches-list', activeTournamentId],
    queryFn: () => supabaseService.listAllMatches(activeTournamentId).then((res) => res.data || []),
    enabled: !!activeTournamentId,
  })

  // 3. Calcular estadísticas en tiempo real
  const stats = useMemo(() => {
    const total = dbMatches.length
    const finished = dbMatches.filter((m: any) => m.status === 'finished').length
    const scheduled = dbMatches.filter((m: any) => m.status === 'scheduled' || m.status === 'live').length
    return { total, finished, scheduled }
  }, [dbMatches])

  const handleSync = async () => {
    setSyncing(true)
    setLastResult(null)
    try {
      const { data, error } = await supabaseService.syncMatches()
      if (error) throw error
      
      const syncedCount = data && typeof data === 'object' && 'synced' in data ? (data as any).synced : 0;
      setLastResult({ 
        success: true, 
        message: `Sincronización exitosa: ${syncedCount} partidos procesados.` 
      })
    } catch (err: any) {
      console.error('Error syncing matches:', err)
      setLastResult({ 
        success: false, 
        message: `Error al sincronizar: ${err.message || 'Error desconocido'}` 
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚽</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Sincronizar Partidos</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Obtén automáticamente todos los partidos de la temporada desde la API deportiva.
                </p>
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="gap-2"
                >
                  <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                </Button>

                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`mt-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                      lastResult.success
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {lastResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {lastResult.message}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📋</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Estado de Sincronización</h3>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Total Partidos</p>
                    <p className="text-3xl font-bold text-mundialYellow">{stats.total}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Completados</p>
                    <p className="text-3xl font-bold text-green-400">{stats.finished}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Programados</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.scheduled}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-400 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-amber-400 mb-1">Información</h4>
              <p className="text-sm text-amber-200">
                La sincronización se ejecuta automáticamente cada hora. Los cambios de resultados se
                actualizan cada 30 minutos.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
