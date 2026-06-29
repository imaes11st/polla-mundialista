import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, Trophy, Target, Star, Swords } from 'lucide-react'

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false)

  const rules = [
    {
      title: 'Puntos por Partido',
      icon: <Target className="text-mundialYellow" size={20} />,
      items: [
        { label: 'Acierto Exacto (Ej: 2-1 y queda 2-1)', value: '3 pts' },
        { label: 'Acierto Tendencia (Ej: 1-0 y queda 3-1)', value: '1 pt' },
        { label: 'No acertar ganador ni empate', value: '0 pts' },
      ],
    },
    {
      title: '¡Premio al Progreso!',
      icon: <Trophy className="text-mundialYellow" size={20} />,
      items: [
        { label: 'Dieciseisavos (Exacto / Tendencia)', value: '4 / 2 pts' },
        { label: 'Octavos (Exacto / Tendencia)', value: '5 / 3 pts' },
        { label: 'Cuartos (Exacto / Tendencia)', value: '6 / 4 pts' },
        { label: 'Semifinal (Exacto / Tendencia)', value: '7 / 5 pts' },
        { label: '3er Puesto (Exacto / Tendencia)', value: '8 / 6 pts' },
        { label: 'Gran Final (Exacto / Tendencia)', value: '9 / 7 pts' },
      ],
    },
    {
      title: 'Preguntas Especiales (Batacazos)',
      icon: <Star className="text-mundialYellow" size={20} />,
      items: [
        { label: 'Campeón del Mundo', value: '10 pts' },
        { label: 'Cada Finalista (Máx 2)', value: '5 pts' },
        { label: 'Goleador del Campeonato', value: '8 pts' },
        { label: 'Goleador Selección Colombia', value: '5 pts' },
        { label: 'Duelo Messi vs Cristiano', value: '5 pts' },
      ],
    },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-mundialYellow border border-mundialYellow/30 hover:bg-white/20 transition-all shadow-lg shadow-mundialYellow/5"
      >
        <Info size={16} />
        <span>REGLAS Y PUNTOS</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed" />
                
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-mundialYellow/20 p-2">
                      <Info className="text-mundialYellow" size={20} />
                    </div>
                    <h2 className="text-xl font-black text-white">Reglas y Puntuación</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-8 no-scrollbar">
                  {rules.map((section) => (
                    <div key={section.title} className="space-y-4">
                      <div className="flex items-center gap-2 text-mundialYellow">
                        {section.icon}
                        <h3 className="font-bold uppercase tracking-widest text-sm">{section.title}</h3>
                      </div>
                      
                      <div className="grid gap-2">
                        {section.items.map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/5">
                            <span className="text-sm text-slate-300">{item.label}</span>
                            <span className="text-sm font-black text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-mundialYellow/10 border border-mundialYellow/25 p-4 flex gap-3">
                    <Target className="text-mundialYellow shrink-0" size={20} />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">⚽ Fases Eliminatorias:</span> Se toma el <span className="font-bold text-mundialYellow">resultado final incluyendo alargue</span>, pero sin contar penales. Ejemplo: si queda 1-1 en 90' y 2-1 en alargue → se evalúa contra <span className="font-bold text-mundialYellow">2-1</span>. Si va a penales con 1-1 → se evalúa contra <span className="font-bold text-mundialYellow">1-1</span>.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-mundialBlue/20 border border-mundialBlue/30 p-4 flex gap-3">
                    <Swords className="text-mundialBlue shrink-0" size={20} />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white italic">Nota Messi vs CR7:</span> Si ambos quedan eliminados en la Primera Fase, la pregunta se anula y nadie suma puntos.
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-white/5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full rounded-2xl bg-mundialYellow py-3 text-sm font-black text-slate-950 shadow-lg shadow-mundialYellow/20 hover:opacity-90 transition-opacity"
                  >
                    ¡ENTENDIDO!
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
