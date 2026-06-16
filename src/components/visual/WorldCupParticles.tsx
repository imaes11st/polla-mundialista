import { useEffect, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  shape: 'spark' | 'circle' | 'diamond'
  pulse: number
}

interface WorldCupParticlesProps {
  count?: number
}

const COLORS = ['#FCD116', '#FFFFFF', '#003893', '#CE1126', '#F6D365']

function createParticle(id: number, width: number, height: number): Particle {
  return {
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: -0.08 - Math.random() * 0.24,
    size: 1.2 + Math.random() * 2.8,
    opacity: 0.18 + Math.random() * 0.46,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: ['spark', 'circle', 'diamond'][Math.floor(Math.random() * 3)] as Particle['shape'],
    pulse: Math.random() * Math.PI * 2,
  }
}

function drawSpark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - size * 1.8)
  ctx.lineTo(x + size * 0.45, y - size * 0.45)
  ctx.lineTo(x + size * 1.8, y)
  ctx.lineTo(x + size * 0.45, y + size * 0.45)
  ctx.lineTo(x, y + size * 1.8)
  ctx.lineTo(x - size * 0.45, y + size * 0.45)
  ctx.lineTo(x - size * 1.8, y)
  ctx.lineTo(x - size * 0.45, y - size * 0.45)
  ctx.closePath()
  ctx.fill()
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.lineTo(x + size * 0.75, y)
  ctx.lineTo(x, y + size)
  ctx.lineTo(x - size * 0.75, y)
  ctx.closePath()
  ctx.fill()
}

export function WorldCupParticles({ count = 56 }: WorldCupParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

      particlesRef.current = Array.from({ length: count }, (_, index) => createParticle(index, width, height))
    }

    const tick = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'screen'

      particlesRef.current = particlesRef.current.map((particle) => {
        const pulse = particle.pulse + 0.025
        const alpha = particle.opacity * (0.68 + Math.sin(pulse) * 0.28)
        const x = particle.x + particle.vx + Math.sin(pulse * 0.8) * 0.12
        const y = particle.y + particle.vy

        ctx.save()
        ctx.globalAlpha = Math.max(0.04, alpha)
        ctx.fillStyle = particle.color

        if (particle.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.shape === 'spark') {
          drawSpark(ctx, x, y, particle.size)
        } else {
          drawDiamond(ctx, x, y, particle.size)
        }

        ctx.restore()

        return {
          ...particle,
          x: x < -16 ? width + 16 : x > width + 16 ? -16 : x,
          y: y < -20 ? height + 20 : y,
          pulse,
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
