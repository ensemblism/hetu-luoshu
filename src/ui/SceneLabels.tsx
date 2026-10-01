import { useEffect, useState } from 'react'
import { groupsFor, numberLabelPosition, relatedNumbers, type Diagram, type Vec3 } from '../domain/model'
import { directions, pick } from '../content/text'
import { useExperience } from '../state/store'

export default function SceneLabels() {
  const { mode, comparisonDiagram, language, lens, selected, hovered, line } = useExperience()
  const [mobile, setMobile] = useState(innerWidth < 768)
  useEffect(() => { const resize = () => setMobile(innerWidth < 768); window.addEventListener('resize', resize); return () => window.removeEventListener('resize', resize) }, [])
  const diagrams: Diagram[] = mode === 'compare' ? mobile ? [comparisonDiagram] : ['hetu', 'luoshu'] : [mode]
  const compared = mode === 'compare' && !mobile
  const markers = [[0, 0, -5.43, 'south'], [-5.5, 0, 0, 'east'], [5.5, 0, 0, 'west'], [0, 0, 5.48, 'north']] as const
  return <div className="scene-label-layer" aria-hidden="true">{diagrams.map((diagram, index) => {
    const offset = compared ? index === 0 ? -4.5 : 4.5 : 0
    const scale = compared ? .72 : 1
    const active = relatedNumbers(diagram, lens, selected ?? hovered, line)
    const world = ([x, y, z]: Vec3) => [x * scale + offset, y * scale, z * scale].join(',')
    return <div key={diagram}>
      {groupsFor(diagram).map(group => <span key={group.number} className={`scene-label scene-number ${active.includes(group.number) ? 'active' : ''}`} data-position={world(numberLabelPosition(diagram, group.number))}>{group.number}</span>)}
      {markers.map(([x, y, z, direction]) => <span key={direction} className="scene-label scene-direction" data-position={world([x, y, z])}>{pick(directions[direction], language)}</span>)}
      {compared && <span className="scene-label compare-label" data-position={`${offset},0,4.2`}>{diagram.toUpperCase()} / {diagram === 'hetu' ? '河图' : '洛书'}</span>}
    </div>
  })}</div>
}
