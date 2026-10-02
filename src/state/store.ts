import { create } from 'zustand'
import { CONTROLLING, GENERATING, groupFor, type Element, type Language, type Lens, type Mode, type PhaseStudy, type View } from '../domain/model'

function stored(key: string) { try { return localStorage.getItem(key) } catch { return null } }
export function remember(key: string, value: string) { try { localStorage.setItem(key, value) } catch { /* Preferences are optional. */ } }
const queryLanguage = new URLSearchParams(location.search).get('lang')
const savedLanguage = stored('hl-language')
const initialLanguage: Language = queryLanguage === 'en' || queryLanguage === 'zh-CN' ? queryLanguage : savedLanguage === 'en' || savedLanguage === 'zh-CN' ? savedLanguage : navigator.language.startsWith('zh') ? 'zh-CN' : 'en'
function selectedPhase(mode: Mode, number: number | null): Element {
  return number === null ? 'water' : groupFor(mode === 'hetu' ? 'hetu' : 'luoshu', number)?.element || 'water'
}
interface ExperienceState {
  mode: Mode; comparisonDiagram: 'hetu' | 'luoshu'; lens: Lens; selected: number | null; hovered: number | null; line: number;
  language: Language; view: View; cameraVersion: number;
  reduced: boolean; quality: 'standard' | 'low'; twoD: boolean; failed: boolean;
  relationPlaying: boolean; phaseStudy: PhaseStudy; activePhase: Element; relationStep: number;
  announcement: string;
  panelCollapsed: boolean;
  setMode: (mode: Mode) => void; setLens: (lens: Lens) => void; select: (number: number | null) => void;
  setPhase: (phase: Element) => void; setPhaseStudy: (study: PhaseStudy) => void; stepRelation: (direction: number) => void;
  setLanguage: (language: Language) => void; setView: (view: ExperienceState['view']) => void;
}
export const useExperience = create<ExperienceState>((set) => ({
  mode: 'hetu', comparisonDiagram: 'luoshu', lens: 'original', selected: null, hovered: null, line: 4,
  language: initialLanguage, view: 'oblique', cameraVersion: 0,
  reduced: stored('hl-reduced') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches,
  quality: innerWidth < 768 ? 'low' : 'standard', twoD: false, failed: false,
  relationPlaying: false, phaseStudy: 'mapping', activePhase: 'water', relationStep: 0, announcement: '', panelCollapsed: false,
  setMode: mode => set(state => ({ mode, lens: mode === 'compare' || state.lens === 'pairs' || state.lens === 'balance' ? 'original' : state.lens,
    selected: mode !== 'hetu' && state.selected === 10 ? null : state.selected,
    announcement: mode !== 'hetu' && state.selected === 10 ? (state.language === 'zh-CN' ? '十属于河图；已清除选择。' : 'Ten belongs to Hetu; the selection has been cleared.') : '',
    relationPlaying: false, hovered: null, view: 'oblique', cameraVersion: state.cameraVersion + 1,
    phaseStudy: 'mapping', activePhase: selectedPhase(mode, mode !== 'hetu' && state.selected === 10 ? null : state.selected), relationStep: 0,
  })),
  setLens: lens => set(state => ({ lens, relationPlaying: false, panelCollapsed: false, phaseStudy: 'mapping', activePhase: selectedPhase(state.mode, state.selected), relationStep: 0 })),
  select: number => set(state => ({ selected: number, panelCollapsed: false, relationPlaying: false, activePhase: selectedPhase(state.mode, number), relationStep: 0, announcement: number === null ? '' : `${state.language === 'zh-CN' ? '已选择数字' : 'Selected number'} ${number}` })),
  setPhase: activePhase => set({ activePhase, selected: null, relationPlaying: false, relationStep: 0 }),
  setPhaseStudy: phaseStudy => set({ phaseStudy, relationPlaying: false, relationStep: 0 }),
  stepRelation: direction => set(state => {
    const order = state.phaseStudy === 'controlling' ? CONTROLLING : GENERATING
    return { activePhase: order[(order.indexOf(state.activePhase) + direction + 5) % 5], relationStep: (state.relationStep + direction + 5) % 5, relationPlaying: false }
  }),
  setLanguage: language => { remember('hl-language', language); const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); set({ language }) },
  setView: view => set(state => ({ view, cameraVersion: state.cameraVersion + 1 })),
}))
