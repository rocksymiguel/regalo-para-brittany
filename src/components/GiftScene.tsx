import { useEffect, useState } from 'react'
import giftImage from '../assets/gift.png'
import { BriitPanel } from './BriitPanel'
import type { BriitPose } from '../types/game'

interface Props {
  mode: 'locked' | 'unlocked'
  started?: boolean
  dialogue?: string
  pose?: BriitPose
  onGiftClick?: () => void
  onDialogueAdvance?: () => void
  transitioning?: boolean
}

export function GiftScene({ mode, started = false, dialogue, pose = 'talking', onGiftClick, onDialogueAdvance, transitioning = false }: Props) {
  const [shaking, setShaking] = useState(false)
  const [activated, setActivated] = useState(false)
  const [lockedClicks, setLockedClicks] = useState(0)
  const [waitingForGuide, setWaitingForGuide] = useState(false)
  const [guideTimer, setGuideTimer] = useState<number | null>(null)

  useEffect(() => () => {
    if (guideTimer !== null) window.clearTimeout(guideTimer)
  }, [guideTimer])

  const clickGift = () => {
    if (mode === 'locked') {
      if (started || waitingForGuide) return
      setShaking(false)
      window.requestAnimationFrame(() => setShaking(true))
      const nextClick = lockedClicks + 1
      setLockedClicks(nextClick)
      window.setTimeout(() => setShaking(false), 420)
      if (nextClick < 2) return
      setWaitingForGuide(true)
      setGuideTimer(window.setTimeout(() => onGiftClick?.(), 2000))
      return
    }
    setActivated(true)
    window.setTimeout(() => onGiftClick?.(), 140)
  }

  const showGuide = mode === 'locked' && started
  return <main className={`gift-scene gift-${mode} ${showGuide ? 'gift-guide-visible' : ''}`}>
    <div className="gift-scene-wash" />
    <div className="gift-stage">
      <button type="button" className={`gift-object ${shaking ? 'gift-locked-shake' : ''} ${activated ? 'gift-unlock-pulse' : ''}`} onClick={clickGift} aria-label={mode === 'locked' ? 'Regalo cerrado' : 'Abrir regalo'}>
        <img src={giftImage} alt="Regalo" />
      </button>
      {mode === 'locked' && !started && <span className="gift-hint" aria-hidden="true">✦</span>}
      {showGuide && dialogue && <>
        <BriitPanel pose={pose} dialogue={dialogue} hideDialogue />
        <button className="dialogue-box dialogue-advance gift-guide-dialogue" type="button" onClick={onDialogueAdvance} aria-label="Siguiente →">
          <span className="dialogue-name">Briit</span>
          {dialogue.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}
          <span className="dialogue-action">Siguiente →</span>
        </button>
      </>}
      {mode === 'unlocked' && <div className="gift-unlocked-copy"><span className="eyebrow">REGALO DESBLOQUEADO</span><strong>Ahora sí.</strong><small>Ábrelo.</small></div>}
    </div>
    {transitioning && <div className="gift-fade-overlay visible" aria-hidden="true" />}
  </main>
}
