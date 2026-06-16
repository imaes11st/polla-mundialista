import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  width: number
  height: number
  color: string
  life: number
  maxLife: number
}

interface ColombiaConfettiProps {
  active?: boolean
  duration?: number
  onEnd?: () => void
}

const COLOMBIA_COLORS = ['#FCD116', '#FCD116', '#003893', '#CE1126', '#FFFFFF']

function createPiece(id: number, width: number): ConfettiPiece {
  return {
    id,
    x: Math.random() * width,
    y: -24,
    vx: (Math.random() - 0.5) * 5,
    vy: 2.2 + Math.random() * 3.4,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    width: 5 + Math.random() * 11,
    height: 6 + Math.random() * 13,
    color: COLOMBIA_COLORS[Math.floor(Math.random() * COLOMBIA_COLORS.length)],
    life: 0,
    maxLife: 190 + Math.random() * 120,
  }
}

function MiniBall() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="#ffffff" stroke="#d1d5db" strokeWidth="2" />
      <polygon points="40,18 52,28 48,43 32,43 28,28" fill="#111827" />
      <polygon points="40,2 50,11 48,21 32,21 30,11" fill="#111827" />
      <polygon points="66,25 74,38 65,50 52,45 54,31" fill="#111827" />
      <polygon points="52,60 46,76 32,72 31,57 44,51" fill="#111827" />
      <polygon points="14,25 26,31 28,45 15,50 6,38" fill="#111827" />
    </svg>
  )
}

function ColombiaMark() {
  return (
    <div className="h-9 w-14 overflow-hidden rounded-sm border border-white/50 shadow-lg" aria-hidden="true">
      <div className="h-1/2 bg-[#FCD116]" />
      <div className="h-1/4 bg-[#003893]" />
      <div className="h-1/4 bg-[#CE1126]" />
    </div>
  )
}

export function ColombiaConfetti({ active = false, duration = 6500, onEnd }: ColombiaConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const piecesRef = useRef<ConfettiPiece[]>([])
  const rafRef = useRef<number>()
  const emitterRef = useRef<ReturnType<typeof setInterval>>()
  const nextIdRef = useRef(0)
  const onEndRef = useRef(onEnd)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  useEffect(() => {
    if (!active) {
      if (emitterRef.current) clearInterval(emitterRef.current)
      piecesRef.current = []
      setVisible(false)
      return
    }

    setVisible(true)

    const burst = (amount: number) => {
      const width = window.innerWidth
      for (let index = 0; index < amount; index += 1) {
        piecesRef.current.push(createPiece(nextIdRef.current, width))
        nextIdRef.current += 1
      }
    }

    burst(80)
    emitterRef.current = setInterval(() => burst(10), 90)

    const stopTimer = window.setTimeout(() => {
      if (emitterRef.current) clearInterval(emitterRef.current)
      emitterRef.current = undefined

      window.setTimeout(() => {
        setVisible(false)
        piecesRef.current = []
        onEndRef.current?.()
      }, 2200)
    }, duration)

    return () => {
      window.clearTimeout(stopTimer)
      if (emitterRef.current) clearInterval(emitterRef.current)
    }
  }, [active, duration])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!visible || !canvas || !ctx) return

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const tick = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)
      piecesRef.current = piecesRef.current.filter((piece) => piece.life < piece.maxLife && piece.y < height + 72)

      for (const piece of piecesRef.current) {
        piece.x += piece.vx + Math.sin(piece.life * 0.05) * 0.8
        piece.y += piece.vy
        piece.vy += 0.035
        piece.rotation += piece.rotationSpeed
        piece.life += 1

        const fade =
          piece.life > piece.maxLife * 0.78
            ? 1 - (piece.life - piece.maxLife * 0.78) / (piece.maxLife * 0.22)
            : 1

        ctx.save()
        ctx.globalAlpha = Math.max(0, fade)
        ctx.translate(piece.x, piece.y)
        ctx.rotate((piece.rotation * Math.PI) / 180)
        ctx.fillStyle = piece.color
        ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50"
          aria-hidden="true"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          <motion.div
            initial={{ y: -96, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -96, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 190, damping: 19 }}
            className="absolute left-1/2 top-6 z-10 w-[min(92vw,520px)] -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-white/25 bg-slate-950/92 shadow-2xl backdrop-blur-md">
              <div className="h-2 bg-gradient-to-r from-[#FCD116] via-[#003893] to-[#CE1126]" />
              <div className="flex items-center justify-center gap-4 px-5 py-4 text-center">
                <ColombiaMark />
                <div>
                  <p className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
                    Colombia gana
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-mundialYellow">
                    Celebra tus puntos
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MiniBall />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
