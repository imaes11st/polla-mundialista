import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TimeUnits {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: Date | string
  onComplete?: () => void
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeUnits>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference > 0) {
        setTime({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        onComplete?.()
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      className="flex flex-col items-center"
      key={`${label}-${value}`}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-mundialYellow to-mundialBlue rounded-lg blur-md opacity-50" />
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg px-3 py-2 md:px-4 md:py-3 border border-mundialYellow/30">
          <span className="text-lg md:text-2xl font-bold text-mundialYellow">
            {String(value).padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-xs md:text-sm text-slate-400 mt-2 font-semibold uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  )

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      <TimeUnit value={time.days} label="Días" />
      <motion.span
        className="text-2xl md:text-4xl font-bold text-mundialYellow"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        :
      </motion.span>
      <TimeUnit value={time.hours} label="Horas" />
      <motion.span
        className="text-2xl md:text-4xl font-bold text-mundialYellow"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        :
      </motion.span>
      <TimeUnit value={time.minutes} label="Min" />
      <motion.span
        className="text-2xl md:text-4xl font-bold text-mundialYellow"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        :
      </motion.span>
      <TimeUnit value={time.seconds} label="Seg" />
    </div>
  )
}
