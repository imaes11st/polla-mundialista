import { motion } from 'framer-motion'
import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <motion.input
      {...(props as any)}
      whileFocus={{ scale: 1.02 } as any}
      className={`w-full rounded-3xl border-2 border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-mundialYellow focus:ring-2 focus:ring-mundialYellow/25 focus:shadow-lg ${className}`}
      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' } as any}
    />
  )
}
