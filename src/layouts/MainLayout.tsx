import { Link, useLocation } from 'react-router-dom'
import { useParticipant } from '../contexts/ParticipantContext'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'
import { Trophy, ChartPie, ShieldCheck, Sparkles, BarChart3, Home, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

// Only this phone number can see/access the admin panel
const ADMIN_PHONE = '3024410621'

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/dashboard', label: 'Pronósticos', icon: ChartPie },
  { path: '/especiales', label: 'Especiales', icon: Sparkles },
  { path: '/ranking', label: 'Ranking', icon: BarChart3 },
]

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { participant } = useParticipant()
  const { logout } = useCurrentParticipant()
  const location = useLocation()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(252,209,22,0.06),_transparent_40%),linear-gradient(180deg,#001b4d_0%,#00102c_100%)] text-white">
      
      {/* ─── Desktop/Mobile Header ─── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#001b4d]/80 backdrop-blur-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl">🏆</span>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.25em] text-mundialYellow/70 font-semibold leading-none">
                Polla Mundialista
              </p>
              <p className="text-sm font-bold text-white leading-tight">Familiar Rincón</p>
            </div>
            <p className="sm:hidden text-sm font-black text-white">
              Rincón <span className="text-mundialYellow/70 text-[10px] font-bold">2026</span>
            </p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive(path)
                    ? 'text-mundialYellow'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-mundialYellow/10 border border-mundialYellow/20"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            {participant?.phone_number?.replace(/\D/g, '').endsWith(ADMIN_PHONE) && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive('/admin')
                    ? 'text-mundialYellow bg-mundialYellow/10 border border-mundialYellow/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <ShieldCheck size={15} />
                Admin
              </Link>
            )}
          </nav>

          {/* User section */}
          <div className="flex items-center gap-2 md:gap-3">
            {participant ? (
              <>
                <div className="hidden sm:flex items-center gap-2 glass-card rounded-xl px-3 py-1.5 text-xs text-slate-200">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-950 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FCD116, #F6D365)' }}
                  >
                    {participant.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-semibold truncate max-w-[100px]">{participant.full_name}</span>
                </div>
                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="text-[10px] text-red-400/70 hover:text-red-400 font-bold px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20 flex items-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-mundialYellow to-yellow-400 text-slate-950 px-4 py-2 text-xs font-black tracking-wider shadow-glow-yellow hover:shadow-glow-yellow/50 transition-shadow"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-6">
        {children}
      </main>

      {/* ─── Desktop Footer ─── */}
      <footer className="hidden md:block border-t border-white/[0.06] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[10px] text-slate-600">
          <span>Polla Mundialista Familiar Rincón · Mundial 2026</span>
          <span>Hecho con ⚽ y ❤️ desde Colombia</span>
        </div>
      </footer>

      {/* ─── Colombia Flag Strip ─── */}
      <div className="hidden md:flex w-full h-2 overflow-hidden">
        <div className="h-full bg-[#FCD116]" style={{ width: '50%' }} />
        <div className="h-full bg-[#003893]" style={{ width: '25%' }} />
        <div className="h-full bg-[#CE1126]" style={{ width: '25%' }} />
      </div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] bg-[#001020]/95 backdrop-blur-glass pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path)
            return (
              <Link
                key={path}
                to={path}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px]"
              >
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute -top-1 inset-x-2 h-[3px] bg-mundialYellow rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className={`transition-colors ${active ? 'text-mundialYellow' : 'text-slate-500'}`}
                />
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    active ? 'text-mundialYellow' : 'text-slate-600'
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Colombia flag micro-strip at the very bottom */}
        <div className="flex w-full h-[3px] overflow-hidden">
          <div className="h-full bg-[#FCD116]" style={{ width: '50%' }} />
          <div className="h-full bg-[#003893]" style={{ width: '25%' }} />
          <div className="h-full bg-[#CE1126]" style={{ width: '25%' }} />
        </div>
      </nav>
    </div>
  )
}
