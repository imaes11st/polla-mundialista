import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  glow?: boolean
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold uppercase tracking-[0.1em] transition-all overflow-hidden'

  const variantStyles = {
    primary: `bg-gradient-to-r from-mundialYellow via-yellow-400 to-mundialYellow text-slate-950 hover:shadow-glow-yellow active:scale-[0.97]`,
    secondary: `border-2 border-mundialYellow/50 text-mundialYellow hover:bg-mundialYellow/10 hover:border-mundialYellow active:scale-[0.97]`,
    ghost: `text-white hover:bg-white/10 active:scale-[0.97]`,
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-xl gap-2',
    md: 'px-5 py-3 text-sm rounded-2xl gap-2',
    lg: 'px-7 py-4 text-base rounded-2xl gap-3',
  }

  return (
    <motion.button
      {...(props as any)}
      whileHover={{ scale: props.disabled ? 1 : 1.02 }}
      whileTap={{ scale: props.disabled ? 1 : 0.97 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        glow ? 'animate-glow-pulse' : ''
      } ${props.disabled ? 'opacity-50 cursor-not-allowed saturate-50' : ''} ${className}`}
      disabled={loading || props.disabled}
    >
      {/* Shimmer overlay for primary buttons */}
      {variant === 'primary' && !props.disabled && (
        <span
          className="pointer-events-none absolute inset-0 animate-shimmer"
          style={{
            background:
              'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
            backgroundSize: '200% auto',
          }}
          aria-hidden="true"
        />
      )}

      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      )}
      {children}
    </motion.button>
  )
}
