import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import soundtrack from '../assets/audio/between-numbers.mp3'
import { copy, pick } from '../content/text'
import { remember, useExperience } from '../state/store'

class Soundscape {
  context: AudioContext | null = null
  gain: GainNode | null = null
  buffer: Promise<AudioBuffer> | null = null
  source: AudioBufferSourceNode | null = null
  offset = 0
  startedAt = 0
  version = 0
  async play(volume: number) {
    const version = ++this.version
    this.context ||= new AudioContext()
    if (!this.gain) { this.gain = this.context.createGain(); this.gain.connect(this.context.destination) }
    await this.context.resume()
    const context = this.context
    this.buffer ||= fetch(soundtrack).then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer() }).then(data => context.decodeAudioData(data)).catch(error => { this.buffer = null; throw error })
    const buffer = await this.buffer
    if (version !== this.version) return false
    if (context.state !== 'running') await context.resume()
    if (version !== this.version) return false
    this.source?.stop()
    const source = context.createBufferSource()
    source.buffer = buffer; source.loop = true; source.connect(this.gain)
    this.gain.gain.cancelScheduledValues(context.currentTime)
    this.gain.gain.setValueAtTime(0, context.currentTime)
    this.gain.gain.linearRampToValueAtTime(volume, context.currentTime + 1)
    source.start(0, this.offset % buffer.duration)
    this.source = source; this.startedAt = context.currentTime
    return true
  }
  pause() {
    this.version++
    const { context, source, gain } = this
    if (!context) return
    if (!source || !gain) { void context.suspend(); return }
    this.offset += context.currentTime - this.startedAt
    gain.gain.cancelScheduledValues(context.currentTime)
    gain.gain.setValueAtTime(gain.gain.value, context.currentTime)
    gain.gain.linearRampToValueAtTime(0, context.currentTime + .7)
    source.stop(context.currentTime + .72)
    source.onended = () => { source.disconnect(); if (!this.source) void context.suspend() }
    this.source = null
  }
  volume(value: number) { if (this.context && this.gain) { this.gain.gain.cancelScheduledValues(this.context.currentTime); this.gain.gain.setTargetAtTime(value, this.context.currentTime, .1) } }
  destroy() { this.version++; this.source?.stop(); void this.context?.close() }
}

function savedVolume() { try { const value = Number(localStorage.getItem('hl-volume') ?? .26); return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .26 } catch { return .26 } }
export default function SoundControl() {
  const language = useExperience(s => s.language)
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [volume, setVolume] = useState(savedVolume)
  const [open, setOpen] = useState(false)
  const engine = useRef<Soundscape | null>(null)
  const active = useRef(false)
  const currentVolume = useRef(volume)
  function start() {
    engine.current ||= new Soundscape()
    setStatus('loading')
    void engine.current.play(currentVolume.current).then(played => { if (played && active.current) setStatus('playing') }).catch(() => { if (active.current) { setStatus('error'); engine.current?.pause(); active.current = false; setEnabled(false) } })
  }
  function toggle() {
    active.current = !active.current; setEnabled(active.current)
    if (active.current) start()
    else { engine.current?.pause(); setStatus('idle') }
  }
  useEffect(() => {
    const visibility = () => { if (document.hidden) { engine.current?.pause(); setStatus('idle') } else if (active.current) start() }
    document.addEventListener('visibilitychange', visibility)
    return () => { document.removeEventListener('visibilitychange', visibility); active.current = false; engine.current?.destroy(); engine.current = null }
  }, [])
  return <div className="sound-control" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false) }}>
    <button className="icon-button sound-toggle" aria-label={pick(enabled ? copy.soundOff : copy.soundOn, language)} aria-pressed={enabled} onFocus={() => setOpen(true)} onClick={() => { toggle(); setOpen(true) }}>{enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
    {open && <div className="sound-popover"><span className="eyebrow">{language === 'zh-CN' ? '数之间 / 原创音景' : 'BETWEEN NUMBERS / ORIGINAL SOUNDSCAPE'}</span><label>{pick(copy.volume, language)}<input type="range" min="0" max="1" step=".01" value={volume} aria-label={pick(copy.volume, language)} onChange={event => { const value = Number(event.target.value); setVolume(value); currentVolume.current = value; remember('hl-volume', String(value)); engine.current?.volume(value) }} /></label><p role="status">{status === 'loading' ? pick(copy.soundLoading, language) : status === 'error' ? pick(copy.soundError, language) : language === 'zh-CN' ? '合成拨弦与泛音。轻触图标开关声音。' : 'Synthesized plucks and harmonics. Tap the icon to toggle.'}</p><button className="text-button" onClick={() => setOpen(false)}>{pick(copy.close, language)}</button></div>}
  </div>
}
