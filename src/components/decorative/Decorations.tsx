import { motion } from 'framer-motion'
import { floatVariants, rotateVariants } from '../../design/animations'
import { colors } from '../../design/tokens'

export function FloatingBall({ delay = 0, size = 80 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      variants={floatVariants}
      animate="animate"
      initial={{ y: 0 }}
      style={{
        transition: `delay ${delay}s`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <motion.div
        variants={rotateVariants}
        animate="animate"
        className="w-full h-full rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.primary.yellow}, ${colors.primary.blue})`,
          boxShadow: `0 0 ${size / 2}px rgba(252, 209, 22, 0.4)`,
        }}
      />
    </motion.div>
  )
}

export function StadiumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <FloatingBall key={i} delay={i * 2} size={40 + i * 30} />
      ))}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.primary.yellow}22, transparent 70%)`,
        }}
      />
    </div>
  )
}

export function ConfettiPiece({ delay = 0 }) {
  const randomX = Math.random() * 100
  const randomDuration = 2 + Math.random() * 1

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{
        backgroundColor: [colors.primary.yellow, colors.primary.blue, colors.primary.red][
          Math.floor(Math.random() * 3)
        ],
        left: `${randomX}%`,
        top: -10,
      }}
      animate={{
        y: window.innerHeight + 10,
        opacity: [1, 1, 0],
        x: randomX > 50 ? randomX + 50 : randomX - 50,
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: 'easeIn',
      }}
    />
  )
}

export function Confetti({ count = 30 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <ConfettiPiece key={i} delay={i * 0.05} />
      ))}
    </>
  )
}

export function AnimatedBall({ animate = true }) {
  return (
    <motion.div
      animate={animate ? { y: [0, -15, 0] } : {}}
      transition={{ duration: 0.6, repeat: Infinity }}
      className="inline-block"
    >
      <div
        className="w-6 h-6 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.primary.yellow}, ${colors.primary.blue})`,
          boxShadow: `0 0 15px ${colors.primary.yellow}80`,
        }}
      />
    </motion.div>
  )
}

export function TeamFlag({ flagUrl, name = 'team', size = 'md' }: { flagUrl: string; name?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-6 h-4',
    md: 'w-10 h-6',
    lg: 'w-16 h-10',
  }

  // Fallback por si en algún caso extremo la url llega vacía
  const finalSrc = flagUrl || `https://flagcdn.com/un.svg`

  return (
    <img
      src={finalSrc}
      alt={name}
      className={`${sizeMap[size]} rounded-sm object-cover shadow-sm`}
      onError={(e) => {
        // Por si alguna imagen de la API falla en cargar en el cliente, 
        // evita que se vea el icono de imagen rota poniendo una bandera por defecto
        (e.target as HTMLImageElement).src = 'https://flagcdn.com/un.svg'
      }}
    />
  )
}

export function Medal({ position = 1 }) {
  const colors_medal = {
    1: { bg: '#fbbf24', text: '#78350f' },
    2: { bg: '#e5e7eb', text: '#1f2937' },
    3: { bg: '#fdba74', text: '#7c2d12' },
  }

  const medal = colors_medal[position as keyof typeof colors_medal] || colors_medal[1]
  const label = ['🥇', '🥈', '🥉'][position - 1] || '🏆'

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-xl"
      style={{ backgroundColor: medal.bg, color: medal.text }}
    >
      {label}
    </motion.div>
  )
}
