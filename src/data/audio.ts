import audio01 from '../assets/sfx/music/Mesa que mas aplauda.mp3'
import audio02 from '../assets/sfx/music/Himno Nacional del Ecuador [Original] con letra.mp3'
import audio03 from '../assets/sfx/music/Tarzán - Hijo De Hombre (By_ Phil Collins) (Letra).mp3'
import audio04 from '../assets/sfx/music/Ricchi E Poveri - Sarà perché ti amo (Sub. Español LyricsTesto).mp3'

export interface AnonymousAudioTrack {
  id: string
  label: string
  src: string
  special: boolean
}

export const anonymousAudio: AnonymousAudioTrack[] = [
  { id: 'Audio 01', label: 'AUDIO 01', src: audio01, special: false },
  { id: 'Audio 02', label: 'AUDIO 02', src: audio02, special: false },
  { id: 'Audio 03', label: 'AUDIO 03', src: audio03, special: false },
  { id: 'Audio 04', label: 'AUDIO 04', src: audio04, special: true },
]
