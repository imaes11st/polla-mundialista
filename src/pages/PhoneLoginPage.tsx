import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabaseService } from '../services/supabase'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'

// Geometric background pattern
function LoginPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03] pointer-events-none" aria-hidden="true">
      <svg className="w-full h-full" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="loginGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="white" />
            <path d="M0 20 L40 20 M20 0 L20 40" stroke="white" strokeWidth="0.3" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="300" height="300" fill="url(#loginGrid)" />
      </svg>
    </div>
  )
}

export function PhoneLoginPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { login } = useCurrentParticipant()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabaseService.getParticipantByPhone(phone.trim())
      
      if (error) {
        throw error
      }

      if (data) {
        login(data)
        navigate('/dashboard')
      } else {
        setErrorMsg('Número no registrado. Verifica con el administrador.')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Ocurrió un error al verificar tu número.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[65vh] flex-col items-center justify-center px-4 py-8">
      <LoginPattern />

      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(252,209,22,0.08) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-full max-w-sm relative z-10"
      >
        <Card variant="glass" className="border-mundialYellow/15 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
              className="text-5xl"
            >
              ⚽
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-black text-gradient-tricolor">
              INGRESO
            </h1>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              Digita tu número celular para acceder a tu cuenta mundialista.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Número Celular
              </label>
              <Input
                type="tel"
                placeholder="Ej: 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="input-premium text-center text-lg font-bold !rounded-xl"
                required
              />
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs font-bold text-center bg-red-500/[0.08] border border-red-500/20 py-2.5 rounded-xl"
              >
                ⚠️ {errorMsg}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading || !phone.trim()}
              loading={loading}
              glow={!loading && !!phone.trim()}
              className="w-full py-3.5 text-sm"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-[10px] text-slate-600 mt-5">
            ¿No estás registrado? Contacta al administrador de la polla.
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
