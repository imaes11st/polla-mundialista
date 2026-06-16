import type { ParticipantPoint } from '../types'

export function RankingTable({ rows }: { rows: Array<{ position: number; name: string; points: number }> }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-sports">
      <div className="grid grid-cols-[1fr_3fr_2fr] gap-4 border-b border-white/10 bg-slate-900/80 px-5 py-4 text-sm uppercase tracking-[0.18em] text-slate-400">
        <span>Posición</span>
        <span>Nombre</span>
        <span>Puntos</span>
      </div>
      <div className="space-y-2 px-5 py-4">
        {rows.map((row) => (
          <div key={row.position} className="grid grid-cols-[1fr_3fr_2fr] items-center gap-4 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-100">
            <span>{row.position}</span>
            <span>{row.name}</span>
            <span className="font-semibold">{row.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
