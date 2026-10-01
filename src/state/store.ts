import { create } from 'zustand'
import type { Language, Lens, Mode } from '../domain/model'

function stored(key: string) { try { return localStorage.getItem(key) } catch { return null } }
export function remember(key: string, value: string) { try { localStorage.setItem(key, value) } catch { /* Preferences are optional. */ } }
const queryLanguage = new URLSearchParams(location.search).get('lang')
const savedLanguage = stored('hl-language')
const initialLanguage: Language = queryLanguage === 'en' || queryLanguage === 'zh-CN' ? queryLanguage : savedLanguage === 'en' || savedLanguage === 'zh-CN' ? savedLanguage : navigator.language.startsWith('zh') ? 'zh-CN' : 'en'
interface ExperienceState {
  mode: Mode; comparisonDiagram: 'hetu' | 'luoshu'; lens: Lens; selected: number | null; hovered: number | null; line: number;
  language: Language; view: 'oblique' | 'top' | 'focus'; cameraVersion: number;
  reduced: boolean; quality: 'standard' | 'low'; twoD: boolean; failed: boolean;
  guide: boolean; guidePhase: number; relationPlaying: boolean; cycle: 'generating' | 'controlling'; cycleIndex: number;
  announcement: string;
  panelCollapsed: boolean;
  setMode: (mode: Mode) => void; setLens: (lens: Lens) => void; select: (number: number | null) => void;
  setLanguage: (language: Language) => void; setView: (view: ExperienceState['view']) => void;
  finishGuide: () => void; replayGuide: () => void;
}
export const useExperience = create<ExperienceState>((set, get) => ({
  mode: 'hetu', comparisonDiagram: 'luoshu', lens: 'original', selected: null, hovered: null, line: 4,
  language: initialLanguage, view: 'oblique', cameraVersion: 0,
  reduced: stored('hl-reduced') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches,
  quality: innerWidth < 768 ? 'low' : 'standard', twoD: false, failed: false,
  guide: stored('hl-guide-seen') !== 'true', guidePhase: 0,
  relationPlaying: false, cycle: 'generating', cycleIndex: 0, announcement: '', panelCollapsed: false,
  setMode: mode => set(state => ({ mode, lens: mode === 'compare' || state.lens === 'pairs' || state.lens === 'balance' ? 'original' : state.lens,
    selected: mode !== 'hetu' && state.selected === 10 ? null : state.selected,
    announcement: mode !== 'hetu' && state.selected === 10 ? (state.language === 'zh-CN' ? '十属于河图；已清除选择。' : 'Ten belongs to Hetu; the selection has been cleared.') : '',
    relationPlaying: false, hovered: null, view: 'oblique', cameraVersion: state.cameraVersion + 1,
  })),
  setLens: lens => set({ lens, relationPlaying: false, panelCollapsed: false }),
  select: number => set({ selected: number, panelCollapsed: false, announcement: number === null ? '' : `${get().language === 'zh-CN' ? '已选择数字' : 'Selected number'} ${number}` }),
  setLanguage: language => { remember('hl-language', language); const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); set({ language }) },
  setView: view => set(state => ({ view, cameraVersion: state.cameraVersion + 1 })),
  finishGuide: () => { remember('hl-guide-seen', 'true'); set({ guide: false, selected: null, lens: 'original', view: 'oblique', cameraVersion: get().cameraVersion + 1 }) },
  replayGuide: () => set({ guide: true, guidePhase: 0, mode: 'hetu', lens: 'original', selected: null, view: 'oblique', cameraVersion: get().cameraVersion + 1 }),
}))
