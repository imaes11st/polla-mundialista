import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { SpecialQuestionCard } from '../components/SpecializedComponents'
import { supabaseService } from '../services/supabase'
import { useCurrentParticipant } from '../hooks/useCurrentParticipant'

interface SpecialQuestion {
  id: string
  question: string
  type: 'team' | 'player' | 'text'
  points: number
  answered: boolean
  answer?: string
}

export function SpecialQuestionsPage() {
  const queryClient = useQueryClient()
  const { participant } = useCurrentParticipant()

  // 1. Obtener torneos para saber cuál es el activo
  const { data: tournaments, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['tournaments-special'],
    queryFn: () => supabaseService.listTournaments().then((res) => res.data || []),
  })

  const activeTournamentId = useMemo(() => 
    tournaments?.find((t: any) => t.is_active)?.id || tournaments?.[0]?.id || '',
    [tournaments]
  )

  // 2. Obtener preguntas especiales de la base de datos
  const { data: dbQuestions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['special-questions', activeTournamentId],
    queryFn: () => supabaseService.listSpecialQuestions(activeTournamentId).then((res) => res.data || []),
    enabled: !!activeTournamentId,
  })

  // 3. Obtener respuestas de este participante
  const { data: dbAnswers = [], isLoading: isLoadingAnswers } = useQuery({
    queryKey: ['special-answers', participant?.id],
    queryFn: () => supabaseService.listSpecialAnswers(participant?.id || '').then((res) => res.data || []),
    enabled: !!participant?.id,
  })

  // 3b. Obtener todos los equipos de la base de datos para los combos de selección
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams-list-specials'],
    queryFn: () => supabaseService.listTeams().then((res) => res.data || []),
  })

  // 4. Mutation para guardar respuestas en la DB
  const saveAnswerMutation = useMutation({
    mutationFn: async (payload: { question_id: string; participant_id: string; answer: string }) => {
      const { data, error } = await supabaseService.saveSpecialAnswer(payload)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['special-answers', participant?.id],
      })
    },
  })

  // 5. Mapear preguntas con las respuestas correspondientes
  const questions = useMemo(() => {
    return dbQuestions.map((q: any) => {
      const userAnswer = dbAnswers.find((a: any) => a.question_id === q.id)
      return {
        id: q.id,
        question: q.question,
        type: q.type as 'team' | 'player' | 'text',
        points: q.points,
        answered: !!userAnswer,
        answer: userAnswer?.answer || '',
      }
    })
  }, [dbQuestions, dbAnswers])

  const handleAnswer = (questionId: string, answer: string) => {
    if (!participant?.id) return
    saveAnswerMutation.mutate({
      question_id: questionId,
      participant_id: participant.id,
      answer,
    })
  }

  const answeredCount = questions.filter((q) => q.answered).length
  const totalPoints = questions.reduce((sum, q) => (q.answered ? sum + q.points : sum), 0)

  if (isLoadingTournaments || isLoadingQuestions || isLoadingAnswers || isLoadingTeams) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-bold text-white animate-pulse">⏰ Cargando preguntas especiales...</div>
      </div>
    )
  }

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
              teams={teams}
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
