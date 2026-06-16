import { motion } from 'framer-motion'

interface LightBeam {
  id: number
  left: string
  rotation: number
  delay: number
  duration: number
  width: number
  color: string
}

const BEAMS: LightBeam[] = [
  { id: 0, left: '4%', rotation: -18, delay: 0, duration: 4.4, width: 190, color: 'rgba(255, 246, 188, 0.12)' },
  { id: 1, left: '18%', rotation: -10, delay: 0.7, duration: 5.2, width: 150, color: 'rgba(252, 209, 22, 0.09)' },
  { id: 2, left: '36%', rotation: -4, delay: 1.1, duration: 4.7, width: 170, color: 'rgba(255, 255, 255, 0.11)' },
  { id: 3, left: '58%', rotation: 5, delay: 0.3, duration: 5.4, width: 175, color: 'rgba(255, 246, 188, 0.1)' },
  { id: 4, left: '76%', rotation: 12, delay: 1.4, duration: 4.8, width: 155, color: 'rgba(252, 209, 22, 0.08)' },
  { id: 5, left: '92%', rotation: 19, delay: 0.9, duration: 5.1, width: 190, color: 'rgba(255, 255, 255, 0.09)' },
]

export function StadiumLights() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(252,209,22,0.45) 18%, rgba(255,255,255,0.8) 50%, rgba(206,17,38,0.32) 82%, transparent 100%)',
          boxShadow: '0 0 58px 18px rgba(252, 209, 22, 0.14)',
        }}
      />

      {BEAMS.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute -top-12 h-[115vh]"
          style={{
            left: beam.left,
            width: beam.width,
            transformOrigin: 'top center',
            background: `linear-gradient(180deg, ${beam.color} 0%, rgba(255,255,255,0.025) 42%, transparent 78%)`,
            clipPath: 'polygon(48% 0, 54% 0, 100% 100%, 0 100%)',
            filter: 'blur(7px)',
            mixBlendMode: 'screen',
          }}
          initial={{ rotate: beam.rotation, opacity: 0.45 }}
          animate={{
            rotate: [beam.rotation - 2, beam.rotation + 2, beam.rotation - 2],
            opacity: [0.28, 0.72, 0.28],
            scaleX: [0.88, 1.08, 0.88],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-emerald-500/[0.08] to-transparent" />
      <div className="absolute left-1/2 top-16 h-24 w-[70vw] -translate-x-1/2 rounded-full bg-mundialYellow/[0.08] blur-3xl" />
    </div>
  )
}
