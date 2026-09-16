import { useEffect, useRef, useState } from 'react'
import { anonymousAudio } from '../data/audio'
import { getSoundSettings, subscribeSoundSettings } from '../lib/gameAudio'
import type { AnswerValue, QuestionDefinition } from '../types/game'

interface Props {
  question: QuestionDefinition
  savedAnswer?: AnswerValue
  onChange: (value: AnswerValue) => void
  playbackEnabled?: boolean
}

export function QuestionRenderer({ question, savedAnswer, onChange, playbackEnabled = true }: Props) {
  const defaultValue: AnswerValue = question.type === 'slider' ? 50 : question.type === 'multi-text' ? ['', '', ''] : question.type === 'multi-select' ? { selected: [], customText: '' } : ''
  const [value, setValue] = useState<AnswerValue>(savedAnswer ?? defaultValue)
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { setValue(savedAnswer ?? (question.type === 'slider' ? 50 : question.type === 'multi-text' ? ['', '', ''] : question.type === 'multi-select' ? { selected: [], customText: '' } : '')) }, [question.id, question.type, savedAnswer])
  const update = (next: AnswerValue) => { setValue(next); onChange(next) }

  const stopCurrentAudio = () => {
    const audio = audioRef.current
    const stoppedId = activeAudioId
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.ontimeupdate = null
      audio.onended = null
      audioRef.current = null
    }
    if (stoppedId) setAudioProgress(current => ({ ...current, [stoppedId]: 0 }))
    setActiveAudioId(null)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (!playbackEnabled) stopCurrentAudio()
  }, [playbackEnabled])

  useEffect(() => () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.ontimeupdate = null
      audio.onended = null
      audioRef.current = null
    }
  }, [question.id])

  useEffect(() => subscribeSoundSettings(() => {
    if (audioRef.current) audioRef.current.volume = getSoundSettings().muted ? 0 : getSoundSettings().volume
  }), [])

  const playAudio = async (trackId: string) => {
    const track = anonymousAudio.find(item => item.id === trackId)
    if (!track || !playbackEnabled) return

    if (audioRef.current && activeAudioId === trackId) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.ontimeupdate = null
      audioRef.current.onended = null
    }
    if (activeAudioId) setAudioProgress(current => ({ ...current, [activeAudioId]: 0 }))

    const audio = new Audio(track.src)
    audio.volume = getSoundSettings().muted ? 0 : getSoundSettings().volume
    audioRef.current = audio
    setActiveAudioId(trackId)
    setAudioProgress(current => ({ ...current, [trackId]: 0 }))
    audio.ontimeupdate = () => {
      const progress = Number.isFinite(audio.duration) && audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100
        : 0
      setAudioProgress(current => ({ ...current, [trackId]: progress }))
    }
    audio.onended = () => {
      audio.currentTime = 0
      setAudioProgress(current => ({ ...current, [trackId]: 0 }))
      setActiveAudioId(null)
      setIsPlaying(false)
      audioRef.current = null
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const pauseAudio = (trackId: string) => {
    if (activeAudioId !== trackId || !audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }

  const stopAudio = (trackId: string) => {
    if (activeAudioId !== trackId || !audioRef.current) {
      setAudioProgress(current => ({ ...current, [trackId]: 0 }))
      return
    }
    stopCurrentAudio()
  }

  if (question.id === 'q26_audio') {
    const selected = typeof value === 'string' ? value : ''
    return <div className="audio-grid">
      {anonymousAudio.map(track => {
        const active = activeAudioId === track.id
        return <article key={track.id} className={`audio-card ${selected === track.id ? 'selected' : ''}`}>
          <button className="audio-select" type="button" onClick={() => update(track.id)} aria-label={`Seleccionar ${track.label}`} aria-pressed={selected === track.id}>
            <span aria-hidden="true">♪</span>
            <strong>{track.label}</strong>
            <span className="audio-check" aria-hidden="true">{selected === track.id ? '✓' : '□'}</span>
            <small>{selected === track.id ? 'SELECCIONADO' : 'SELECCIONAR'}</small>
          </button>
          <div className="audio-progress" aria-hidden="true"><i style={{ width: `${audioProgress[track.id] ?? 0}%` }} /></div>
          <div className="audio-controls">
            <button type="button" onClick={() => void playAudio(track.id)} aria-label={`Reproducir ${track.label}`}>▶</button>
            <button type="button" onClick={() => pauseAudio(track.id)} aria-label={`Pausar ${track.label}`} disabled={!active || !isPlaying}>❚❚</button>
            <button type="button" onClick={() => stopAudio(track.id)} aria-label={`Detener ${track.label}`} disabled={!active && !(audioProgress[track.id] > 0)}>■</button>
          </div>
        </article>
      })}
    </div>
  }

  if (question.type === 'multi-select') {
    const structured = typeof value === 'object' && !Array.isArray(value) ? value : { selected: [], customText: '' }
    const selected = structured.selected ?? []
    const toggle = (option: string) => {
      const alreadySelected = selected.includes(option)
      if (!alreadySelected && selected.length >= 3) return
      update({ selected: alreadySelected ? selected.filter(item => item !== option) : [...selected, option], customText: structured.customText ?? '' })
    }
    const otherSelected = selected.includes('Otra cosa...')
    return <div className="kit-selector">
      <p className="kit-counter" aria-live="polite"><strong>{selected.length} / 3</strong> seleccionados</p>
      <div className="kit-choice-grid">
        {question.options?.map(option => <button key={option} type="button" className={`kit-choice ${selected.includes(option) ? 'selected' : ''}`} onClick={() => toggle(option)} aria-pressed={selected.includes(option)}>{option}</button>)}
      </div>
      {otherSelected && <input className="text-answer kit-other-answer" value={structured.customText ?? ''} placeholder="¿Qué añadirías?" onChange={event => update({ selected, customText: event.target.value })} />}
      {selected.length > 0 && <div className="kit-preview" aria-label="Kit seleccionado">{selected.map(item => <span key={item}>{item === 'Otra cosa...' ? (structured.customText?.trim() || 'Otra cosa...') : item}</span>)}</div>}
    </div>
  }

  if (question.type === 'choice' || question.type === 'zodiac' || question.type === 'color-choice' || question.type === 'medical-impossible-case' || question.type === 'biometric-scan') { const isQ25 = question.id === 'q25_dia'; const structured = typeof value === 'object' && !Array.isArray(value) ? value : null; const selected = structured?.option ?? value; return <div className={`choice-grid ${question.type} ${question.id === 'q27_dilema' ? 'two-option-grid' : ''}`}>
    {question.options?.map(option => <button key={option} className={`choice-button ${selected === option ? 'selected' : ''}`} onClick={() => update(isQ25 ? { option, customText: structured?.customText ?? '' } : option)}>{option}</button>)}
    {isQ25 && selected === 'Otra cosa...' && <input className="text-answer other-answer" value={structured?.customText ?? ''} placeholder="Escribe qué escogerías..." onChange={event => update({ option: 'Otra cosa...', customText: event.target.value })} />}
  </div>
  }
  if (question.type === 'slider') return <div className="slider-control"><input type="range" min="0" max="100" value={Number(value)} onChange={(event) => update(Number(event.target.value))} aria-label={question.prompt} /><div className="slider-labels"><span>{question.sliderLabels?.left}</span><strong>{Number(value)}%</strong><span>{question.sliderLabels?.right}</span></div></div>
  if (question.type === 'multi-text') {
    const words = Array.isArray(value) ? value : ['', '', '']
    return <div className="multi-text-fields">{question.fields?.map((placeholder, index) => <input key={placeholder} className="text-answer" value={words[index] ?? ''} placeholder={placeholder} onChange={(event) => { const next = [...words]; next[index] = event.target.value; update(next) }} />)}</div>
  }
  if (question.type === 'textarea') return <textarea className="long-answer" value={typeof value === 'string' ? value : ''} onChange={(event) => update(event.target.value)} placeholder="Escribe aquí, sin prisa..." rows={8} />
  return <input className="text-answer" type="text" value={String(value)} onChange={(event) => update(event.target.value)} placeholder="Tu respuesta..." autoFocus />
}
