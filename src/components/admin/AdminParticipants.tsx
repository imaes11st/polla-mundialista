import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Trash2, Edit2, Loader2, AlertCircle } from 'lucide-react'
import { supabaseService } from '../../services/supabase'
import { useToast } from '../../contexts/ToastContext'

interface Participant {
  id: string
  full_name: string
  phone_number?: string
  created_at: string
}

export function AdminParticipants() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [formData, setFormData] = useState({ full_name: '', phone_number: '' })
  const [searchTerm, setSearchTerm] = useState('')

  // 1. Fetch participants list
  const { data: participants = [], isLoading, isError } = useQuery<Participant[]>({
    queryKey: ['admin-participants-list'],
    queryFn: () => supabaseService.listParticipants().then((res) => res.data || []),
  })

  // 2. Mutation to Save (Add or Update)
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; full_name: string; phone_number: string }) => {
      const { data, error } = await supabaseService.saveParticipant(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants-list'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      showToast(editingParticipant ? 'Participante actualizado con éxito.' : 'Participante agregado con éxito.', 'success')
      setFormData({ full_name: '', phone_number: '' })
      setEditingParticipant(null)
      setShowForm(false)
    },
    onError: (err: any) => {
      console.error(err)
      showToast(`Error al guardar: ${err.message || 'Inténtalo de nuevo'}`, 'error')
    }
  })

  // 3. Mutation to Delete (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseService.deleteParticipant(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants-list'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'] })
      showToast('Participante eliminado con éxito.', 'success')
    },
    onError: (err: any) => {
      console.error(err)
      showToast(`Error al eliminar: ${err.message}`, 'error')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.full_name.trim()) {
      showToast('El nombre es obligatorio', 'info')
      return
    }

    saveMutation.mutate({
      id: editingParticipant?.id,
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
    })
  }

  const handleEditClick = (p: Participant) => {
    setEditingParticipant(p)
    setFormData({
      full_name: p.full_name,
      phone_number: p.phone_number || '',
    })
    setShowForm(true)
  }

  const handleDeleteClick = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este participante? Se conservarán sus datos históricos pero no podrá iniciar sesión.')) {
      deleteMutation.mutate(id)
    }
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
            placeholder="Buscar participante por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setEditingParticipant(null)
            setFormData({ full_name: '', phone_number: '' })
            setShowForm(!showForm)
          }} 
          className="gap-2"
        >
          <Plus size={18} />
          {showForm ? 'Cerrar Formulario' : 'Agregar Participante'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-mundialYellow/20 shadow-xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            {editingParticipant ? 'Editar Participante' : 'Nuevo Participante'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre Completo
              </label>
              <Input
                placeholder="Ej: Fernando Rincón"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Teléfono Celular (Usado para ingresar)
              </label>
              <Input
                placeholder="Ej: +57 300 123 4567"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
              <p className="text-xs text-slate-400 mt-1">Este número será el que digite el usuario al entrar.</p>
            </div>
            <div className="flex gap-3 pt-3">
              <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Participante'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingParticipant(null)
                  setFormData({ full_name: '', phone_number: '' })
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loading and Error states */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-8 w-8 text-mundialYellow animate-spin" />
          <p className="text-sm text-slate-400">Cargando participantes...</p>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={20} />
          <p className="text-sm">Error al cargar participantes de la base de datos.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Teléfono Celular
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      No se encontraron participantes.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-white">{p.full_name}</td>
                      <td className="px-6 py-4 text-slate-350 font-mono text-sm">{p.phone_number || 'Sin número'}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(p.created_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(p)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(p.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700 text-sm text-slate-400 flex justify-between items-center">
            <span>
              Total: <span className="font-bold text-white">{filteredParticipants.length}</span> participante(s)
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
