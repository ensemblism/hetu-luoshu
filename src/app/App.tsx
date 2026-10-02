import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, CircleHelp, Focus, Maximize2, RotateCcw, X } from 'lucide-react'
import { BALANCE_LINES, HETU_PAIRS, phaseTarget, groupFor, groupsFor, type Diagram, type Lens, type Mode } from '../domain/model'
import { copy, directions, elements, lessons, pick } from '../content/text'
import { remember, useExperience } from '../state/store'
import Diagram2D from '../fallback/Diagram2D'
import { Citation } from '../ui/Citation'
import SceneLabels from '../ui/SceneLabels'
import PhasePanel from '../ui/PhasePanel'
import PointCount from '../ui/PointCount'
import SoundControl from '../ui/SoundControl'

const ExperienceScene = lazy(() => import('../scene/ExperienceScene'))
const t = (key: keyof typeof copy) => pick(copy[key], useExperience.getState().language)

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function RelationPanel() {
  const state = useExperience()
  const { mode, selected, lens, language, line, select } = state
  if (selected === null && lens === 'original') return null
  const diagram: Diagram = mode === 'hetu' ? 'hetu' : 'luoshu'
  const group = selected === null ? null : groupFor(diagram, selected)
  const pair = HETU_PAIRS.find(p => p.some(n => n === selected)) || [1, 6]
  const formula = diagram === 'hetu' ? `${pair[0]} + 5 = ${pair[1]}` : lens === 'balance' ? `${BALANCE_LINES[line].join(' + ')} = 15` : selected === null || selected === 5 ? '9 + 5 + 1 = 15' : `${selected} + ${10 - selected} + 5 = 15`
  const explanation = lens === 'polarity' ? 'polarityExplanation' : diagram === 'hetu' ? 'pairExplanation' : lens === 'balance' ? 'balanceExplanation' : 'oppositeExplanation'
  const source = lens === 'polarity' ? 'polarity' : diagram === 'hetu' ? 'hetu' : null
  return <aside className={`relation-panel ${lens === 'elements' ? 'is-phase-panel' : ''}`} aria-label={t('explore')}>
    <div className="panel-heading"><span className="eyebrow">{state.panelCollapsed && selected !== null ? `${t('selection')} ${selected}` : mode === 'compare' ? t('compare') : t(lens === 'original' ? 'explore' : lens)}</span><div className="panel-actions"><button className="icon-button panel-collapse" aria-label={language === 'zh-CN' ? state.panelCollapsed ? '展开说明' : '收起说明' : state.panelCollapsed ? 'Expand explanation' : 'Collapse explanation'} aria-expanded={!state.panelCollapsed} onClick={() => useExperience.setState({ panelCollapsed: !state.panelCollapsed })}><ChevronDown size={15} style={{ transform: state.panelCollapsed ? 'rotate(180deg)' : undefined }} /></button><button className="icon-button" aria-label={t('close')} onClick={() => { select(null); state.setLens('original') }}><X size={16} /></button></div></div>
    {selected !== null && lens !== 'elements' && <><div className="selected-number"><span>{String(selected).padStart(2, '0')}</span><i className={selected % 2 ? 'white-point' : 'black-point'} /></div><div className="number-meta"><span>{selected % 2 ? t('yang') : t('yin')}</span>{mode !== 'compare' && <span>{group ? pick(directions[group.direction], language) : ''}{group && diagram === 'hetu' ? ` · ${pick(elements[group.element], language)}` : ''}</span>}</div></>}
    {lens === 'elements' ? <PhasePanel diagram={diagram} /> : mode === 'compare' && selected !== null ? <>
      <div className="compare-info">{(['hetu', 'luoshu'] as const).map(d => <div key={d}><span>{t(d)}</span><strong>{pick(directions[groupFor(d, selected)!.direction], language)}</strong></div>)}</div>
      <p>{language === 'zh-CN' ? '追踪同一数字的方位。两种布局，在同一尺度下参照。' : 'Follow this number’s direction in both arrangements, shown at the same scale.'} <Citation source="hetu" /><Citation source="luoshu" /></p>
    </> : <>
      {lens === 'polarity' ? <div className="polarity-key"><i className="white-point" /><span>{t('yang')}</span><i className="black-point" /><span>{t('yin')}</span></div> : <div className="formula">{formula}</div>}
      <p>{t(explanation)} {source && <Citation source={source} />}</p>
      {lens === 'balance' && <div className="line-navigation"><button aria-label={t('previous')} className="icon-button" onClick={() => useExperience.setState({ line: (line + 7) % 8 })}><ArrowLeft size={15} /></button><span>{line + 1} / 8</span><button aria-label={t('following')} className="icon-button" onClick={() => useExperience.setState({ line: (line + 1) % 8 })}><ArrowRight size={15} /></button></div>}
      <span className="relation-kind">{source ? t('traditional') : t('computed')}</span>
    </>}
    {selected !== null && mode !== 'compare' && <button className="text-button focus-selection" onClick={() => state.setView('focus')}><Focus size={14} /> {t('focus')}</button>}
  </aside>
}

function Learning({ initialTab, onClose }: { initialTab: 'read' | 'history' | 'method' | 'about'; onClose: () => void }) {
  const { language, reduced, quality, twoD } = useExperience()
  const [tab, setTab] = useState(initialTab)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement
    root.current?.querySelector<HTMLButtonElement>('.modal-close')?.focus()
    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const items = [...(root.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input') || []), ...document.querySelectorAll<HTMLElement>('.source-popover button, .source-popover a')]
        if (!items?.length) return
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [onClose])
  function demonstrate(action: Lens) {
    useExperience.setState({ mode: action === 'balance' ? 'luoshu' : 'hetu', selected: action === 'pairs' ? 1 : null, lens: action, view: 'top', cameraVersion: useExperience.getState().cameraVersion + 1 })
    onClose()
  }
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="learning-modal" ref={root} role="dialog" aria-modal="true" aria-labelledby="learning-title">
      <button className="icon-button modal-close" aria-label={t('close')} onClick={onClose}><X size={20} /></button>
      <span className="eyebrow">HETU × LUOSHU / FIELD NOTES</span>
      <h2 id="learning-title">{tab === 'history' ? t('historyTitle') : tab === 'method' ? t('methodTitle') : tab === 'about' ? 'Hetu × Luoshu' : t('learnTitle')}</h2>
      <p className="modal-lead">{t('learnSubtitle')}</p>
      <div className="learning-tabs" role="tablist" aria-label={t('intro')}>{(['read', 'history', 'method', 'about'] as const).map(name => <button key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{t(name)}</button>)}</div>
      <div className="lesson-list" role="tabpanel">
        {tab === 'about' ? <>
          <article><h3>{language === 'zh-CN' ? '数字中的秩序' : 'An order of numbers'}</h3><p>{language === 'zh-CN' ? '本作品采用十数河图、九数洛书，循《易学启蒙》所论图式，邀请你从点数与方位进入传统宇宙观。' : 'This work follows the ten-number Hetu and nine-number Luoshu discussed in Yixue Qimeng, opening a path into traditional cosmology through numbers and directions.'}<Citation source="hetu" /></p></article>
          <article><h3>{language === 'zh-CN' ? '空间是当代的表达' : 'Space as a contemporary interpretation'}</h3><p>{language === 'zh-CN' ? '悬浮高度、材质、组内点阵形状与过渡轨迹由本作品设计。方位、点数和关系依图式保留；动画用于比较两图的布局。' : 'Height, materials, local point shapes and transition paths are designed for this work. Directions, counts and relations follow the diagrams; animation compares their layouts.'}</p></article>
          <article className="settings"><h3>{language === 'zh-CN' ? '体验设置' : 'Experience settings'}</h3>
            <button className="setting-row" aria-pressed={reduced} onClick={() => { remember('hl-reduced', String(!reduced)); useExperience.setState({ reduced: !reduced, relationPlaying: false }) }}><span>{t('reduced')}</span><span className={`switch ${reduced ? 'on' : ''}`}><i /></span></button>
            <button className="setting-row" onClick={() => useExperience.setState({ quality: quality === 'standard' ? 'low' : 'standard' })}><span>{t('quality')}</span><span>{quality === 'standard' ? t('auto') : t('low')} <ChevronDown size={12} /></span></button>
            <button className="setting-row" onClick={() => { useExperience.setState({ twoD: !twoD, failed: false }); onClose() }}><span>{twoD ? t('threeD') : t('twoD')}</span><ArrowUpRight size={15} /></button>
          </article>
          <article><h3>{language === 'zh-CN' ? '操作' : 'Controls'}</h3><p>{t('controls')}{language === 'zh-CN' ? '。键盘：方向键旋转，＋／－缩放，Home 复位；数字列表可直接选择。出处小注可悬停、聚焦或轻触展开。' : '. Keyboard: arrows orbit, +/− zoom, Home resets. The number list offers direct selection. Hover, focus or tap a reference mark to open the source.'}</p></article>
        </> : lessons[tab].map((lesson, index) => <article key={index}><h3>{pick(lesson.title, language)}</h3><p>{pick(lesson.body, language)} {lesson.source && <Citation source={lesson.source} />}{lesson.source2 && <Citation source={lesson.source2} />}</p>{lesson.action && <button className="text-button lesson-action" onClick={() => demonstrate(lesson.action!)}>{language === 'zh-CN' ? '在图中观察' : 'See it in the diagram'} <ArrowUpRight size={14} /></button>}</article>)}
      </div>
    </div>
  </div>
}

export default function App() {
  const state = useExperience()
  const { language, mode, lens, selected, twoD, failed, view, setMode, setLens, select } = state
  const [ready, setReady] = useState(false)
  const [modal, setModal] = useState<'read' | 'history' | 'method' | 'about' | null>(null)
  const [picker, setPicker] = useState(false)
  const [viewMenu, setViewMenu] = useState(false)
  const closeModal = useCallback(() => setModal(null), [])
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => useExperience.setState({ failed: true, twoD: true }), [])
  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'zh-CN' ? 'Hetu × Luoshu — 河图与洛书' : 'Hetu × Luoshu — An order of numbers'
  }, [language])
  useEffect(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    if (!context) onFailure()
    else context.getExtension('WEBGL_lose_context')?.loseContext()
  }, [onFailure])
  useEffect(() => {
    if (!state.relationPlaying || state.reduced || state.phaseStudy === 'mapping') return
    const timer = setInterval(() => {
      if (document.hidden) return
      useExperience.setState(s => s.relationStep >= 4 ? { relationPlaying: false } : { activePhase: phaseTarget(s.activePhase, s.phaseStudy)!, relationStep: s.relationStep + 1 })
    }, 4000)
    return () => clearInterval(timer)
  }, [state.relationPlaying, state.reduced, state.phaseStudy])
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && !modal) { select(null); setViewMenu(false); setPicker(false) } }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [select, modal])
  const lenses: Lens[] = mode === 'compare' ? ['original', 'polarity'] : mode === 'hetu' ? ['original', 'polarity', 'pairs', 'elements'] : ['original', 'polarity', 'balance', 'elements']
  const subtitle = mode === 'hetu' ? 'hetuSubtitle' : mode === 'luoshu' ? 'luoshuSubtitle' : 'compareSubtitle'
  const intro = mode === 'hetu' ? 'hetuIntro' : mode === 'luoshu' ? 'luoshuIntro' : 'compareIntro'
  const selectedGroup = selected === null ? null : groupFor(mode === 'hetu' ? 'hetu' : 'luoshu', selected)
  return <main className={`experience ${selected !== null || lens !== 'original' ? 'has-selection' : ''} ${state.panelCollapsed ? 'panel-collapsed' : ''}`} data-mode={mode} data-renderer={twoD ? 'svg' : 'webgl'}>
    <a className="skip-link" href="#number-index">{language === 'zh-CN' ? '跳至数字选择' : 'Skip to number selection'}</a>
    <div className="ambient-wash" aria-hidden="true" /><div className="grain" aria-hidden="true" />
    <header className="site-header">
      <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="Hetu × Luoshu"><span className="brand-symbol"><i /><i /></span><span>Hetu <b>×</b> Luoshu</span></a>
      <div className="header-actions"><SoundControl /><button className="learn-button" onClick={() => setModal('read')}><BookOpen size={14} /><span>{t('intro')}</span></button><span className="header-separator" />
        <button className="language-button" aria-label={language === 'zh-CN' ? 'Switch to English' : '切换至中文'} onClick={() => state.setLanguage(language === 'zh-CN' ? 'en' : 'zh-CN')}>{language === 'zh-CN' ? 'EN' : '中文'}</button>
        <button className="icon-button about-button" aria-label={t('about')} onClick={() => setModal('about')}><CircleHelp size={16} /></button>
      </div>
    </header>
    <div className="chapter-marker" aria-hidden="true"><span>{mode === 'hetu' ? '01' : mode === 'luoshu' ? '02' : '01—02'}</span><i /><span>{mode === 'hetu' ? 'THE RIVER MAP' : mode === 'luoshu' ? 'THE LUO WRITING' : 'IN RELATION'}</span></div>
    <div className="lens-toolbar" aria-label={t('explore')}>{lenses.map(item => <button key={item} aria-pressed={lens === item} onClick={() => setLens(item)}>{t(item)}</button>)}</div>
    <div className="art-space">
      {twoD ? <Diagram2D /> : <SceneBoundary onFailure={onFailure}><Suspense fallback={<div className="loading-art"><img src={`${import.meta.env.BASE_URL}poster.svg`} alt="" /><span>{t('loading')}</span></div>}><ExperienceScene onReady={onReady} /></Suspense></SceneBoundary>}
      {!twoD && ready && <SceneLabels />}
    </div>
    {mode === 'compare' && <div className="mobile-compare-switch">{(['hetu', 'luoshu'] as const).map(d => <button key={d} aria-pressed={state.comparisonDiagram === d} onClick={() => useExperience.setState({ comparisonDiagram: d })}>{t(d)}</button>)}</div>}
    <section className="work-title" aria-labelledby="work-title"><span className="eyebrow">{mode === 'hetu' ? 'THE RIVER MAP' : mode === 'luoshu' ? 'THE LUO WRITING' : 'TWO ORDERS, ONE FIELD'}</span>
      <h1 id="work-title">{t(mode)}</h1><p className="work-subtitle">{t(subtitle)}</p><p className="work-description">{t(intro)} {mode === 'hetu' && <Citation source="hetu" />}{mode === 'luoshu' && <Citation source="luoshu" />}</p>
    </section>
    <PointCount />
    <RelationPanel />
    <div className="diagram-navigation" aria-label={language === 'zh-CN' ? '图式选择' : 'Diagram selection'}>{(['hetu', 'luoshu', 'compare'] as Mode[]).map(item => <button key={item} aria-pressed={mode === item} onClick={() => setMode(item)}><span>{t(item)}</span>{mode === item && <i />}</button>)}</div>
    <div className="view-controls"><div className="view-menu-wrap"><button className="view-button" aria-label={t('view')} aria-expanded={viewMenu} onClick={() => setViewMenu(!viewMenu)}><Maximize2 size={15} /><span>{t('view')}</span><ChevronDown size={12} /></button>{viewMenu && <div className="view-menu">{(['oblique', 'top', 'focus'] as const).map(v => <button key={v} disabled={v === 'focus' && (selected === null || mode === 'compare')} onClick={() => { state.setView(v); setViewMenu(false) }}>{t(v)}{view === v && <Check size={12} />}</button>)}</div>}</div>
      <button className="icon-button reset-button" aria-label={t('reset')} onClick={() => state.setView('oblique')}><RotateCcw size={15} /></button>
    </div>
    <div className={`number-picker ${picker ? 'open' : ''}`} id="number-index"><button className="number-picker-trigger" aria-expanded={picker} onClick={() => setPicker(!picker)}>{t('selection')} <ChevronDown size={12} /></button><div className="number-list" aria-label={language === 'zh-CN' ? '选择数字' : 'Select a number'}>{Array.from({ length: mode === 'hetu' ? 10 : 9 }, (_, i) => i + 1).map(n => <button key={n} aria-label={`${t('selection')} ${n}`} aria-pressed={selected === n} onClick={() => select(n)}>{n}</button>)}</div></div>
    <footer className="site-footer"><span className="desktop-hint"><ArrowDownLeft size={12} />{t('controls')}</span><span className="mobile-hint">{t('mobileControls')}</span><span className="orientation-note">{view !== 'top' && mode !== 'compare' && !twoD ? <>{t('teaching')} <span className="small-dot" /></> : null}{t('orientation')} <span className="small-dot" /> {twoD ? '2D' : '3D'}</span></footer>
    {failed && <div className="fallback-notice" role="status">{t('fallback')}<button onClick={() => { useExperience.setState({ failed: false, twoD: false }); setReady(false) }}>{t('restore')}</button></div>}
    <span className="sr-only" aria-live="polite">{state.announcement}{selected !== null && selectedGroup ? ` · ${pick(directions[selectedGroup.direction], language)}${mode === 'hetu' || lens === 'elements' ? ` · ${pick(elements[selectedGroup.element], language)}` : ''} · ${selected % 2 ? t('yang') : t('yin')}` : ''}</span>
    {modal && <Learning initialTab={modal} onClose={closeModal} />}
  </main>
}
