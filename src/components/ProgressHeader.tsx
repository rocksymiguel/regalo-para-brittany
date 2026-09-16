import { useEffect, useState } from 'react'
import { getSoundSettings, setSoundVolume, subscribeSoundSettings, toggleSoundMuted } from '../lib/gameAudio'

interface Props { progress: number; phase: string }

export function ProgressHeader({ progress, phase }: Props) {
  const [soundPanelOpen, setSoundPanelOpen] = useState(false)
  const [sound, setSound] = useState(getSoundSettings)
  useEffect(() => subscribeSoundSettings(() => setSound(getSoundSettings())), [])

  return <header className="progress-header">
    <div className="brand">REGALO PARA BRITTANY</div>
    <div className="progress-readout"><span>{phase || 'VERIFICACIÓN'}</span><div className="progress-track" aria-label={`Progreso: ${progress}%`}><div style={{ width: `${progress}%` }} /></div><strong>{progress}%</strong></div>
    <div className="sound-control">
      <button className="sound-toggle" type="button" onClick={() => setSoundPanelOpen(open => !open)} aria-label={sound.muted ? 'Activar sonido' : 'Opciones de sonido'} aria-expanded={soundPanelOpen}>{sound.muted ? '🔇' : '🔊'}</button>
      {soundPanelOpen && <div className="sound-popover">
        <button className="sound-mute" type="button" onClick={toggleSoundMuted}>{sound.muted ? 'ACTIVAR SONIDO' : 'SILENCIAR'}</button>
        <label>VOLUMEN <strong>{Math.round(sound.volume * 100)}%</strong><input type="range" min="0" max="100" value={Math.round(sound.volume * 100)} onChange={event => setSoundVolume(Number(event.target.value) / 100)} aria-label="Volumen" /></label>
      </div>}
    </div>
  </header>
}
