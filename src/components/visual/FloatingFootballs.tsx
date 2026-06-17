import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

interface FloatingFootballsProps {
  count?: number
  intensity?: 'soft' | 'normal'
}

interface BallLayer {
  id: number
  left: number
  top: number
  size: number
  opacity: number
  blur: number
  depth: number
  duration: number
  delay: number
  driftX: number
  driftY: number
  rotate: number
  hue: number
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000
  return x - Math.floor(x)
}

const createBall = (id: number): BallLayer => {
  const depth = seededRandom(id + 3)

  return {
    id,
    left: seededRandom(id + 11) * 100,
    top: seededRandom(id + 17) * 100,
    size: 32 + depth * 48,
    opacity: 0.08 + depth * 0.14,
    blur: (1 - depth) * 2.5,
    depth,
    duration: 16 + seededRandom(id + 23) * 12,
    delay: seededRandom(id + 29) * -8,
    driftX: (seededRandom(id + 31) - 0.5) * (60 + depth * 80),
    driftY: (seededRandom(id + 37) - 0.5) * (50 + depth * 70),
    rotate: seededRandom(id + 41) > 0.5 ? 360 : -360,
    hue: Math.floor(seededRandom(id + 47) * 3), // 0=yellow, 1=blue, 2=red
  }
}

// Color accents per ball for variety
const ACCENT_COLORS = [
  { stroke: '#FCD116', glow: 'rgba(252, 209, 22, 0.15)' },  // Yellow
  { stroke: '#4A90D9', glow: 'rgba(0, 56, 147, 0.12)' },    // Blue
  { stroke: '#E84057', glow: 'rgba(206, 17, 38, 0.12)' },    // Red
]

/**
 * Premium FIFA World Cup 2026 soccer ball
 * Inspired by the "Al Rihla" style with fluid panel design
 */
const WorldCupBall = memo(function WorldCupBall({ hue = 0 }: { hue?: number }) {
  const accent = ACCENT_COLORS[hue % 3]
  const ballId = `ball-${hue}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg" aria-hidden="true">
      <defs>
        {/* 3D sphere shading */}
        <radialGradient id={`${ballId}-shade`} cx="38%" cy="35%" r="62%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
          <stop offset="35%" stopColor="rgba(255, 255, 255, 0.15)" />
          <stop offset="70%" stopColor="rgba(0, 17, 47, 0.3)" />
          <stop offset="100%" stopColor="rgba(0, 10, 30, 0.65)" />
        </radialGradient>
        {/* Outer glow */}
        <radialGradient id={`${ballId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent.glow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`${ballId}-spec`} cx="35%" cy="30%" r="25%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Ambient glow ring */}
      <circle cx="60" cy="60" r="56" fill={`url(#${ballId}-glow)`} />

      {/* Main sphere base */}
      <circle
        cx="60" cy="60" r="44"
        fill="rgba(240, 240, 245, 0.06)"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth="1"
      />

      {/* ─── 2026 Fluid Panel Design ─── */}

      {/* Top swoosh arc */}
      <path
        d="M 24,36 Q 38,18 60,26 Q 82,34 96,24"
        fill="none" stroke={accent.stroke} strokeWidth="2.2" opacity="0.55"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Mid swoosh - main accent */}
      <path
        d="M 18,58 Q 36,44 60,54 Q 84,64 102,52"
        fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bottom swoosh arc */}
      <path
        d="M 24,82 Q 40,98 60,88 Q 80,78 96,92"
        fill="none" stroke={accent.stroke} strokeWidth="2" opacity="0.4"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Vertical flow line */}
      <path
        d="M 54,18 Q 48,40 56,60 Q 64,80 58,102"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Small panel accent shapes */}
      <path
        d="M 40,42 Q 50,36 60,42 Q 52,50 40,42"
        fill={accent.stroke} opacity="0.12"
      />
      <path
        d="M 68,66 Q 78,60 84,68 Q 76,74 68,66"
        fill={accent.stroke} opacity="0.1"
      />

      {/* Seam line details */}
      <circle cx="42" cy="56" r="8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      <circle cx="76" cy="48" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

      {/* 3D shading overlay */}
      <circle cx="60" cy="60" r="44" fill={`url(#${ballId}-shade)`} style={{ mixBlendMode: 'overlay' }} />

      {/* Specular highlight */}
      <circle cx="46" cy="42" r="14" fill={`url(#${ballId}-spec)`} style={{ mixBlendMode: 'overlay' }} />

      {/* Rim light (bottom right) */}
      <path
        d="M 80,82 Q 92,72 96,60"
        fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export function FloatingFootballs({ count = 7, intensity = 'normal' }: FloatingFootballsProps) {
  const balls = useMemo(() => Array.from({ length: count }, (_, i) => createBall(i)), [count])
  const opacityScale = intensity === 'soft' ? 0.65 : 0.85

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Desktop balls - larger and more visible */}
      {balls.map((ball) => (
        <motion.div
          key={ball.id}
          className="absolute hidden md:block"
          style={{
            left: `${ball.left}%`,
            top: `${ball.top}%`,
            width: ball.size,
            height: ball.size,
            opacity: ball.opacity * opacityScale,
            filter: `blur(${ball.blur}px)`,
            zIndex: Math.round(ball.depth * 3),
          }}
          animate={{
            x: [0, ball.driftX * 0.7, ball.driftX * -0.3, 0],
            y: [0, ball.driftY * 0.7, ball.driftY * -0.35, 0],
            rotate: [0, ball.rotate * 0.6, ball.rotate],
            scale: [1, 1 + ball.depth * 0.08, 0.97, 1],
          }}
          transition={{
            duration: ball.duration,
            delay: ball.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <WorldCupBall hue={ball.hue} />
        </motion.div>
      ))}

      {/* Mobile balls - smaller but still visible (4 balls) */}
      {balls.slice(0, 4).map((ball) => (
        <motion.div
          key={`m-${ball.id}`}
          className="absolute md:hidden"
          style={{
            left: `${ball.left}%`,
            top: `${ball.top}%`,
            width: ball.size * 0.55,
            height: ball.size * 0.55,
            opacity: ball.opacity * opacityScale * 0.6,
            filter: `blur(${ball.blur + 0.5}px)`,
          }}
          animate={{
            x: [0, ball.driftX * 0.3, 0],
            y: [0, ball.driftY * 0.4, 0],
            rotate: [0, ball.rotate * 0.3],
            scale: [1, 1.04, 0.98, 1],
          }}
          transition={{
            duration: ball.duration * 1.2,
            delay: ball.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <WorldCupBall hue={ball.hue} />
        </motion.div>
      ))}
    </div>
  )
}
