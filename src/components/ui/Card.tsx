import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { glassCardVariants } from '../../design/animations'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'sport' | 'dark' | 'glass'
  interactive?: boolean
}

export function Card({
  children,
  className = '',
  variant = 'default',
  interactive = false,
}: CardProps) {
  const variantStyles = {
    default: 'rounded-2xl md:rounded-3xl border border-white/[0.08] bg-slate-950/70 p-5 shadow-glass backdrop-blur-glass',
    sport: 'rounded-2xl md:rounded-3xl border border-mundialYellow/20 bg-gradient-to-br from-slate-950/90 to-slate-900/80 p-5 shadow-glass-lg backdrop-blur-glass',
    dark: 'rounded-2xl md:rounded-3xl border border-white/[0.05] bg-black/40 p-5 shadow-glass backdrop-blur-glass',
    glass: 'glass-card rounded-2xl md:rounded-3xl p-5',
  }

  return (
    <motion.div
      variants={glassCardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={
        interactive
          ? {
              y: -3,
              borderColor: 'rgba(252, 209, 22, 0.2)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 20px rgba(252, 209, 22, 0.08)',
            }
          : {}
      }
      className={`${variantStyles[variant]} transition-colors duration-300 ${className}`}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  )
}
