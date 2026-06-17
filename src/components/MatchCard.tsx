import type { Match } from '../types'
import { Button } from './ui/Button'

export function MatchCard({ match, homeTeam, awayTeam, onSave }: { match: Match; homeTeam: { name: string; flag_url: string }; awayTeam: { name: string; flag_url: string }; onSave: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sports">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
        <span>{new Date(match.match_date).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">{match.stage}</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={homeTeam.flag_url} alt={homeTeam.name} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-base font-semibold">{homeTeam.name}</p>
          </div>
        </div>
        <span className="text-2xl font-bold">vs</span>
        <div className="flex items-center gap-3">
          <img src={awayTeam.flag_url} alt={awayTeam.name} className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-base font-semibold">{awayTeam.name}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <input type="number" min={0} placeholder="2" className="w-20 rounded-3xl border border-white/10 bg-slate-800 px-4 py-3 text-center text-white outline-none" />
          <input type="number" min={0} placeholder="1" className="w-20 rounded-3xl border border-white/10 bg-slate-800 px-4 py-3 text-center text-white outline-none" />
        </div>
        <Button type="button" onClick={onSave}>Guardar Pronóstico</Button>
      </div>
    </div>
  )
}
