import { useEffect, useState } from 'react'
import { BALANCE_LINES, GENERATING, groupPosition, groupsFor, numberLabelPosition, phaseNodePosition, phaseNumbers, phaseSelection, relatedNumbers, type Diagram, type Vec3 } from '../domain/model'
import { copy, directions, elements, pick } from '../content/text'
import { useExperience } from '../state/store'

export default function SceneLabels() {
  const { mode, comparisonDiagram, language, lens, view, selected, hovered, line, activePhase, phaseStudy } = useExperience()
  const [mobile, setMobile] = useState(innerWidth < 768)
  useEffect(() => { const resize = () => setMobile(innerWidth < 768); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize) }, [])
  const diagrams: Diagram[] = mode === 'compare' ? mobile ? [comparisonDiagram] : ['hetu', 'luoshu'] : [mode]
  const compared = mode === 'compare' && !mobile
  const expanded = view !== 'top' && mode !== 'compare'
  const markers = [[0, 0, -5.43, 'south'], [-5.5, 0, 0, 'east'], [5.5, 0, 0, 'west'], [0, 0, 5.48, 'north']] as const
  return <div className="scene-label-layer" aria-hidden="true">{diagrams.map((diagram, index) => {
    const offset = compared ? index === 0 ? -4.5 : 4.5 : 0
    const scale = compared ? .72 : 1
    const phase = phaseSelection(diagram, activePhase, phaseStudy)
    const active = lens === 'elements' ? [...phase.from, ...phase.to] : relatedNumbers(diagram, lens, selected ?? hovered, line, undefined, mode === 'compare')
    const world = ([x, y, z]: Vec3) => [x * scale + offset, y * scale, z * scale].join(',')
    const palacePath = lens === 'balance' ? [...BALANCE_LINES[line]] : selected === null || selected === 5 ? [9, 5, 1] : [selected, 5, 10 - selected]
    return <div key={diagram}>
      {groupsFor(diagram).map(group => { const p = numberLabelPosition(diagram, group.number); p[1] = groupPosition(diagram, group.number, lens, expanded)[1] + .06; return <span key={group.number} className={`scene-label scene-number ${active.includes(group.number) ? 'active' : ''} ${phase.to.includes(group.number) && lens === 'elements' ? 'target' : ''}`} data-position={world(p)}>{group.number}</span> })}
      {markers.map(([x, y, z, direction]) => <span key={direction} className="scene-label scene-direction" data-position={world([x, expanded && diagram === 'hetu' && (lens === 'original' || lens === 'pairs') ? direction === 'south' ? 5.1 : direction === 'north' ? 0 : 2.55 : y, z])}>{pick(directions[direction], language)}</span>)}
      {lens === 'elements' && <>
        {GENERATING.map(element => { const p = phaseNodePosition(element, expanded); const shown = !mobile || element === activePhase || element === phase.target; return <span key={element} className={`scene-label scene-phase ${element === activePhase ? 'from' : element === phase.target ? 'to' : ''} ${shown ? '' : 'mobile-hidden'}`} data-position={world([p[0], p[1] + .18, p[2]])}>{pick(elements[element], language)}<small>{phaseNumbers(diagram, element).join(' · ')}</small></span> })}
        <span className="scene-label scene-layer-caption" data-position={world([0, expanded ? 4.6 : .24, -4.5])}>{pick(copy.phaseRing, language)}</span>
      </>}
      {expanded && diagram === 'hetu' && (lens === 'original' || lens === 'pairs') && <><span className="scene-label scene-layer-caption" data-position={world([-3.3, .2, 4.3])}>{pick(copy.generatingNumbers, language)}</span><span className="scene-label scene-layer-caption" data-position={world([-3.3, 5.1, 4.3])}>{pick(copy.completingNumbers, language)}</span></>}
      {expanded && diagram === 'luoshu' && (lens === 'original' || lens === 'balance') && <span className="scene-label scene-layer-formula" data-position={world([0, 1.8, 4.2])}>{palacePath.join(' + ')} = 15</span>}
      {compared && <span className="scene-label compare-label" data-position={`${offset},0,4.2`}>{diagram.toUpperCase()} / {diagram === 'hetu' ? '河图' : '洛书'}</span>}
    </div>
  })}</div>
}
