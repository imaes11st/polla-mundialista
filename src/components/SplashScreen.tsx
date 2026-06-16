import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => onComplete?.(), 300)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  // Falling balls animation
  const ballVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: (i: number) => ({
      y: 600,
      opacity: [1, 1, 0],
      transition: {
        duration: 2.5,
        delay: i * 0.15,
        repeat: Infinity,
        repeatDelay: 2,
      },
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center overflow-hidden z-50"
    >
      {/* Stadium-like background with lights */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated light rays */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 bg-gradient-to-b from-yellow-300 to-transparent opacity-20"
            style={{
              left: `${(i / 12) * 100}%`,
              top: -100,
              height: 800,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          />
        ))}

        {/* Falling soccer balls */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`ball-${i}`}
            className="absolute text-4xl"
            custom={i}
            variants={ballVariants}
            initial="hidden"
            animate="visible"
            style={{
              left: `${20 + (i % 3) * 30}%`,
            }}
          >
            ⚽
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center px-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Logo/Title */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed">
            🏆 POLLA MUNDIALISTA
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-2">
            Familia Rincón
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-lg text-slate-300 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Cargando el Mundial...
        </motion.p>

        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-mundialYellow via-mundialBlue to-mundialRed"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'tween' }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-3">{Math.round(progress)}%</p>
        </div>
      </motion.div>

      {/* Bottom flags decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-around px-6"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.3 }}
        transition={{ delay: 0.4 }}
      >
        {['🇨🇴', '🇦🇷', '🇧🇷'].map((flag, i) => (
          <motion.div
            key={i}
            className="text-5xl"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          >
            {flag}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
