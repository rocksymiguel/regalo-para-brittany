import { useState } from 'react'
import letterPartOne from '../assets/para Brittany 01.png'
import letterPartTwo from '../assets/para Brittany 02.png'

interface Props {
  onNext: () => void
  onMenu: () => void
}

export function FinalLetterScene({ onNext, onMenu }: Props) {
  const [stage, setStage] = useState<1 | 2>(1)
  const [opening, setOpening] = useState(false)
  const [returning, setReturning] = useState(false)
  const showSpread = () => {
    if (opening) return
    setOpening(true)
    setStage(2)
    window.setTimeout(() => setOpening(false), 480)
  }
  const returnToFirstPart = () => {
    if (returning) return
    setReturning(true)
    window.setTimeout(() => {
      setStage(1)
      setReturning(false)
    }, 460)
  }

  return <main className="letter-scene">
    <div className="letter-scene-wash" aria-hidden="true" />
    <div className={`letter-pages ${stage === 2 ? 'letter-pages-spread' : 'letter-pages-single'} ${returning ? 'letter-pages-returning' : ''}`}>
      <img className="letter-page letter-page-one" src={letterPartOne} alt="Carta para Brittany, primera parte" />
      {stage === 2 && <img className="letter-page letter-page-two" src={letterPartTwo} alt="Carta para Brittany, segunda parte" />}
    </div>
    <button className="letter-menu-link" type="button" onClick={onMenu}>← MENÚ</button>
    {stage === 2 && <button className="letter-back" type="button" onClick={returnToFirstPart} disabled={opening || returning}>← VOLVER</button>}
    <button className="letter-next" type="button" onClick={stage === 1 ? showSpread : onNext} disabled={opening || returning}>SIGUIENTE →</button>
  </main>
}
