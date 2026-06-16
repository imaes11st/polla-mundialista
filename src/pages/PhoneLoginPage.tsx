import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabaseService } from '../services/supabase'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'

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
        setErrorMsg('Número no registrado.')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg('Ocurrió un error al verificar tu número.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card variant="sport" className="border-mundialYellow/30 bg-slate-900 shadow-2xl p-8">
          <div className="text-center mb-6 space-y-2">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed">
              ⚽ INGRESO
            </h1>
            <p className="text-slate-300 text-sm">
              Digita tu número celular para acceder a tu cuenta mundialista.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Número Celular
              </label>
              <Input
                type="tel"
                placeholder="Ej: +57 300 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="text-center text-lg font-bold"
                required
              />
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm font-bold text-center bg-red-500/10 border border-red-500/30 py-2 rounded-xl"
              >
                ⚠️ {errorMsg}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-3 text-lg font-bold"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
