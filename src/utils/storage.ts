import type { GameState } from '../types/game'

const STORAGE_KEY = 'regalo-para-brittany-prototype'

export const initialState: GameState = { screen: 'start', questionIndex: 0, answers: {}, wishes: { first: '', second: '', third: '' }, progress: 0, phase: null, phaseIntrosCompleted: { medical: false }, reaction: null, reactionBeat: 0, q22Stage: 'idle', q22OverflowReady: false, q26IntroSeen: false, q26IntroBeat: null, activeWish: null, wishIntroBeat: null, narrative: null, endBeat: 0, q28Alert: false, finalStage: 'none', finalBeat: 0, albumBeat: 0, introGiftStarted: false, introGiftBeat: 0, questionnaireCompleted: false, briefCompleted: false, submissionSessionId: null, submissionPending: false, answersSubmitted: false }

export function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return initialState
    const candidate = JSON.parse(stored) as Partial<GameState> & { experienceCompleted?: boolean }
    if (!candidate.screen || typeof candidate.questionIndex !== 'number' || !candidate.answers) return initialState
    const { experienceCompleted: legacyExperienceCompleted, ...currentCandidate } = candidate
    const restored = { ...initialState, ...currentCandidate, briefCompleted: typeof currentCandidate.briefCompleted === 'boolean' ? currentCandidate.briefCompleted : Boolean(legacyExperienceCompleted), wishes: { ...initialState.wishes, ...candidate.wishes }, phaseIntrosCompleted: { ...initialState.phaseIntrosCompleted, ...candidate.phaseIntrosCompleted } }
    if (restored.screen === 'end' && restored.questionIndex === 29 && restored.progress === 75) return { ...restored, screen: 'question', questionIndex: 30, phase: 'VERIFICACIÓN FINAL', progress: 77.5 }
    if (restored.screen === 'end' && restored.questionIndex === 32 && restored.progress === 82.5) return { ...restored, screen: 'question', questionIndex: 33, phase: 'VERIFICACIÓN FINAL', progress: 85 }
    if (restored.screen === 'end' && restored.questionIndex === 35 && restored.progress === 90) return { ...restored, screen: 'question', questionIndex: 36, phase: 'VERIFICACIÓN FINAL', progress: 92.5 }
    if ((restored.screen === 'end' || restored.screen === 'end-narrative') && restored.questionIndex === 38 && restored.progress === 97.5) return { ...restored, screen: 'question', questionIndex: 39, phase: 'VERIFICACIÓN FINAL', progress: 97.5, finalStage: 'none', finalBeat: 0 }
    if (restored.screen === 'final-processing') return { ...restored, finalStage: 'processing-997', progress: 99.7, phase: 'VERIFICACIÓN FINAL' }
    if ((restored.screen as string) === 'gift-placeholder') return { ...restored, screen: 'album', finalStage: 'album', albumBeat: 0 }
    if ((restored.screen as string) === 'letter-placeholder') return { ...restored, screen: 'letter', finalStage: 'letter', progress: 100 }
    if (restored.screen === 'final-menu' || restored.finalStage === 'final-menu') return { ...restored, screen: 'final-menu', finalStage: 'final-menu', progress: 100, briefCompleted: true }
    return restored
  } catch { return initialState }
}

export function saveGameState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGameState() { localStorage.removeItem(STORAGE_KEY) }
