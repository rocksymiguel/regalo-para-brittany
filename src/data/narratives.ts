import type { BriitPose, NarrativeKind } from '../types/game'
import itTakesTwoImage from '../assets/it takes two.jpg'

export interface NarrativeDefinition { kind: NarrativeKind; title?: string; subject?: string; placeholder?: boolean; image?: string; targetIndex: number; beats: { text: string; pose: BriitPose }[] }

export const narratives: Record<NarrativeKind, NarrativeDefinition> = {
  malecon: { kind: 'malecon', title: 'ANTECEDENTE ENCONTRADO', subject: 'INCIDENTE: MALECÓN DE GUAYAQUIL', targetIndex: 10, beats: [{ text: '...', pose: 'thinking' }, { text: 'Hay registros.', pose: 'talking' }] },
  'it-takes-two': { kind: 'it-takes-two', title: 'ANTECEDENTE ENCONTRADO', subject: 'IT TAKES TWO', placeholder: true, targetIndex: 13, image: itTakesTwoImage, beats: [{ text: 'Ah.', pose: 'surprised' }, { text: 'Tenemos historial.', pose: 'thinking' }] },
  'medical-intro': { kind: 'medical-intro', targetIndex: 15, beats: [{ text: 'Espera.', pose: 'determined' }, { text: 'Mis registros indican que además eres médico.', pose: 'thinking' }, { text: 'Eso requiere una verificación adicional.', pose: 'determined' }, { text: 'No tengo idea de por qué esto es necesario para entregarte un regalo, pero yo no hice las reglas.', pose: 'concerned' }, { text: 'Bueno... técnicamente el desarrollador sí.', pose: 'talking' }] },
  'medical-alert': { kind: 'medical-alert', title: 'ALERTA', subject: 'CASO CLÍNICO DE ALTA PRIORIDAD', targetIndex: 18, beats: [{ text: 'Doctora Maldonado.', pose: 'alert' }, { text: 'Necesito su atención.', pose: 'determined' }] },
}
