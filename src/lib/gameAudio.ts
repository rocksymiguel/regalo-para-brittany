import buttonClickSource from '../assets/sfx/sounds/aceeldon-click-button-578399.mp3'
import backgroundMusicSource from '../assets/sfx/music/Your Name OST - Sparkle (Piano, Strings and Drum Ver.) BELLA&LUCAS).mp3'

const backgroundMusic = new Audio(backgroundMusicSource)
backgroundMusic.loop = true
backgroundMusic.preload = 'auto'

let musicStarted = false
let soundVolume = 1
let soundMuted = false
const soundListeners = new Set<() => void>()

const effectiveVolume = () => soundMuted ? 0 : soundVolume
const notifySoundListeners = () => soundListeners.forEach(listener => listener())

function applyBackgroundMusicVolume() {
  backgroundMusic.volume = effectiveVolume()
}

applyBackgroundMusicVolume()

export function getSoundSettings() {
  return { volume: soundVolume, muted: soundMuted }
}

export function subscribeSoundSettings(listener: () => void) {
  soundListeners.add(listener)
  return () => {
    soundListeners.delete(listener)
  }
}

export function setSoundVolume(volume: number) {
  soundVolume = Math.min(1, Math.max(0, volume))
  if (soundVolume > 0) soundMuted = false
  applyBackgroundMusicVolume()
  notifySoundListeners()
}

export function toggleSoundMuted() {
  soundMuted = !soundMuted
  applyBackgroundMusicVolume()
  notifySoundListeners()
}

export function startGameMusic() {
  if (musicStarted) return
  musicStarted = true
  void backgroundMusic.play().catch(() => {
    // A later player click can retry if a browser rejected the initial gesture.
    musicStarted = false
  })
}

export function playInterfaceClick() {
  const click = new Audio(buttonClickSource)
  click.volume = effectiveVolume() * 0.5
  void click.play().catch(() => {
    // Interface feedback is deliberately non-blocking.
  })
}
