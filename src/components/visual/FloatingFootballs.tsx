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
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000
  return x - Math.floor(x)
}

const createBall = (id: number): BallLayer => {
  const depth = seededRandom(id + 3)

  return {
    id,
    left: seededRandom(id + 11) * 104 - 2,
    top: seededRandom(id + 17) * 110 - 5,
    size: 22 + depth * 58,
    opacity: 0.05 + depth * 0.13,
    blur: (1 - depth) * 4.5,
    depth,
    duration: 12 + seededRandom(id + 23) * 14,
    delay: seededRandom(id + 29) * -12,
    driftX: (seededRandom(id + 31) - 0.5) * (70 + depth * 110),
    driftY: (seededRandom(id + 37) - 0.5) * (55 + depth * 90),
    rotate: seededRandom(id + 41) > 0.5 ? 360 : -360,
  }
}

const SoccerBallSvg = memo(function SoccerBallSvg() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Balon de futbol">
      <defs>
        <radialGradient id="ballShade" cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f3f4f6" />
          <stop offset="100%" stopColor="#bfc6d1" />
        </radialGradient>
        <filter id="ballShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.22" />
        </filter>
      </defs>
      <circle cx="60" cy="60" r="55" fill="url(#ballShade)" stroke="#d1d5db" strokeWidth="2" filter="url(#ballShadow)" />
      <polygon points="60,32 77,45 70,66 50,66 43,45" fill="#111827" />
      <polygon points="60,4 75,15 71,32 49,32 45,15" fill="#111827" />
      <polygon points="101,37 108,55 96,70 79,62 82,43" fill="#111827" />
      <polygon points="86,90 76,108 56,108 50,88 69,78" fill="#111827" />
      <polygon points="34,90 51,88 45,108 24,103 19,84" fill="#111827" />
      <polygon points="19,37 38,43 41,62 24,70 12,55" fill="#111827" />
      <path d="M49 32 43 45M71 32l6 13M50 66 41 62M70 66l9-4M50 88l-7-22M69 78l1-12M38 43l5 2M82 43l-5 2" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 28c16-17 44-22 66-8" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.45" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="#111827" strokeWidth="1.5" opacity="0.18" />
    </svg>
  )
})

export function FloatingFootballs({ count = 8, intensity = 'normal' }: FloatingFootballsProps) {
  const balls = useMemo(() => Array.from({ length: count }, (_, index) => createBall(index)), [count])
  const opacityScale = intensity === 'soft' ? 0.72 : 1

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {balls.map((ball) => (
        <motion.div
          key={ball.id}
          className="absolute"
          style={{
            left: `${ball.left}%`,
            top: `${ball.top}%`,
            width: ball.size,
            height: ball.size,
            opacity: ball.opacity * opacityScale,
            filter: `blur(${ball.blur}px)`,
            zIndex: Math.round(ball.depth * 4),
          }}
          animate={{
            x: [0, ball.driftX, ball.driftX * -0.35, 0],
            y: [0, ball.driftY, ball.driftY * -0.45, 0],
            rotate: [0, ball.rotate, ball.rotate * 1.35],
            scale: [1, 1 + ball.depth * 0.16, 0.94, 1],
          }}
          transition={{
            duration: ball.duration,
            delay: ball.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <SoccerBallSvg />
        </motion.div>
      ))}
    </div>
  )
}
