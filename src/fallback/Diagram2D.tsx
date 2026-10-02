import { useEffect, useId, useMemo, useState } from 'react'
import { GENERATING, ELEMENT_COLORS, groupFor, phaseNodePosition, phaseNumbers, phaseSelection, phaseTarget, groupsFor, makeDots, numberLabelPosition, relatedNumbers, type Diagram } from '../domain/model'
import { copy, directions, elements, pick } from '../content/text'
import { useExperience } from '../state/store'

function DiagramSvg({ diagram, mini = false }: { diagram: Diagram; mini?: boolean }) {
  const { mode, selected, hovered, lens, line, language, select, activePhase, phaseStudy, setPhase } = useExperience()
  const dots = useMemo(() => makeDots(diagram), [diagram])
  const phase = phaseSelection(diagram, activePhase, phaseStudy)
  const related = lens === 'elements' ? [...phase.from, ...phase.to] : relatedNumbers(diagram, lens, selected ?? hovered, line, undefined, mode === 'compare')
  const marker = useId().replace(/:/g, '')
  const node = (element: typeof activePhase) => { const p = phaseNodePosition(element, false); return { x: p[0] * .7, y: p[2] * .35 - 3.5 } }
  const path = related.map(n => groupsFor(diagram).find(g => g.number === n)!).filter(Boolean)
  return <svg viewBox="-6 -6 12 12" className="diagram-svg" role="img" aria-label={`${pick(copy[diagram], language)} ${diagram === 'hetu' ? 55 : 45} ${pick(copy.count, language)}`}>
    <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={ELEMENT_COLORS[activePhase]} /></marker></defs>
    {lens === 'elements' && <g className="svg-phase-layer"><text x="0" y="-5.65" textAnchor="middle" fontSize=".18" fill="#9aaaae">{pick(copy.phaseRing, language)}</text>
      {phaseStudy !== 'mapping' && GENERATING.map(element => { const from = node(element), to = node(phaseTarget(element, phaseStudy)!); return <line key={element} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#9babb2" strokeWidth=".015" opacity=".25" /> })}
      {[...phase.from, ...phase.to].map(n => { const group = groupFor(diagram, n)!, hub = node(group.element); return <line key={n} x1={group.center[0] * .65} y1={group.center[2] * .65 + 1.3} x2={hub.x} y2={hub.y} stroke="#b3c5c7" strokeWidth=".014" strokeDasharray=".07 .07" opacity=".35" /> })}
      {phase.target && (() => { const from = node(activePhase), to = node(phase.target); const distance = Math.hypot(to.x - from.x, to.y - from.y); return <line className="svg-phase-arrow" x1={from.x} y1={from.y} x2={to.x - (to.x - from.x) / distance * .24} y2={to.y - (to.y - from.y) / distance * .24} stroke={ELEMENT_COLORS[activePhase]} strokeWidth=".04" markerEnd={`url(#${marker})`} /> })()}
      {GENERATING.map(element => { const hub = node(element); return <g key={element} onClick={() => setPhase(element)} className="svg-phase-node"><circle cx={hub.x} cy={hub.y} r=".17" fill="#10191f" stroke={ELEMENT_COLORS[element]} strokeWidth=".025" /><text x={hub.x} y={hub.y - .33} textAnchor="middle" fontSize=".26" fill={element === activePhase || element === phase.target ? '#eee4ca' : '#94a4a9'}>{pick(elements[element], language)} · {phaseNumbers(diagram, element).join('/')}</text><circle cx={hub.x} cy={hub.y} r=".35" fill="transparent" /></g> })}
    </g>}
    <g transform={lens === 'elements' ? 'translate(0 1.3) scale(.65)' : undefined}>
    <circle r="4.95" fill="none" stroke="#a1a9b0" strokeWidth=".008" opacity=".2" />
    {Array.from({ length: 48 }, (_, i) => <line key={i} x1={Math.sin(i * Math.PI / 24) * 5} y1={Math.cos(i * Math.PI / 24) * 5} x2={Math.sin(i * Math.PI / 24) * 5.1} y2={Math.cos(i * Math.PI / 24) * 5.1} stroke="#a1a9b0" strokeWidth=".008" opacity=".25" />)}
    {related.length > 1 && lens !== 'polarity' && lens !== 'elements' && <polyline points={path.map(g => `${g.center[0]},${g.center[2]}`).join(' ')} fill="none" stroke="#c0b28e" strokeWidth=".025" opacity=".6" />}
    {dots.map(dot => <circle key={dot.id} cx={dot.position[0]} cy={dot.position[2]} r=".145" fill={dot.yang ? '#e4e4db' : '#151d24'} stroke={dot.yang ? '#e4e4db' : '#8c9ba6'} strokeWidth={dot.yang ? '.005' : '.025'} opacity={related.length > 0 && !related.includes(dot.number) ? '.3' : '1'} />)}
    {groupsFor(diagram).map(group => <g key={group.number} className="svg-number-group" onClick={() => select(group.number)} onPointerEnter={() => useExperience.setState({ hovered: group.number })} onPointerLeave={() => useExperience.setState({ hovered: null })}>
      {group.number === 10 ? <circle r="1.05" fill="none" stroke="transparent" strokeWidth=".44" /> : <circle cx={group.center[0]} cy={group.center[2]} r=".72" fill="transparent" />}
      <text x={numberLabelPosition(diagram, group.number)[0]} y={numberLabelPosition(diagram, group.number)[2] + .07} textAnchor="middle" fontSize={lens === 'elements' ? '.32' : '.23'} fill={lens === 'elements' ? ELEMENT_COLORS[group.element] : related.includes(group.number) ? '#e0d1ab' : '#7a858d'}>{group.number}</text>
    </g>)}
    {([[0, -5.5, 'south'], [-5.5, 0, 'east'], [5.5, 0, 'west'], [0, 5.6, 'north']] as const).map(([x, y, dir]) => <text key={dir} x={x} y={y} fontSize=".2" textAnchor="middle" fill="#889196">{pick(directions[dir], language)}</text>)}
    {mini && <text x="0" y="5.96" fontSize=".2" textAnchor="middle" fill="#b8b4a7">{pick(copy[diagram], language)}</text>}
    </g>
  </svg>
}
export default function Diagram2D() {
  const { mode, comparisonDiagram } = useExperience()
  const [mobile, setMobile] = useState(innerWidth < 768)
  useEffect(() => { const resize = () => setMobile(innerWidth < 768); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize) }, [])
  return <div className={`fallback-art ${mode === 'compare' && !mobile ? 'fallback-compare' : ''}`}>
    {mode === 'compare' && !mobile ? <><DiagramSvg diagram="hetu" mini /><DiagramSvg diagram="luoshu" mini /></> : <DiagramSvg diagram={mode === 'compare' ? comparisonDiagram : mode} />}
  </div>
}
