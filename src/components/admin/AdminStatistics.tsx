import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { BarChart, TrendingUp, Users, Target } from 'lucide-react'

export function AdminStatistics() {
  const stats = [
    {
      label: 'Total Participantes',
      value: 15,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+3 esta semana',
    },
    {
      label: 'Partidos Completados',
      value: 12,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: '+2 hoy',
    },
    {
      label: 'Pronósticos Totales',
      value: 180,
      icon: BarChart,
      color: 'from-yellow-500 to-orange-500',
      change: '+48 hoy',
    },
    {
      label: 'Exactos Predichos',
      value: 34,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+12 hoy',
    },
  ]

  const topParticipants = [
    { position: 1, name: 'Ana Torres', points: 42, exactos: 8 },
    { position: 2, name: 'Carlos Rincón', points: 36, exactos: 6 },
    { position: 3, name: 'María Pérez', points: 30, exactos: 5 },
  ]

  const topScorers = [
    { team: 'Colombia', scored: 5, predictions: 12, accuracy: 42 },
    { team: 'Argentina', scored: 4, predictions: 10, accuracy: 40 },
    { team: 'Brasil', scored: 4, predictions: 8, accuracy: 50 },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${stat.color}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/70 mb-2">{stat.label}</p>
                    <p className="text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-white/60 mt-2">{stat.change}</p>
                  </div>
                  <Icon className="text-white/30" size={40} />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Rankings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Participants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">🏆 Top Participantes</h3>
            <div className="space-y-3">
              {topParticipants.map((p) => (
                <div key={p.position} className="flex items-center gap-3 pb-3 border-b border-slate-700 last:border-0">
                  <div className="text-2xl font-black text-mundialYellow w-8 text-center">
                    {p.position === 1 ? '🥇' : p.position === 2 ? '🥈' : '🥉'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.exactos} exactos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-mundialYellow">{p.points}</p>
                    <p className="text-xs text-slate-400">pts</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">⚽ Equipos Predichos</h3>
            <div className="space-y-3">
              {topScorers.map((team) => (
                <div key={team.team} className="pb-3 border-b border-slate-700 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-white">{team.team}</p>
                    <span className="bg-mundialYellow/20 text-mundialYellow px-2 py-1 rounded text-xs font-bold">
                      {team.accuracy}% aciertos
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-mundialYellow to-mundialRed"
                        initial={{ width: 0 }}
                        animate={{ width: `${team.accuracy}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      {team.scored}/{team.predictions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <h4 className="font-semibold text-white">Sistema Operativo</h4>
              <p className="text-sm text-slate-400">
                Última sincronización: hace 5 minutos • Próxima: en 55 minutos
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
