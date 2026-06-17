import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useParticipant } from '../contexts/ParticipantContext'

// Sub-pages
import { AdminParticipants } from '../components/admin/AdminParticipants'
import { AdminTournaments } from '../components/admin/AdminTournaments'
import { AdminMatches } from '../components/admin/AdminMatches'
import { AdminResults } from '../components/admin/AdminResults'
import { AdminStatistics } from '../components/admin/AdminStatistics'

const ADMIN_PHONE = '3024410621'

type AdminTab = 'participants' | 'tournaments' | 'matches' | 'results' | 'statistics'

export function AdminPage() {
  const { participant } = useParticipant()
  const [activeTab, setActiveTab] = useState<AdminTab>('participants')

  // Block access if not the admin
  const isAdmin = participant?.phone_number?.replace(/\D/g, '').endsWith(ADMIN_PHONE)

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <p className="text-5xl">🔒</p>
        <h2 className="text-2xl font-black text-white">Acceso Restringido</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Solo el administrador puede acceder a este panel.
        </p>
        <Link to="/">
          <Button variant="secondary" size="sm">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  const tabs: {
    id: AdminTab
    label: string
    icon: string
    color: string
    description: string
  }[] = [
    {
      id: 'participants',
      label: 'Participantes',
      icon: '👥',
      color: 'from-blue-500 to-cyan-500',
      description: 'Gestiona participantes',
    },
    {
      id: 'tournaments',
      label: 'Torneos',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500',
      description: 'Crea y edita torneos',
    },
    {
      id: 'matches',
      label: 'Partidos',
      icon: '⚽',
      color: 'from-green-500 to-emerald-500',
      description: 'Sincroniza partidos',
    },
    {
      id: 'results',
      label: 'Resultados',
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
      description: 'Registra resultados',
    },
    {
      id: 'statistics',
      label: 'Estadísticas',
      icon: '📈',
      color: 'from-indigo-500 to-blue-500',
      description: 'Panel de análisis',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-mundialYellow">
            🛡️ Panel Administrador
          </p>
          <h1 className="text-4xl font-black text-white">Control Central Mundialista</h1>
          <p className="text-slate-400">
            Gestión completa de participantes, torneos, partidos y resultados del campeonato.
          </p>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative p-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-br ' + tab.color + ' text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-xs font-semibold text-center">{tab.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-[600px]"
      >
        {activeTab === 'participants' && <AdminParticipants />}
        {activeTab === 'tournaments' && <AdminTournaments />}
        {activeTab === 'matches' && <AdminMatches />}
        {activeTab === 'results' && <AdminResults />}
        {activeTab === 'statistics' && <AdminStatistics />}
      </motion.div>
    </div>
  )
}
