import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Edit2, Check } from 'lucide-react'

interface Tournament {
  id: string
  name: string
  year: number
  start_date: string
  end_date: string
  is_active: boolean
}

export function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Copa América 2024',
      year: 2024,
      start_date: '2024-06-20',
      end_date: '2024-07-14',
      is_active: true,
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
  })

  const handleAddTournament = () => {
    if (formData.name.trim() && formData.start_date && formData.end_date) {
      const newTournament: Tournament = {
        id: Date.now().toString(),
        ...formData,
        is_active: true,
      }
      setTournaments([...tournaments, newTournament])
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
      })
      setShowForm(false)
    }
  }

  const toggleActive = (id: string) => {
    setTournaments(
      tournaments.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
    )
  }

  const handleDeleteTournament = (id: string) => {
    setTournaments(tournaments.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Button onClick={() => setShowForm(!showForm)} className="gap-2">
        <Plus size={18} />
        Crear Torneo
      </Button>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-mundialYellow/20"
        >
          <h3 className="text-lg font-bold text-white mb-4">Nuevo Torneo</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre del Torneo
              </label>
              <Input
                placeholder="Ej: Copa América 2024"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Año</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-3">
              <Button onClick={handleAddTournament} className="flex-1">
                Crear Torneo
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {tournaments.map((tournament) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="relative">
              {tournament.is_active && (
                <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1">
                  <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                    <Check size={14} /> Activo
                  </span>
                </div>
              )}

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">TORNEO</p>
                  <p className="font-bold text-white">{tournament.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">AÑO</p>
                  <p className="font-bold text-white">{tournament.year}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">FECHA INICIO</p>
                  <p className="font-bold text-white">{tournament.start_date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">FECHA FIN</p>
                  <p className="font-bold text-white">{tournament.end_date}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => toggleActive(tournament.id)}
                  variant={tournament.is_active ? 'ghost' : 'primary'}
                  size="sm"
                >
                  {tournament.is_active ? 'Desactivar' : 'Activar'}
                </Button>
                <Button variant="secondary" size="sm" className="gap-1">
                  <Edit2 size={14} /> Editar
                </Button>
                <Button
                  onClick={() => handleDeleteTournament(tournament.id)}
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                >
                  <Trash2 size={14} /> Eliminar
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
