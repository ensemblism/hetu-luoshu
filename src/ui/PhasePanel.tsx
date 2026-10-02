import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { GENERATING, groupFor, phaseNumbers, phaseTarget, type Diagram, type Element, type PhaseStudy } from '../domain/model'
import { copy, directions, elements, pick, trigrams } from '../content/text'
import { useExperience } from '../state/store'
import { Citation } from './Citation'

export default function PhasePanel({ diagram }: { diagram: Diagram }) {
  const { language, activePhase, phaseStudy, relationPlaying, relationStep, reduced, setPhase, setPhaseStudy, stepRelation } = useExperience()
  const chinese = language === 'zh-CN'
  const target = phaseTarget(activePhase, phaseStudy)
  const label = (phase: Element) => pick(elements[phase], language)
  function association(phase: Element) {
    const numbers = phaseNumbers(diagram, phase)
    return <div className={`phase-association ${phase === activePhase ? 'from' : 'to'}`} data-phase={phase}>
      <div className="phase-association-heading"><strong>{label(phase)}</strong><span>{numbers.join(' · ')}</span></div>
      {diagram === 'hetu' ? <div className="association-detail">{pick(directions[groupFor(diagram, numbers[0])!.direction], language)} <span>·</span> {chinese ? `生数 ${numbers[0]} / 成数 ${numbers[1]}` : `Generating ${numbers[0]} / completing ${numbers[1]}`}</div>
        : <div className="association-detail palace-detail">{numbers.map(n => {
          const group = groupFor(diagram, n)!
          return <span key={n}>{n} <span>→</span> {pick(directions[group.direction], language)} <span>→</span> {group.trigram ? pick(trigrams[group.trigram], language) : chinese ? '中央土' : 'Central earth'}</span>
        })}</div>}
    </div>
  }
  return <div className="phase-study">
    <div className="cycle-toggle" aria-label={chinese ? '五行观察方式' : 'Five-phase study'}>{(['mapping', 'generating', 'controlling'] as PhaseStudy[]).map(study => <button key={study} aria-pressed={phaseStudy === study} onClick={() => setPhaseStudy(study)}>{pick(copy[study], language)}</button>)}</div>
    <div className="phase-choices" aria-label={chinese ? '选择五行' : 'Select a phase'}>{GENERATING.map(phase => <button key={phase} aria-pressed={activePhase === phase} onClick={() => setPhase(phase)}>{label(phase)}</button>)}</div>
    {target ? <div className="phase-formula" role="status"><span>{label(activePhase)}</span><small>{chinese ? phaseStudy === 'generating' ? '生' : '克' : phaseStudy === 'generating' ? 'generates' : 'controls'}</small><ArrowRight size={17} /><span>{label(target)}</span></div> : <h3 className="phase-mapping-title">{label(activePhase)} <span>{chinese ? '在图中的位置' : 'in this diagram'}</span></h3>}
    {target && <div className="phase-navigation"><button className="icon-button" aria-label={pick(copy.previous, language)} onClick={() => stepRelation(-1)}><ArrowLeft size={15} /></button><span>{relationStep + 1} / 5</span><button className="icon-button" aria-label={pick(copy.next, language)} onClick={() => stepRelation(1)}><ArrowRight size={15} /></button>{!reduced && <button className="relation-play" onClick={() => useExperience.setState({ relationPlaying: !relationPlaying, relationStep: relationPlaying ? relationStep : 0 })}>{relationPlaying ? <Pause size={13} /> : <Play size={13} />}{pick(relationPlaying ? copy.pause : copy.playRelation, language)}</button>}</div>}
    <div className={`phase-members ${target ? 'has-target' : ''}`}>{association(activePhase)}{target && association(target)}</div>
    <p>{diagram === 'hetu' ? chinese ? '先看五方，再认生成数。每一行配属一对数字，彼此相差五。' : 'Begin with directions, then read each generating/completing pair: two numbers differing by five.' : chinese ? '先读九宫方位，再参照后天卦的五行配属。中五另依中央土配属。' : 'Read the palace direction, then its later trigram–phase association. Five is associated separately with central earth.'} <Citation source={diagram === 'hetu' ? 'generation' : 'palace'} />{diagram === 'luoshu' && <><Citation source="luoshu" /><Citation source="centralEarth" /></>}</p>
    {target && <p className="phase-meaning">{chinese ? phaseStudy === 'generating' ? '相生，观察资生、助长的次序。箭头从生出者指向受生者。' : '相克，观察制约的次序。箭头从施克者指向受克者。' : phaseStudy === 'generating' ? 'Generating: follow the order of support. The arrow points from the generating phase to the generated phase.' : 'Controlling: follow the order of restraint. The arrow points from the controlling phase to the controlled phase.'} <Citation source={phaseStudy === 'generating' ? 'generatingCycle' : 'cycle'} /></p>}
  </div>
}
