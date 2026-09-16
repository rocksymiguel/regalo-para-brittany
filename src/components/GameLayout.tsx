import type { CSSProperties, ReactNode } from 'react'
import background from '../assets/background.png'
import type { BriitPose } from '../types/game'
import { BriitPanel } from './BriitPanel'
import { ProgressHeader } from './ProgressHeader'

interface Props { children: ReactNode; pose: BriitPose; dialogue: string; progress: number; phase: string; onReset: () => void; focus?: boolean; narrative?: boolean; onDialogueAdvance?: () => void; continueLabel?: string; hideDialogue?: boolean; contentFocus?: boolean }
export function GameLayout({ children, pose, dialogue, progress, phase, onReset, focus = false, narrative = false, onDialogueAdvance, continueLabel, hideDialogue = false, contentFocus = false }: Props) {
  return <main className={`game-scene ${focus ? 'scene-focus' : ''} ${contentFocus ? 'content-focus' : ''}`} style={{ '--room-background': `url(${background})` } as CSSProperties}>
    <div className="scene-wash" />
    <ProgressHeader progress={progress} phase={phase} />
    <section className={`game-content ${focus ? 'focus-briit' : ''} ${narrative ? 'narrative-layout' : ''}`}><BriitPanel pose={pose} dialogue={dialogue} onAdvance={onDialogueAdvance} continueLabel={continueLabel} hideDialogue={hideDialogue} />{!narrative && <div className="content-panel">{children}</div>}{narrative && children}</section>
  </main>
}
