import background from '../assets/background.png'
import type { CSSProperties } from 'react'
import { BriitPanel } from './BriitPanel'
import type { BriitPose } from '../types/game'

interface Props {
  dialogue: string
  pose: BriitPose
  onAdvance: () => void
}

export function AlbumClosingScene({ dialogue, pose, onAdvance }: Props) {
  return <main className="album-closing-scene" style={{ '--room-background': `url(${background})` } as CSSProperties}>
    <div className="album-closing-wash" />
    <section className="album-closing-briit"><BriitPanel pose={pose} dialogue={dialogue} onAdvance={onAdvance} /></section>
  </main>
}
