import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeInUp } from '../../design/animations'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'sport' | 'dark'
  interactive?: boolean
}

export function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
}: CardProps) {
  const variantStyles = {
    default: 'rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-sports',
    sport: 'rounded-3xl border-2 border-mundialYellow/50 bg-gradient-to-br from-slate-950 to-slate-900 p-5 shadow-lg',
    dark: 'rounded-3xl border border-white/5 bg-black/50 p-5 shadow-md',
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      whileHover={interactive ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' } : {}}
      className={`${variantStyles[variant]} ${className}`}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      {children}
    </motion.div>
  )
}
