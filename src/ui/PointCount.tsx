import { useEffect, useId, useRef, useState } from 'react'
import { pointCount, type Diagram } from '../domain/model'
import { copy, pick } from '../content/text'
import { useExperience } from '../state/store'
import { Citation } from './Citation'

export default function PointCount() {
  const { mode, language } = useExperience()
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()
  const chinese = language === 'zh-CN'
  const diagrams: Diagram[] = mode === 'compare' ? ['hetu', 'luoshu'] : [mode]
  function show() { if (timer.current) clearTimeout(timer.current); setOpen(true) }
  function hide() { if (!pinned) timer.current = setTimeout(() => { if (!document.querySelector('.source-popover')) setOpen(false) }, 180) }
  useEffect(() => {
    function close(event: KeyboardEvent | PointerEvent) {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !root.current?.contains(event.target as Node) && !(event.target as Element).closest('.source-popover')) { setOpen(false); setPinned(false) }
    }
    document.addEventListener('keydown', close); document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); if (timer.current) clearTimeout(timer.current) }
  }, [])
  return <div className="point-count" ref={root} onMouseEnter={show} onMouseLeave={hide}>
    <button className="point-count-trigger" aria-label={chinese ? '总点数与计算过程' : 'Total points and calculation'} aria-expanded={open} aria-controls={id} onFocus={show} onBlur={event => { if (!pinned && !event.relatedTarget?.closest?.('.point-count, .source-popover')) hide() }} onClick={() => { setPinned(!pinned); setOpen(!pinned) }}><span>{diagrams.map(d => pointCount(d).total).join(' / ')}</span><small>{pick(copy.totalPoints, language)}</small><i /></button>
    {open && <aside id={id} className="count-popover" role="note"><div className="count-heading"><span>{chinese ? '每组有几个点？' : 'How many points in each group?'}</span><button className="icon-button" aria-label={pick(copy.close, language)} onClick={() => { setOpen(false); setPinned(false) }}>×</button></div><p>{chinese ? '数字 n，表示这一组有 n 个点。' : 'A group numbered n contains n points.'}</p>{diagrams.map(d => {
      const count = pointCount(d)
      return <section key={d}><h3>{pick(copy[d], language)}</h3><div className="count-formula">{count.numbers.join(' + ')} = {count.total}</div><div className="count-parity"><i className="white-point" aria-hidden="true" /><span className="sr-only">{chinese ? '白点' : 'White points'}</span>{count.white}<span>+</span><i className="black-point" aria-hidden="true" /><span className="sr-only">{chinese ? '黑点' : 'Black points'}</span>{count.black}<span>= {count.total}</span></div><p>{d === 'hetu' ? chinese ? '一至十的总和。《系辞上》称天地之数五十有五。' : 'The sum of one through ten. The Xici names fifty-five as the total of the numbers of heaven and earth.' : chinese ? '本图采用九数洛书，45 是这九组点数的计算结果。' : 'This nine-number Luoshu has 45 points: the arithmetic sum of its nine groups.'} <Citation source={d === 'hetu' ? 'totals' : 'luoshu'} /></p></section>
    })}</aside>}
  </div>
}
