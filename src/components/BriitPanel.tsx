import { briitSprites } from '../assets/sprites'
import type { BriitPose } from '../types/game'

interface Props { pose: BriitPose; dialogue: string; onAdvance?: () => void; continueLabel?: string; hideDialogue?: boolean }

export function BriitPanel({ pose, dialogue, onAdvance, continueLabel = 'Siguiente →', hideDialogue = false }: Props) {
  return <aside className="briit-panel" aria-label="Briit, tu guía">
    <div className="sprite-frame">
      <img className="briit-sprite" src={briitSprites[pose]} alt="Briit" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling?.removeAttribute('hidden') }} />
      <div className="sprite-fallback" hidden aria-hidden="true"><span>✦</span></div>
    </div>
    {!hideDialogue && <button className={`dialogue-box ${onAdvance ? 'dialogue-advance' : ''}`} onClick={onAdvance} disabled={!onAdvance} aria-label={onAdvance ? continueLabel : 'Diálogo de Briit'}><span className="dialogue-name">Briit</span>{dialogue.split('\n').map((line, index) => <p key={index}>{line || '\u00a0'}</p>)}{onAdvance && <span className="dialogue-action">{continueLabel}</span>}</button>}
  </aside>
}
