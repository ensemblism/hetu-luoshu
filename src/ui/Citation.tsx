import { useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sources } from '../content/sources'
import { copy, pick } from '../content/text'
import { useExperience } from '../state/store'

export function Citation({ source }: { source: string }) {
  const record = sources[source]
  const language = useExperience(s => s.language)
  const id = useId()
  const button = useRef<HTMLButtonElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suppressFocus = useRef(false)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  if (!record) return null
  function show() {
    if (timer.current) clearTimeout(timer.current)
    const box = button.current!.getBoundingClientRect()
    const width = Math.min(360, innerWidth - 32)
    setPosition({ left: Math.max(16, Math.min(innerWidth - width - 16, box.left - width / 2)), top: box.top > innerHeight / 2 ? Math.max(16, box.top - 265) : box.bottom + 12 })
    setOpen(true)
  }
  function hide() { if (!pinned) timer.current = setTimeout(() => setOpen(false), 170) }
  function close() { setPinned(false); setOpen(false); suppressFocus.current = true; button.current?.focus() }
  return <span className="citation-wrap">
    <button ref={button} type="button" className="citation-mark" aria-label={`${pick(copy.source, language)} · ${record.title}`} aria-expanded={open} aria-controls={id} aria-describedby={open ? id : undefined}
      onMouseEnter={show} onMouseLeave={hide} onFocus={() => { if (suppressFocus.current) suppressFocus.current = false; else show() }} onBlur={event => { if (!event.relatedTarget?.closest?.('.source-popover') && !pinned) setOpen(false) }}
      onClick={() => { if (pinned) { setPinned(false); setOpen(false) } else { setPinned(true); show() } }}
      onKeyDown={event => { if (event.key === 'Escape') { setPinned(false); setOpen(false) } }}>※</button>
    {open && createPortal(<aside id={id} className="source-popover" role="note" style={position} onMouseEnter={show} onMouseLeave={hide} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}>
      <div className="source-heading"><span>{record.kind === 'primary' ? (language === 'zh-CN' ? '文献出处' : 'PRIMARY SOURCE') : (language === 'zh-CN' ? '研究出处' : 'RESEARCH SOURCE')}</span><button aria-label={pick(copy.close, language)} onClick={close}>×</button></div>
      <strong>{record.title}</strong><span className="source-author">{record.author}</span><p className="source-section">{record.section}</p>
      {record.quote && <blockquote lang="zh-Hant">{record.quote}</blockquote>}
      <a href={record.url} target="_blank" rel="noopener noreferrer">{pick(copy.readSource, language)}</a>
    </aside>, document.body)}
  </span>
}
