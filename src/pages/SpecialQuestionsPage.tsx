import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SpecialQuestionCard } from '../components/SpecializedComponents'

interface SpecialQuestion {
  id: string
  question: string
  type: 'team' | 'player' | 'text'
  points: number
  answered: boolean
  answer?: string
}

export function SpecialQuestionsPage() {
  const [questions, setQuestions] = useState<SpecialQuestion[]>([
    {
      id: '1',
      question: '¿Quién será el Campeón del Mundo?',
      type: 'team',
      points: 10,
      answered: false,
    },
    {
      id: '2',
      question: 'Finalista 1: ¿Qué equipo llegará a la Gran Final?',
      type: 'team',
      points: 5,
      answered: false,
    },
    {
      id: '3',
      question: 'Finalista 2: ¿Qué otro equipo llegará a la Gran Final?',
      type: 'team',
      points: 5,
      answered: false,
    },
    {
      id: '4',
      question: '¿Quién será el Goleador del Campeonato?',
      type: 'player',
      points: 8,
      answered: false,
    },
    {
      id: '5',
      question: '¿Quién será el Goleador de la Selección Colombia?',
      type: 'player',
      points: 5,
      answered: false,
    },
    {
      id: '6',
      question: 'El Gran Duelo: ¿Quién llegará más lejos, Messi o Cristiano Ronaldo?',
      type: 'text',
      points: 5,
      answered: false,
    },
  ])

  const handleAnswer = (questionId: string, answer: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, answered: true, answer }
          : q
      )
    )
  }

  const answeredCount = questions.filter((q) => q.answered).length
  const totalPoints = questions.reduce((sum, q) => (q.answered ? sum + q.points : sum), 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-mundialYellow">
            🎯 Pronósticos Especiales
          </p>
          <h1 className="text-4xl font-black text-white">Preguntas Especiales del Torneo</h1>
          <p className="text-slate-400 mb-4">
            Responde a estas preguntas especiales y gana puntos extras. Tienes oportunidad de ganar 
            {' '}
            <span className="font-bold text-mundialYellow">{questions.reduce((s, q) => s + q.points, 0)} puntos</span>
            {' '}
            en total.
          </p>

          {/* Progress */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Completadas</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-mundialYellow">{answeredCount}</span>
                <span className="text-slate-400">/ {questions.length}</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Puntos Acumulados</p>
              <p className="text-3xl font-black text-mundialYellow">{totalPoints}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Puntos Disponibles</p>
              <p className="text-3xl font-black text-green-400">
                +{questions.reduce((s, q) => s + (q.answered ? 0 : q.points), 0)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions */}
      <motion.div
        className="grid gap-4 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {questions.map((question) => (
          <motion.div key={question.id} variants={itemVariants}>
            <SpecialQuestionCard
              question={question.question}
              type={question.type}
              points={question.points}
              answered={question.answered}
              answer={question.answer}
              onAnswer={(answer) => handleAnswer(question.id, answer)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      {answeredCount === questions.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6"
        >
          <div className="text-center">
            <p className="text-2xl font-black text-green-400 mb-2">
              ✅ ¡Todas las preguntas respondidas!
            </p>
            <p className="text-green-300">
              Tus respuestas se guardarán automáticamente. Los resultados se revelarán cuando el torneo termine.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
