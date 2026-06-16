import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface Participant {
  id: string
  full_name: string
  phone_number?: string
  created_at: string
}

export function AdminParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      full_name: 'Fernando Rincón',
      phone_number: '+57 300 123 4567',
      created_at: '2024-01-15',
    },
    {
      id: '2',
      full_name: 'Juan Esteban Marín',
      phone_number: '+57 300 987 6543',
      created_at: '2024-01-16',
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ full_name: '', phone_number: '' })
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddParticipant = () => {
    if (formData.full_name.trim()) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString().split('T')[0],
      }
      setParticipants([...participants, newParticipant])
      setFormData({ full_name: '', phone_number: '' })
      setShowForm(false)
    }
  }

  const handleDeleteParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  const filteredParticipants = participants.filter((p) =>
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={18} />
          Agregar
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-mundialYellow/20"
        >
          <h3 className="text-lg font-bold text-white mb-4">Nuevo Participante</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre Completo
              </label>
              <Input
                placeholder="Ej: Juan Pérez"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Teléfono (Opcional)
              </label>
              <Input
                placeholder="+57 300 123 4567"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-3">
              <Button onClick={handleAddParticipant} className="flex-1">
                Guardar
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setFormData({ full_name: '', phone_number: '' })
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredParticipants.map((participant) => (
                <motion.tr
                  key={participant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-white">{participant.full_name}</td>
                  <td className="px-6 py-4 text-slate-400">{participant.phone_number || '-'}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{participant.created_at}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteParticipant(participant.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700 text-sm text-slate-400">
          Total: <span className="font-bold text-white">{filteredParticipants.length}</span> participante(s)
        </div>
      </Card>
    </div>
  )
}
