import React, { useEffect, useRef, useState } from 'react'
import { AlbumClosingScene } from './components/AlbumClosingScene'
import { FinalLetterScene } from './components/FinalLetterScene'
import { FinalMenu } from './components/FinalMenu'
import { GameLayout } from './components/GameLayout'
import { GiftScene } from './components/GiftScene'
import { PhotoAlbum } from './components/PhotoAlbum'
import { QuestionRenderer } from './components/QuestionRenderer'
import { PasswordGate } from './components/PasswordGate'
import { ResumeMenu } from './components/ResumeMenu'
import { narratives } from './data/narratives'
import { questions } from './data/questions'
import { buildWishesSnapshot, createSubmissionSessionId, submitQuestionnaireSnapshot } from './lib/gameSubmission'
import { playInterfaceClick, startGameMusic } from './lib/gameAudio'
import { ensureSupabaseAnonymousSession } from './lib/supabase'
import type { AnswerMap, AnswerValue, GameState, NarrativeKind, Reaction } from './types/game'
import { clearGameState, initialState, loadGameState, saveGameState } from './utils/storage'

const introText = 'Oh... parece que no pude identificar quién eres.\n\nEste regalo es exclusivamente para una persona muy especial.\n\nAsí que, para saber si realmente eres tú, vamos a hacer una pequeña verificación.'
const introGiftBeats = [
  { text: 'Espera.', pose: 'alert' as const },
  { text: 'No puedes abrir eso todavía.', pose: 'talking' as const },
  { text: 'Necesito asegurarme de que realmente eres quien dices ser.', pose: 'thinking' as const },
  { text: 'Sí.', pose: 'talking' as const },
  { text: 'Para entregarte un regalo.', pose: 'pointing' as const },
  { text: 'No, yo tampoco hice las reglas.', pose: 'concerned' as const },
  { text: 'Bueno... técnicamente el desarrollador sí.', pose: 'talking' as const },
]
const wishThreeIntro = [
  { text: 'Otra vez.', pose: 'talking' as const },
  { text: 'Este es el último.', pose: 'thinking' as const },
  { text: 'Según las reglas, puedes pedirle una cosa más al desarrollador.', pose: 'pointing' as const },
  { text: 'Así que piensa bien antes de desperdiciarlo.', pose: 'concerned' as const },
]
const q26IntroBeats = [
  { text: 'La siguiente prueba es especialmente importante.', pose: 'determined' as const },
  { text: 'De esto depende que pueda confirmar si realmente eres Brittany.', pose: 'thinking' as const },
  { text: 'Vas a escuchar cuatro opciones.', pose: 'talking' as const },
  { text: 'Escoge una.', pose: 'pointing' as const },
]
const closingBeats = [
  { text: 'Bien.', pose: 'happy' as const },
  { text: 'Solo queda una comprobación.', pose: 'talking' as const },
  { text: 'Y tengo la sospecha de que esta será importante.', pose: 'concerned' as const },
]
const finalIdentityBeats = [
  { text: 'Muy bien.', pose: 'happy' as const },
  { text: 'Eres tú.', pose: 'happy' as const },
  { text: 'Aunque, para ser justa...', pose: 'thinking' as const },
  { text: 'Lo sabía desde la primera pregunta.', pose: 'talking' as const },
  { text: 'Todo esto fue completamente innecesario.', pose: 'concerned' as const },
  { text: 'Pero creo que el desarrollador quería hacerte perder el tiempo un rato.', pose: 'talking' as const },
  { text: 'Y quizá hacerte sonreír un poquito.', pose: 'happy' as const },
]
const albumClosingBeats = [
  { text: 'Espera.', pose: 'surprised' as const },
  { text: 'Todavía hay algo más para ti.', pose: 'talking' as const },
  { text: 'Creo que esto debería decírtelo él.', pose: 'concerned' as const },
]
const normalizeAnswer = (value: AnswerValue) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
const q32NegativeAnswers = new Set(['nada', 'ninguna', 'ninguna cualidad', 'no tengo', 'no tengo ninguna', 'no se'])
const empty = (value: AnswerValue) => Array.isArray(value)
  ? value.some(item => !item.trim())
  : typeof value === 'object'
    ? value.selected
      ? value.selected.length !== 3 || (value.selected.includes('Otra cosa...') && !value.customText?.trim())
      : value.option === 'Otra cosa...' && !value.customText?.trim()
    : !String(value).trim()

export default function App() {
  const [state, setState] = useState<GameState>(loadGameState)
  const [authenticated, setAuthenticated] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [passwordTransitioning, setPasswordTransitioning] = useState(false)
  const [draft, setDraft] = useState<AnswerValue | null>(null)
  const [wishDraft, setWishDraft] = useState('')
  const [giftTransitioning, setGiftTransitioning] = useState(false)
  const submissionInFlight = useRef(false)
  const submissionRetryStarted = useRef(false)
  const q = questions[state.questionIndex]

  useEffect(() => { saveGameState(state) }, [state])
  useEffect(() => { void ensureSupabaseAnonymousSession() }, [])
  useEffect(() => {
    const playClick = (event: MouseEvent) => {
      const control = (event.target as HTMLElement | null)?.closest('button, [role="button"]')
      if (!control || (control instanceof HTMLButtonElement && control.disabled)) return
      playInterfaceClick()
    }
    document.addEventListener('click', playClick)
    return () => document.removeEventListener('click', playClick)
  }, [])
  useEffect(() => {
    if (state.screen !== 'developer-wish') return
    setWishDraft(state.activeWish === 1 ? state.wishes.first : state.activeWish === 2 ? state.wishes.second : state.wishes.third)
  }, [state.screen, state.activeWish, state.wishes])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && state.screen === 'narrative') {
        event.preventDefault()
        advanceNarrative()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || state.screen !== 'question' || state.reaction || q.type !== 'text') return
      event.preventDefault()
      submit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  useEffect(() => {
    if (state.screen !== 'question' || q.id !== 'q28_no_tocar' || !state.q28Alert) return
    const alertTimer = window.setTimeout(() => {
      setState(current => {
        if (!current.q28Alert) return current
        const q28 = questions.find(question => question.id === 'q28_no_tocar')!
        return {
          ...current,
          answers: { ...current.answers, [q28.id]: 'pressed' },
          phase: q28.phase,
          progress: q28.progressPercent,
          q28Alert: false,
          reaction: q28.getReaction('pressed'),
          reactionBeat: 0,
        }
      })
    }, 700)
    return () => window.clearTimeout(alertTimer)
  }, [state.q28Alert, state.questionIndex, state.screen])
  useEffect(() => {
    if (state.screen !== 'final-processing') return
    const nextStage = state.finalStage === 'processing-997' ? 'processing-998' : state.finalStage === 'processing-998' ? 'hang' : null
    if (!nextStage) return
    const timer = window.setTimeout(() => setState(current => {
      if (current.screen !== 'final-processing' || current.finalStage !== state.finalStage) return current
      return { ...current, finalStage: nextStage, progress: nextStage === 'processing-998' ? 99.8 : 99.9 }
    }), 650)
    return () => window.clearTimeout(timer)
  }, [state.screen, state.finalStage])
  useEffect(() => {
    if (state.screen !== 'question' || state.q22Stage !== 'overflow' || state.q22OverflowReady) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setState(current => current.q22Stage === 'overflow' ? { ...current, q22OverflowReady: true } : current), reducedMotion ? 40 : 850)
    return () => window.clearTimeout(timer)
  }, [state.screen, state.q22Stage, state.q22OverflowReady])

  const buildAnswersSnapshot = (answers: AnswerMap) => questions.reduce<Record<string, AnswerValue>>((snapshot, question) => {
    if (Object.prototype.hasOwnProperty.call(answers, question.id)) snapshot[question.id] = answers[question.id]
    return snapshot
  }, {})
  const syncQuestionnaireSubmission = (sessionId: string, answers: AnswerMap, wishes: GameState['wishes']) => {
    if (submissionInFlight.current) return
    submissionInFlight.current = true
    void submitQuestionnaireSnapshot({ sessionId, answers: buildAnswersSnapshot(answers), wishes: buildWishesSnapshot(wishes) })
      .then(synced => {
        setState(current => {
          if (current.submissionSessionId !== sessionId) return current
          return synced
            ? { ...current, submissionPending: false, answersSubmitted: true }
            : { ...current, submissionPending: true, answersSubmitted: false }
        })
      })
      .catch(() => {
        setState(current => current.submissionSessionId === sessionId
          ? { ...current, submissionPending: true, answersSubmitted: false }
          : current)
      })
      .finally(() => { submissionInFlight.current = false })
  }
  const beginQuestionnaireSubmission = () => {
    const sessionId = state.submissionSessionId ?? createSubmissionSessionId()
    submissionRetryStarted.current = true
    setState(current => ({
      ...current,
      questionnaireCompleted: true,
      submissionSessionId: sessionId,
      submissionPending: true,
      answersSubmitted: false,
      screen: 'final-processing',
      reaction: null,
      reactionBeat: 0,
      finalStage: 'processing-997',
      finalBeat: 0,
      phase: 'VERIFICACIÓN FINAL',
      progress: 99.7,
    }))
    syncQuestionnaireSubmission(sessionId, state.answers, state.wishes)
  }
  useEffect(() => {
    if (!state.questionnaireCompleted || !state.submissionPending || state.answersSubmitted || submissionRetryStarted.current) return
    const sessionId = state.submissionSessionId ?? createSubmissionSessionId()
    submissionRetryStarted.current = true
    if (!state.submissionSessionId) {
      setState(current => current.submissionSessionId ? current : { ...current, submissionSessionId: sessionId })
    }
    syncQuestionnaireSubmission(sessionId, state.answers, state.wishes)
  }, [state.questionnaireCompleted, state.submissionPending, state.answersSubmitted, state.submissionSessionId])

  const reset = () => {
    clearGameState()
    setState(initialState)
    setDraft(null)
  }
  const startNarrative = (kind: NarrativeKind) => setState(current => ({ ...current, screen: 'narrative', reaction: null, reactionBeat: 0, narrative: { kind, beat: 0 } }))
  const begin = () => {
    setState(current => ({ ...current, screen: 'question', questionIndex: 0, phase: questions[0].phase, progress: 0, reaction: null, reactionBeat: 0 }))
    setDraft(null)
  }
  const hasMeaningfulProgress = (saved: GameState) => saved.screen !== 'start' || saved.introGiftStarted || saved.progress > 0 || Object.keys(saved.answers).length > 0 || Object.values(saved.wishes).some(Boolean)
  const authenticate = () => {
    startGameMusic()
    setPasswordTransitioning(true)
    window.setTimeout(() => {
      if (state.briefCompleted) {
        setState(current => ({ ...current, screen: 'final-menu', finalStage: 'final-menu', progress: 100 }))
      } else if (hasMeaningfulProgress(state)) {
        setShowResume(true)
      }
      setAuthenticated(true)
      setPasswordTransitioning(false)
    }, 330)
  }
  const startGiftDialogue = () => setState(current => ({ ...current, introGiftStarted: true, introGiftBeat: 0 }))
  const advanceGiftDialogue = () => {
    if (state.introGiftBeat < introGiftBeats.length - 1) return setState(current => ({ ...current, introGiftBeat: current.introGiftBeat + 1 }))
    begin()
  }
  const submit = (skip = false) => {
    const answer: AnswerValue = skip ? { option: 'skipped' } : (draft ?? state.answers[q.id] ?? (q.type === 'slider' ? 50 : q.type === 'multi-text' ? ['', '', ''] : q.type === 'multi-select' ? { selected: [], customText: '' } : ''))
    if (!skip && empty(answer)) return
    if (q.id === 'q32_cualidad' && !skip && q32NegativeAnswers.has(normalizeAnswer(answer)) && state.answers.q32_cualidad_retry !== 'attempted') {
      setState(current => ({ ...current, answers: { ...current.answers, q32_cualidad_retry: 'attempted' }, reaction: { text: 'Hmm.', pose: 'thinking', action: 'retry', beats: [{ text: 'Hmm.', pose: 'thinking' }, { text: 'No te creo mucho.', pose: 'concerned' }, { text: 'Inténtalo una vez más.', pose: 'talking' }] }, reactionBeat: 0 }))
      return
    }
    const reaction = q.getReaction(answer, skip)
    if (reaction.action === 'retry') {
      setState(current => ({ ...current, reaction, reactionBeat: 0 }))
      return
    }
    setState(current => ({ ...current, answers: { ...current.answers, [q.id]: answer }, progress: q.progressPercent, phase: q.phase, reaction, reactionBeat: 0, questionnaireCompleted: q.number === 40 ? true : current.questionnaireCompleted, q22Stage: q.id === 'q22_inteligencia' ? 'intro' : current.q22Stage, q22OverflowReady: q.id === 'q22_inteligencia' ? false : current.q22OverflowReady }))
  }
  const advanceQ22Overflow = () => {
    if (state.screen !== 'question' || q.id !== 'q22_inteligencia' || state.q22Stage !== 'overflow') return
    if (!state.q22OverflowReady) return
    setState(current => ({ ...current, q22Stage: 'final', q22OverflowReady: false, reaction: { text: 'Sí.', pose: 'happy', action: 'q22', beats: [{ text: 'Sí.', pose: 'happy' }, { text: 'Más o menos por aquí.', pose: 'talking' }] }, reactionBeat: 0 }))
  }
  const skipCurrentInput = () => {
    if (!import.meta.env.DEV) return
    if (state.screen === 'developer-wish') {
      setWishDraft('')
      if (state.activeWish === 1) return startNarrative('malecon')
      if (state.activeWish === 2) {
        setState(current => ({ ...current, screen: 'question', questionIndex: 20, phase: questions[20].phase, activeWish: null, reaction: null, reactionBeat: 0, progress: questions[20].progressPercent }))
        return
      }
      setState(current => ({ ...current, screen: 'question', questionIndex: 30, phase: questions[30].phase, activeWish: null, wishIntroBeat: null, reaction: null, reactionBeat: 0, progress: questions[30].progressPercent }))
      return
    }
    if (state.screen !== 'question' || state.reaction || (q.id === 'q28_no_tocar' && state.q28Alert)) return
    if (q.number === 10) {
      setState(current => ({ ...current, screen: 'developer-wish', activeWish: 1, reaction: null, reactionBeat: 0 }))
      setDraft(null)
      return
    }
    if (q.number === 13) { startNarrative('it-takes-two'); setDraft(null); return }
    if (q.number === 15) { startNarrative('medical-intro'); setDraft(null); return }
    if (q.number === 18) { startNarrative('medical-alert'); setDraft(null); return }
    if (q.number === 20) {
      setState(current => ({ ...current, screen: 'developer-wish', activeWish: 2, reaction: null, reactionBeat: 0 }))
      setDraft(null)
      return
    }
    if (q.number === 30) {
      setState(current => ({ ...current, screen: 'developer-wish', activeWish: 3, wishIntroBeat: 0, reaction: null, reactionBeat: 0, progress: 75 }))
      setDraft(null)
      return
    }
    if (q.number === 40) {
      setState(current => ({ ...current, screen: 'final-processing', reaction: null, reactionBeat: 0, finalStage: 'processing-997', finalBeat: 0, phase: 'VERIFICACIÓN FINAL', progress: 99.7 }))
      setDraft(null)
      return
    }
    const nextIndex = state.questionIndex + 1
    const nextQuestion = questions[nextIndex]
    if (!nextQuestion) return
    const enteringQ26 = nextQuestion.id === 'q26_audio'
    setState(current => ({ ...current, questionIndex: nextIndex, phase: nextQuestion.phase, progress: nextQuestion.progressPercent, reaction: null, reactionBeat: 0, q28Alert: false, q22Stage: 'idle', q26IntroBeat: enteringQ26 && !current.q26IntroSeen ? 0 : null }))
    setDraft(null)
  }
  const pressForbiddenButton = () => {
    setState(current => ({
      ...current,
      answers: { ...current.answers, [q.id]: 'pressed' },
      phase: q.phase,
      progress: q.progressPercent,
      reaction: null,
      reactionBeat: 0,
      q28Alert: true,
    }))
  }
  const nextAfterQuestion = () => {
    if (state.reaction?.beats && state.reactionBeat < state.reaction.beats.length - 1) {
      setState(current => ({ ...current, reactionBeat: current.reactionBeat + 1 }))
      return
    }
    if (q.number === 22 && state.q22Stage === 'intro' && state.reaction?.action === 'q22') {
      setState(current => ({ ...current, reaction: null, reactionBeat: 0, q22Stage: 'overflow', q22OverflowReady: false }))
      return
    }
    if (state.reaction?.action === 'retry') {
      setState(current => ({ ...current, reaction: null, reactionBeat: 0 }))
      setDraft(null)
      return
    }
    if (q.number === 10) return setState(current => ({ ...current, screen: 'developer-wish', activeWish: 1, reaction: null, reactionBeat: 0 }))
    if (q.number === 13) return startNarrative('it-takes-two')
    if (q.number === 15) return startNarrative('medical-intro')
    if (q.number === 18) return startNarrative('medical-alert')
    if (q.number === 20) return setState(current => ({ ...current, screen: 'developer-wish', activeWish: 2, reaction: null, reactionBeat: 0 }))
    if ((q.number >= 21 && q.number <= 29) || (q.number >= 31 && q.number <= 39)) {
      setState(current => {
        const nextQuestion = questions[current.questionIndex + 1]
        const enteringQ26 = nextQuestion.id === 'q26_audio'
        return { ...current, questionIndex: current.questionIndex + 1, phase: nextQuestion.phase, progress: nextQuestion.progressPercent, reaction: null, reactionBeat: 0, q22Stage: 'idle', q26IntroBeat: enteringQ26 && !current.q26IntroSeen ? 0 : null }
      })
      setDraft(null)
      return
    }
    if (q.number === 30) return setState(current => ({ ...current, screen: 'developer-wish', activeWish: 3, wishIntroBeat: 0, reaction: null, reactionBeat: 0, progress: 75 }))
    if (q.number === 40) return beginQuestionnaireSubmission()
    setState(current => ({ ...current, questionIndex: current.questionIndex + 1, phase: questions[current.questionIndex + 1].phase, reaction: null, reactionBeat: 0 }))
    setDraft(null)
  }
  const back = () => {
    if (state.reaction) {
      setState(current => ({ ...current, reaction: null, reactionBeat: 0, q22Stage: q.id === 'q22_inteligencia' ? 'idle' : current.q22Stage }))
      setDraft(null)
      return
    }
    if (state.questionIndex > 0) {
      setState(current => {
        const previousQuestion = questions[current.questionIndex - 1]
        return { ...current, questionIndex: current.questionIndex - 1, phase: previousQuestion.phase, progress: previousQuestion.progressPercent, q28Alert: false, q22Stage: 'idle', q26IntroBeat: null }
      })
      setDraft(null)
    }
  }
  const advanceNarrative = () => {
    const narrative = state.narrative
    if (!narrative) return
    const definition = narratives[narrative.kind]
    if (narrative.beat < definition.beats.length - 1) {
      setState(current => ({ ...current, narrative: current.narrative ? { ...current.narrative, beat: current.narrative.beat + 1 } : null }))
      return
    }
    setState(current => ({
      ...current,
      screen: 'question',
      questionIndex: definition.targetIndex,
      phase: questions[definition.targetIndex].phase,
      narrative: null,
      phaseIntrosCompleted: narrative.kind === 'medical-intro' ? { ...current.phaseIntrosCompleted, medical: true } : current.phaseIntrosCompleted,
    }))
  }
  const advanceQ26Intro = () => {
    if (state.q26IntroBeat === null) return
    if (state.q26IntroBeat < q26IntroBeats.length - 1) {
      setState(current => ({ ...current, q26IntroBeat: current.q26IntroBeat === null ? null : current.q26IntroBeat + 1 }))
      return
    }
    setState(current => ({ ...current, q26IntroBeat: null, q26IntroSeen: true }))
  }
  const advanceWishIntro = () => {
    if (state.wishIntroBeat === null) return
    if (state.wishIntroBeat < wishThreeIntro.length - 1) {
      setState(current => ({ ...current, wishIntroBeat: current.wishIntroBeat === null ? null : current.wishIntroBeat + 1 }))
      return
    }
    setState(current => ({ ...current, wishIntroBeat: null }))
  }
  const submitWish = () => {
    const key = state.activeWish === 1 ? 'first' : state.activeWish === 2 ? 'second' : 'third'
    const reaction = state.activeWish === 1
      ? { text: 'Enviado.\n\nLo que pase ahora es entre tú y él.', pose: 'talking' as const, action: 'wish-next' as const }
      : state.activeWish === 2
        ? { text: 'Enviado.\n\nEspero sinceramente que hayas pedido algo caro.', pose: 'talking' as const, action: 'wish-next' as const }
        : { text: 'Enviado.', pose: 'talking' as const, action: 'wish-next' as const, beats: [{ text: 'Enviado.', pose: 'talking' as const }, { text: 'Ya tienes tres.', pose: 'thinking' as const }, { text: 'Personalmente creo que esto fue una pésima decisión contractual.', pose: 'concerned' as const }] }
    setState(current => ({ ...current, wishes: { ...current.wishes, [key]: wishDraft }, reaction, reactionBeat: 0 }))
  }
  const advanceWish = () => {
    if (state.reaction?.beats && state.reactionBeat < state.reaction.beats.length - 1) {
      setState(current => ({ ...current, reactionBeat: current.reactionBeat + 1 }))
      return
    }
    if (state.activeWish === 1) startNarrative('malecon')
    else if (state.activeWish === 2) setState(current => ({ ...current, screen: 'question', questionIndex: 20, phase: questions[20].phase, activeWish: null, reaction: null, reactionBeat: 0, progress: 50 }))
    else setState(current => ({ ...current, screen: 'question', questionIndex: 30, phase: questions[30].phase, activeWish: null, wishIntroBeat: null, reaction: null, reactionBeat: 0, progress: questions[30].progressPercent }))
  }
  const advanceEndNarrative = () => {
    if (state.endBeat < closingBeats.length - 1) {
      setState(current => ({ ...current, endBeat: current.endBeat + 1 }))
      return
    }
    setState(current => ({ ...current, screen: 'end', endBeat: 0, progress: 97.5 }))
  }
  const advanceFinalProcessing = () => {
    if (state.finalStage === 'hang') return setState(current => ({ ...current, finalStage: 'hang-complaint' }))
    if (state.finalStage === 'hang-complaint') return setState(current => ({ ...current, finalStage: 'intervention-first' }))
    if (state.finalStage === 'intervention-first') return setState(current => ({ ...current, finalStage: 'intervention-push' }))
    if (state.finalStage === 'intervention-push') return setState(current => ({ ...current, finalStage: 'complete-100', progress: 100 }))
    if (state.finalStage === 'complete-100') return setState(current => ({ ...current, screen: 'identity-confirmed', finalStage: 'identity-confirmed', finalBeat: 0, progress: 100 }))
  }
  const advanceIdentity = () => {
    if (state.finalBeat < finalIdentityBeats.length - 1) return setState(current => ({ ...current, finalBeat: current.finalBeat + 1 }))
    setState(current => ({ ...current, screen: 'gift-unlocked', finalStage: 'gift-unlocked', progress: 100 }))
  }
  const openPhotoAlbum = () => setState(current => ({ ...current, screen: 'album', finalStage: 'album', albumBeat: 0, progress: 100 }))
  const openFinalLetter = () => setState(current => ({ ...current, screen: 'letter', finalStage: 'letter', progress: 100 }))
  const openFinalMenu = () => setState(current => ({ ...current, screen: 'final-menu', finalStage: 'final-menu', progress: 100 }))
  const completeExperience = () => setState(current => ({ ...current, screen: 'final-menu', finalStage: 'final-menu', progress: 100, briefCompleted: true }))
  const replayQuestionnaire = () => {
    setState(current => ({
      ...current,
      screen: 'question',
      questionIndex: 0,
      phase: questions[0].phase,
      progress: 0,
      reaction: null,
      reactionBeat: 0,
      narrative: null,
      activeWish: null,
      wishIntroBeat: null,
      q22Stage: 'idle',
      q22OverflowReady: false,
      q26IntroBeat: null,
      q28Alert: false,
    }))
    setDraft(null)
  }
  const restartFromGiftIntro = () => {
    setState(current => ({
      ...current,
      screen: 'start',
      questionIndex: 0,
      phase: null,
      progress: 0,
      reaction: null,
      reactionBeat: 0,
      narrative: null,
      activeWish: null,
      wishIntroBeat: null,
      q22Stage: 'idle',
      q22OverflowReady: false,
      q26IntroBeat: null,
      q28Alert: false,
      introGiftStarted: false,
      introGiftBeat: 0,
    }))
    setDraft(null)
  }
  const activateFinalGift = () => {
    setGiftTransitioning(true)
    window.setTimeout(() => openPhotoAlbum(), 760)
    window.setTimeout(() => setGiftTransitioning(false), 1450)
  }
  const finishAlbum = () => setState(current => ({ ...current, screen: 'album-closing', finalStage: 'album-closing', albumBeat: 0, progress: 100 }))
  const advanceAlbumClosing = () => {
    if (state.albumBeat < albumClosingBeats.length - 1) return setState(current => ({ ...current, albumBeat: current.albumBeat + 1 }))
    openFinalLetter()
  }

  if (!authenticated) return <PasswordGate onAuthenticated={authenticate} leaving={passwordTransitioning} />
  if (showResume) return <ResumeMenu questionNumber={state.screen === 'question' ? questions[state.questionIndex]?.number ?? null : null} onContinue={() => setShowResume(false)} onStartOver={() => { restartFromGiftIntro(); setShowResume(false) }} />
  if (state.screen === 'start' && !state.introGiftStarted) return <GiftScene mode="locked" onGiftClick={startGiftDialogue} />
  if (state.screen === 'start' && state.introGiftStarted) { const beat = introGiftBeats[state.introGiftBeat]; return <GiftScene mode="locked" started dialogue={beat.text} pose={beat.pose} onDialogueAdvance={advanceGiftDialogue} /> }
  if (state.screen === 'intro') return <GameLayout pose="pointing" dialogue={introText} progress={0} phase="VERIFICACIÓN DE IDENTIDAD" onReset={reset}><section className="intro-card"><span className="eyebrow">VERIFICACIÓN DE IDENTIDAD</span><h1>¿Eres tú de verdad?</h1><p>Tranquila, esto no debería doler. Probablemente.</p><button className="primary-button" onClick={begin}>Comenzar verificación</button></section></GameLayout>
  if (state.screen === 'narrative' && state.narrative) {
    const definition = narratives[state.narrative.kind]
    const beat = definition.beats[state.narrative.beat]
    return <GameLayout pose={beat.pose} dialogue={beat.text} progress={state.progress} phase={q?.phase ?? ''} onReset={reset} narrative onDialogueAdvance={advanceNarrative}><section className={`event-card ${definition.image ? 'image-event-card' : ''}`}>{definition.title && <span className="eyebrow">{definition.title}</span>}{definition.subject && <h1>{definition.subject}</h1>}{definition.image ? <img className="event-image" src={definition.image} alt="" /> : definition.placeholder && <div className="asset-placeholder">IMAGEN / RECUERDO<br />IT TAKES TWO</div>}</section></GameLayout>
  }
  if (state.screen === 'developer-wish') {
    const first = state.activeWish === 1
    const third = state.activeWish === 3
    const title = first ? 'DESEO DEL DESARROLLADOR #01' : third ? 'DESEO DEL DESARROLLADOR #03' : 'DESEO DEL DESARROLLADOR #02'
    const wishReaction: Reaction | null = state.reaction?.beats ? { ...state.reaction, ...state.reaction.beats[state.reactionBeat] } : state.reaction
    if (third && state.wishIntroBeat !== null) {
      const beat = wishThreeIntro[state.wishIntroBeat]
      return <GameLayout pose={beat.pose} dialogue={beat.text} progress={75} phase={state.phase ?? 'ACTIVIDAD SOSPECHOSA'} onReset={reset} onDialogueAdvance={advanceWishIntro}><section className="wish-card"><span className="eyebrow">BONUS DESBLOQUEADO</span><h1>{title}</h1></section></GameLayout>
    }
    if (wishReaction) return <GameLayout pose={wishReaction.pose} dialogue={wishReaction.text} progress={state.progress} phase={state.phase ?? ''} onReset={reset} focus onDialogueAdvance={advanceWish}><section className="wish-card"><span className="eyebrow">BONUS DESBLOQUEADO</span><h1>{title}</h1></section></GameLayout>
    const wishDialogue = first ? 'Espera.\n\nAparentemente completar esta parte de la verificación te da derecho a pedirle algo al desarrollador.\n\nYo no recuerdo haber aprobado esta función.' : third ? 'El sistema está listo para registrar tu último deseo.' : 'Ah, no.\n\nOtra vez esto.'
    const placeholder = first ? 'Pídele algo al desarrollador...' : third ? 'Pídele una última cosa al desarrollador...' : 'Pídele otra cosa al desarrollador...'
    const helper = first ? 'El cumplimiento del deseo no está contractualmente garantizado.' : third ? 'Puedes pedir lo que quieras.' : 'No existe garantía legal, moral ni económica de cumplimiento.'
    return <GameLayout pose={third ? 'talking' : 'surprised'} dialogue={wishDialogue} progress={state.progress} phase={state.phase ?? ''} onReset={reset}><section className="wish-card"><span className="eyebrow">BONUS DESBLOQUEADO</span><h1>{title}</h1><textarea className="long-answer" value={wishDraft} onChange={event => setWishDraft(event.target.value)} placeholder={placeholder} rows={7} /><p className="helper-text">{helper}</p>{third && <p className="wish-secondary-helper">La falta de presupuesto continúa siendo un problema del desarrollador.</p>}<nav className="edit-nav"><span /><button className="primary-button" onClick={submitWish} disabled={!wishDraft.trim()}>CONFIRMAR</button><span /></nav>{import.meta.env.DEV && <button className="dev-skip" type="button" onClick={skipCurrentInput}>SKIP →</button>}</section></GameLayout>
  }
  if (state.screen === 'end-narrative') {
    const beat = closingBeats[state.endBeat]
    return <GameLayout pose={beat.pose} dialogue={beat.text} progress={state.progress} phase="VERIFICACIÓN FINAL" onReset={reset} narrative onDialogueAdvance={advanceEndNarrative}><section className="end-narrative-card" /></GameLayout>
  }
  if (state.screen === 'end') return <GameLayout pose="happy" dialogue="Falta la prueba final." progress={state.progress} phase={state.phase ?? 'VERIFICACIÓN FINAL'} onReset={reset}><section className="end-card"><span className="eyebrow">VERIFICACIÓN EN PAUSA</span><h1>Verificación en pausa</h1><p>Falta la prueba final.</p><button className="primary-button" onClick={reset}>Volver al inicio</button></section></GameLayout>
  if (state.screen === 'final-processing') {
    const stages = {
      'processing-997': { progress: 99.7, dialogue: '...', pose: 'waiting' as const, manual: false, status: 'FINALIZANDO VERIFICACIÓN...' },
      'processing-998': { progress: 99.8, dialogue: 'Vamos...', pose: 'waiting' as const, manual: false, status: 'FINALIZANDO VERIFICACIÓN...' },
      hang: { progress: 99.9, dialogue: '¿En serio?', pose: 'concerned' as const, manual: true, status: 'FINALIZANDO VERIFICACIÓN...' },
      'hang-complaint': { progress: 99.9, dialogue: '¿Ahora decides quedarte ahí?', pose: 'concerned' as const, manual: true, status: 'FINALIZANDO VERIFICACIÓN...' },
      'intervention-first': { progress: 99.9, dialogue: 'Está bien.', pose: 'determined' as const, manual: true, status: 'FINALIZANDO VERIFICACIÓN...' },
      'intervention-push': { progress: 99.9, dialogue: 'Lo haré yo.', pose: 'pointing' as const, manual: true, status: 'FINALIZANDO VERIFICACIÓN...' },
      'complete-100': { progress: 100, dialogue: 'Verificación finalizada.', pose: 'happy' as const, manual: true, status: 'VERIFICACIÓN COMPLETADA' },
    } as const
    const stage = stages[state.finalStage as keyof typeof stages] ?? stages['processing-997']
    return <GameLayout pose={stage.pose} dialogue={stage.dialogue} progress={stage.progress} phase="VERIFICACIÓN FINAL" onReset={reset} narrative onDialogueAdvance={stage.manual ? advanceFinalProcessing : undefined}><section className={`final-card processing-card ${state.finalStage === 'intervention-push' ? 'progress-push' : ''} ${state.finalStage === 'complete-100' ? 'progress-complete' : ''}`}><span className="eyebrow">{stage.status}</span><strong className="final-percent">{stage.progress}%</strong><div className="final-progress"><i style={{ width: `${stage.progress}%` }} /></div>{state.finalStage === 'intervention-push' && <span className="pixel-impact" aria-hidden="true">✦</span>}</section></GameLayout>
  }
  if (state.screen === 'identity-confirmed') {
    const beat = finalIdentityBeats[state.finalBeat]
    return <GameLayout pose={beat.pose} dialogue={beat.text} progress={100} phase="VERIFICACIÓN FINAL" onReset={reset} narrative onDialogueAdvance={advanceIdentity}><section className="final-card identity-card"><span className="eyebrow">VERIFICACIÓN COMPLETADA</span><h1>IDENTIDAD CONFIRMADA</h1><strong>BRITTANY</strong></section></GameLayout>
  }
  if (state.screen === 'gift-unlocked') return <GiftScene mode="unlocked" onGiftClick={activateFinalGift} transitioning={giftTransitioning} />
  if (state.screen === 'album') return <PhotoAlbum entering={giftTransitioning} onFinish={finishAlbum} />
  if (state.screen === 'album-closing') {
    const beat = albumClosingBeats[state.albumBeat]
    return <AlbumClosingScene pose={beat.pose} dialogue={beat.text} onAdvance={advanceAlbumClosing} />
  }
  if (state.screen === 'letter') return <FinalLetterScene onNext={completeExperience} onMenu={openFinalMenu} />
  if (state.screen === 'final-menu') return <FinalMenu onQuestionnaire={replayQuestionnaire} onAlbum={openPhotoAlbum} onLetter={openFinalLetter} />

  const saved = draft ?? state.answers[q.id]
  const activeReaction: Reaction | null = state.reaction?.beats ? { ...state.reaction, ...state.reaction.beats[state.reactionBeat] } : state.reaction
  const pose = activeReaction?.pose ?? (['textarea', 'multi-text'].includes(q.type) && saved ? 'waiting' : q.briitPose)
  const scanDone = state.answers.q21_scan === 'done'
  const originalIntelligence = Number(state.answers.q22_inteligencia ?? saved ?? 50)
  const overflowIntelligence = 103 + Math.round(originalIntelligence * 0.13)
  const answerForConfirmation = draft ?? state.answers[q.id] ?? (q.type === 'slider' ? 50 : q.type === 'multi-text' ? ['', '', ''] : q.type === 'multi-select' ? { selected: [], customText: '' } : '')
  const canConfirm = !empty(answerForConfirmation)
  const isSkippedAnswer = typeof saved === 'object' && !Array.isArray(saved) && saved.option === 'skipped'
  const showingQ28Alert = q.id === 'q28_no_tocar' && state.q28Alert
  const displayedProgress = showingQ28Alert ? Math.max(0, state.progress - 15) : state.progress
  const showDevSkip = import.meta.env.DEV && state.screen === 'question' && !activeReaction && !showingQ28Alert
  const dialogue = activeReaction?.text ?? (q.id === 'q28_no_tocar' ? (showingQ28Alert ? '...' : 'Esta es sencilla.\n\nNO presiones el botón rojo.') : q.type === 'biometric-scan' && !scanDone ? 'Hmm...\n\nEsto está tardando más de lo esperado.' : 'Estoy lista. Elige con cuidado; mis protocolos son muy sofisticados.')

  if (q.id === 'q26_audio' && state.q26IntroBeat !== null) {
    const beat = q26IntroBeats[state.q26IntroBeat]
    return <GameLayout pose={beat.pose} dialogue={beat.text} progress={q.progressPercent} phase={q.phase} onReset={reset} narrative onDialogueAdvance={advanceQ26Intro}><span aria-hidden="true" /> </GameLayout>
  }

  if (q.id === 'q22_inteligencia' && state.q22Stage === 'overflow') {
    return <GameLayout pose="thinking" dialogue="" progress={q.progressPercent} phase={q.phase} onReset={reset} focus contentFocus hideDialogue><section className="question-card q22-overflow-card"><span className="eyebrow">{q.phase}</span><h1>{q.prompt}</h1><div className="overflow-intelligence overflow-stage" style={{ '--overflow-value': `${overflowIntelligence}%` } as React.CSSProperties}><div className="overflow-track"><i /></div><strong>{overflowIntelligence}%</strong></div>{state.q22OverflowReady && <button className="primary-button" type="button" onClick={advanceQ22Overflow}>CONTINUAR →</button>}{import.meta.env.DEV && <button className="dev-skip" type="button" onClick={skipCurrentInput}>SKIP →</button>}</section></GameLayout>
  }

  return <GameLayout pose={pose} dialogue={dialogue} progress={displayedProgress} phase={q.phase} onReset={reset} focus={Boolean(activeReaction)} onDialogueAdvance={activeReaction ? nextAfterQuestion : undefined} continueLabel={activeReaction?.action === 'retry' ? 'Cambiar respuesta →' : 'Siguiente →'}>
    <section className={`question-card ${q.type === 'medical-impossible-case' ? 'impossible-case' : ''} ${q.id === 'q28_no_tocar' ? 'forbidden-question' : ''}`}>
      {q.type === 'biometric-scan' && !scanDone ? <div className="biometric-scan"><span className="eyebrow">ESCANEO BIOMÉTRICO AVANZADO</span><div className="scan-head"><span>◉</span></div><p>ÁREA FRONTAL: PROCESANDO...</p><button className="primary-button" onClick={() => setState(current => ({ ...current, answers: { ...current.answers, q21_scan: 'done' } }))}>Completar escaneo</button></div>
        : q.type === 'forbidden-button' ? <><span className="eyebrow">{q.phase}</span><h1>{q.prompt}</h1><p className="helper-text">{q.helperText}</p><div className={`forbidden-panel ${showingQ28Alert ? 'compromised' : ''}`}><button className="forbidden-button" type="button" onClick={pressForbiddenButton} disabled={showingQ28Alert}>NO TOCAR</button>{showingQ28Alert && <div className="compromised-alert" role="status"><strong>VERIFICACIÓN<br />COMPROMETIDA</strong><span>{displayedProgress}%</span></div>}</div>{!showingQ28Alert && <nav className="edit-nav"><button className="back-arrow" onClick={back}>← Volver</button><span /><span /></nav>}</>
          : <><span className="eyebrow">{q.label ?? q.phase}</span><h1>{q.prompt}</h1>{q.helperText && <p className="helper-text">{q.helperText}</p>}<QuestionRenderer question={q} savedAnswer={saved} onChange={setDraft} playbackEnabled={!activeReaction} />{isSkippedAnswer && !activeReaction && <p className="skip-status">Respuesta marcada como: {q.skipLabel}</p>}{q.skipLabel && !activeReaction && <button className="secondary-button" onClick={() => submit(true)}>{q.skipLabel}</button>}{!activeReaction && <nav className="edit-nav"><button className="back-arrow" onClick={back} disabled={state.questionIndex === 0}>← Volver</button><button className="primary-button" onClick={() => submit()} disabled={!canConfirm}>CONFIRMAR</button><span /></nav>}</>}
      {showDevSkip && <button className="dev-skip" type="button" onClick={skipCurrentInput}>SKIP →</button>}
    </section>
  </GameLayout>
}
