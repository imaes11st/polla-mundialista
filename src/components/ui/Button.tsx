import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { colors } from '../../design/tokens'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold uppercase tracking-[0.12em] transition'
  const variantStyles = {
    primary: `bg-mundialYellow text-slate-950 hover:bg-yellow-400 active:scale-95`,
    secondary: `border-2 border-mundialYellow text-mundialYellow hover:bg-mundialYellow/10`,
    ghost: `text-white hover:bg-white/10 active:scale-95`,
  }
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-full',
    md: 'px-5 py-3 text-sm rounded-full',
    lg: 'px-6 py-4 text-base rounded-full',
  }

  return (
    <motion.button
      {...(props as any)}
      whileHover={{ scale: 1.02 } as any}
      whileTap={{ scale: 0.98 } as any}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{
        boxShadow: variant === 'primary' ? `0 10px 25px rgba(252, 209, 22, 0.2)` : 'none',
      } as any}
      disabled={loading || props.disabled}
    >
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
