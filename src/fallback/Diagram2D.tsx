import { useEffect, useMemo, useState } from 'react'
import { CONTROLLING, GENERATING, ELEMENT_COLORS, groupsFor, makeDots, numberLabelPosition, relatedNumbers, type Diagram } from '../domain/model'
import { copy, directions, pick } from '../content/text'
import { useExperience } from '../state/store'

function DiagramSvg({ diagram, mini = false }: { diagram: Diagram; mini?: boolean }) {
  const { selected, hovered, lens, line, language, select, guide, cycle, cycleIndex, relationPlaying } = useExperience()
  const dots = useMemo(() => makeDots(diagram), [diagram])
  const related = relatedNumbers(diagram, lens, selected ?? hovered, line, relationPlaying ? (cycle === 'generating' ? GENERATING : CONTROLLING)[cycleIndex % 5] : undefined)
  const path = related.map(n => groupsFor(diagram).find(g => g.number === n)!).filter(Boolean)
  return <svg viewBox="-6 -6 12 12" className="diagram-svg" role="img" aria-label={`${pick(copy[diagram], language)} ${diagram === 'hetu' ? 55 : 45} ${pick(copy.count, language)}`}>
    <circle r="4.95" fill="none" stroke="#a1a9b0" strokeWidth=".008" opacity=".2" />
    {Array.from({ length: 48 }, (_, i) => <line key={i} x1={Math.sin(i * Math.PI / 24) * 5} y1={Math.cos(i * Math.PI / 24) * 5} x2={Math.sin(i * Math.PI / 24) * 5.1} y2={Math.cos(i * Math.PI / 24) * 5.1} stroke="#a1a9b0" strokeWidth=".008" opacity=".25" />)}
    {related.length > 1 && lens !== 'polarity' && lens !== 'elements' && <polyline points={path.map(g => `${g.center[0]},${g.center[2]}`).join(' ')} fill="none" stroke="#c0b28e" strokeWidth=".025" opacity=".6" />}
    {dots.map(dot => <circle key={dot.id} cx={dot.position[0]} cy={dot.position[2]} r=".145" fill={dot.yang ? '#e4e4db' : '#151d24'} stroke={dot.yang ? '#e4e4db' : '#8c9ba6'} strokeWidth={dot.yang ? '.005' : '.025'} opacity={related.length > 0 && !related.includes(dot.number) ? '.3' : '1'} />)}
    {groupsFor(diagram).map(group => <g key={group.number} className="svg-number-group" onClick={() => !guide && select(group.number)} onPointerEnter={() => useExperience.setState({ hovered: group.number })} onPointerLeave={() => useExperience.setState({ hovered: null })}>
      {group.number === 10 ? <circle r="1.05" fill="none" stroke="transparent" strokeWidth=".44" /> : <circle cx={group.center[0]} cy={group.center[2]} r=".72" fill="transparent" />}
      <text x={numberLabelPosition(diagram, group.number)[0]} y={numberLabelPosition(diagram, group.number)[2] + .07} textAnchor="middle" fontSize=".23" fill={lens === 'elements' ? ELEMENT_COLORS[group.element] : related.includes(group.number) ? '#e0d1ab' : '#7a858d'}>{group.number}</text>
    </g>)}
    {([[0, -5.5, 'south'], [-5.5, 0, 'east'], [5.5, 0, 'west'], [0, 5.6, 'north']] as const).map(([x, y, dir]) => <text key={dir} x={x} y={y} fontSize=".2" textAnchor="middle" fill="#889196">{pick(directions[dir], language)}</text>)}
    {mini && <text x="0" y="5.96" fontSize=".2" textAnchor="middle" fill="#b8b4a7">{pick(copy[diagram], language)}</text>}
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
