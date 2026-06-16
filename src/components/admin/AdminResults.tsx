import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Save, Undo2 } from 'lucide-react'

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  stage: string
  status: 'scheduled' | 'live' | 'finished'
  homeScore?: number
  awayScore?: number
}

export function AdminResults() {
  const [matches, setMatches] = useState<Match[]>([
    {
      id: '1',
      homeTeam: 'Colombia',
      awayTeam: 'Japón',
      date: '2024-06-20',
      stage: 'Grupo',
      status: 'finished',
      homeScore: 2,
      awayScore: 1,
    },
    {
      id: '2',
      homeTeam: 'Brasil',
      awayTeam: 'Uruguay',
      date: '2024-06-21',
      stage: 'Grupo',
      status: 'scheduled',
    },
    {
      id: '3',
      homeTeam: 'Argentina',
      awayTeam: 'Paraguay',
      date: '2024-06-22',
      stage: 'Grupo',
      status: 'live',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempScores, setTempScores] = useState({ home: 0, away: 0 })

  const startEditing = (match: Match) => {
    setEditingId(match.id)
    setTempScores({
      home: match.homeScore || 0,
      away: match.awayScore || 0,
    })
  }

  const saveResult = (id: string) => {
    setMatches(
      matches.map((m) =>
        m.id === id
          ? {
              ...m,
              homeScore: tempScores.home,
              awayScore: tempScores.away,
              status: 'finished' as const,
            }
          : m
      )
    )
    setEditingId(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setTempScores({ home: 0, away: 0 })
  }

  const statusBadges = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    live: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    finished: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="grid md:grid-cols-12 gap-4 items-center">
              {/* Teams & Score */}
              <div className="md:col-span-4">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{match.stage}</p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{match.homeTeam}</p>
                      {editingId === match.id ? (
                        <input
                          type="number"
                          value={tempScores.home}
                          onChange={(e) =>
                            setTempScores({
                              ...tempScores,
                              home: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full text-2xl font-bold text-mundialYellow bg-slate-700 rounded px-2 py-1 mt-1 text-center"
                        />
                      ) : (
                        <p className="text-2xl font-bold text-mundialYellow">
                          {match.homeScore ?? '-'}
                        </p>
                      )}
                    </div>
                    <span className="text-slate-400 font-bold">-</span>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{match.awayTeam}</p>
                      {editingId === match.id ? (
                        <input
                          type="number"
                          value={tempScores.away}
                          onChange={(e) =>
                            setTempScores({
                              ...tempScores,
                              away: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full text-2xl font-bold text-mundialYellow bg-slate-700 rounded px-2 py-1 mt-1 text-center"
                        />
                      ) : (
                        <p className="text-2xl font-bold text-mundialYellow">
                          {match.awayScore ?? '-'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date & Status */}
              <div className="md:col-span-3">
                <p className="text-xs text-slate-400 mb-1">FECHA Y HORA</p>
                <p className="font-semibold text-white text-sm">
                  {new Date(match.date).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div
                  className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusBadges[match.status]}`}
                >
                  {match.status.toUpperCase()}
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-5 flex gap-2 justify-end">
                {editingId === match.id ? (
                  <>
                    <Button
                      onClick={() => saveResult(match.id)}
                      size="sm"
                      className="gap-1"
                    >
                      <Save size={14} />
                      Guardar
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                    >
                      <Undo2 size={14} />
                      Cancelar
                    </Button>
                  </>
                ) : match.status === 'finished' ? (
                  <Button
                    onClick={() => startEditing(match)}
                    variant="secondary"
                    size="sm"
                  >
                    Editar
                  </Button>
                ) : (
                  <Button
                    onClick={() => startEditing(match)}
                    size="sm"
                  >
                    Registrar Resultado
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
