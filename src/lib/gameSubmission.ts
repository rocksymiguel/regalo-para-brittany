import { ensureSupabaseAnonymousSession, supabase } from './supabase'
import type { AnswerMap, GameState } from '../types/game'

export type QuestionnaireAnswersSnapshot = Record<string, AnswerMap[string]>
export interface QuestionnaireWishesSnapshot {
  wish1: string
  wish2: string
  wish3: string
}

export function createSubmissionSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `brittany-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function buildWishesSnapshot(wishes: GameState['wishes']): QuestionnaireWishesSnapshot {
  return { wish1: wishes.first, wish2: wishes.second, wish3: wishes.third }
}

interface SubmissionInput {
  sessionId: string
  answers: QuestionnaireAnswersSnapshot
  wishes: QuestionnaireWishesSnapshot
}

export async function submitQuestionnaireSnapshot({ sessionId, answers, wishes }: SubmissionInput): Promise<boolean> {
  const auth = await ensureSupabaseAnonymousSession()
  if (!auth || !supabase) {
    if (import.meta.env.DEV) console.warn('[Supabase] Questionnaire submission pending retry.')
    return false
  }

  const now = new Date().toISOString()
  const { error } = await supabase.from('game_submissions').upsert({
    user_id: auth.user.id,
    session_id: sessionId,
    answers,
    wishes,
    questionnaire_completed_at: now,
    source: import.meta.env.DEV ? 'development' : 'production',
    updated_at: now,
  }, { onConflict: 'user_id,session_id' })

  if (error) {
    if (import.meta.env.DEV) console.warn('[Supabase] Questionnaire submission pending retry.')
    return false
  }

  if (import.meta.env.DEV) console.info('[Supabase] Questionnaire submission synced.')
  return true
}
