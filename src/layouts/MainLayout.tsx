import { Link, useLocation } from 'react-router-dom'
import { useParticipant } from '../contexts/ParticipantContext'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'
import { Trophy, ChartPie, ShieldCheck, Sparkles } from 'lucide-react'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { participant } = useParticipant()
  const { logout } = useCurrentParticipant()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Inicio', icon: Trophy },
    { path: '/dashboard', label: 'Mis Pronósticos', icon: ChartPie },
    { path: '/especiales', label: 'Especiales', icon: Sparkles },
    { path: '/ranking', label: 'Ranking', icon: null },
    { path: '/admin', label: 'Admin', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(252,209,22,0.08),_transparent_40%),linear-gradient(180deg,#001b4d_0%,#00102c_100%)] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mundialYellow">Polla Mundialista Familiar</p>
            <h1 className="text-2xl font-semibold text-white">🏆 Rincón</h1>
          </div>
          <div className="flex items-center gap-3">
            {participant ? (
              <>
                <div className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-sports">
                  Hola, {participant.full_name}
                </div>
                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 bg-white/5 rounded-full hover:bg-white/10 transition border border-red-500/20"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-3xl bg-mundialYellow text-slate-950 px-4 py-2 text-sm font-bold shadow-sports hover:bg-mundialYellow/90 transition"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>


      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-400">
          <span>Diseño mobile-first inspirado en Mundial FIFA y álbum Panini.</span>
          <nav className="flex flex-wrap gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
              return (
                <Link
                  key={path}
                  to={path}
                  className={`rounded-full px-3 py-2 transition-all flex items-center gap-2 ${isActive ? 'bg-mundialYellow/20 text-mundialYellow border border-mundialYellow/50' : 'hover:bg-white/10'}`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </footer>
    </div>
  )
}
