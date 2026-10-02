// Original contemporary composition: sparse pentatonic synthesis, no sampled recordings.
// Reproduce with Node and ffmpeg; audio generation is separate from the site build.
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const rate = 44100, seconds = 60, frames = rate * seconds
const left = new Float64Array(frames), right = new Float64Array(frames)
const tau = Math.PI * 2
const frequencies = [146.832, 164.814, 184.997, 220, 246.942, 293.665, 329.628]
const notes = [[1.4, 0], [6.2, 3], [11.8, 5], [17.3, 1], [23.1, 4], [28.6, 2], [35.4, 3], [40.8, 6], [46.5, 4], [53.2, 1], [58, 0]]
for (let i = 0; i < frames; i++) {
  const t = i / rate
  // Integer cycle counts make the long, quiet bed periodic across the loop seam.
  const envelope = .014 + .006 * Math.cos(tau * t / seconds)
  const a = Math.sin(tau * 4405 * t / seconds)
  const b = Math.sin(tau * 6600 * t / seconds)
  left[i] = envelope * (a + .4 * b)
  right[i] = envelope * (a + .4 * Math.sin(tau * 6600 * t / seconds + .035 * Math.sin(tau * t / seconds)))
}
notes.forEach(([time, note], index) => {
  const frequency = frequencies[note], start = Math.round(time * rate), pan = Math.sin(index * 1.7) * .38
  for (let j = 0; j < rate * 11; j++) {
    const t = j / rate, envelope = (1 - Math.exp(-t * 32)) * Math.exp(-t * .68) * Math.max(0, 1 - (t / 11) ** 8)
    let sample = 0
    for (let harmonic = 1; harmonic <= 6; harmonic++) sample += Math.sin(tau * frequency * harmonic * t) * Math.exp(-t * .16 * harmonic) / harmonic ** 2.5
    sample *= envelope * .09
    const frame = (start + j) % frames
    left[frame] += sample * (1 - pan); right[frame] += sample * (1 + pan)
  }
})
// Circular taps preserve reverb tails at the seam; no silence is inserted.
const wetL = left.slice(), wetR = right.slice()
for (const [delay, gain] of [[.173, .22], [.367, .16], [.619, .12], [1.031, .075], [1.733, .04]]) {
  const offset = Math.round(delay * rate)
  for (let i = 0; i < frames; i++) { const j = (i + offset) % frames; wetL[j] += right[i] * gain; wetR[j] += left[i] * gain }
}
let peak = 0
for (let i = 0; i < frames; i++) peak = Math.max(peak, Math.abs(wetL[i]), Math.abs(wetR[i]))
const scale = .35 / peak
const wav = Buffer.alloc(44 + frames * 4)
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 4, 28)
wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(frames * 4, 40)
for (let i = 0; i < frames; i++) { wav.writeInt16LE(Math.round(wetL[i] * scale * 32767), 44 + i * 4); wav.writeInt16LE(Math.round(wetR[i] * scale * 32767), 46 + i * 4) }
mkdirSync('.artifacts', { recursive: true }); mkdirSync('src/assets/audio', { recursive: true })
writeFileSync('.artifacts/soundscape-master.wav', wav)
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', '.artifacts/soundscape-master.wav', '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', '-metadata', 'title=Between numbers', '-metadata', 'artist=Hetu × Luoshu — original synthesized soundscape', 'src/assets/audio/between-numbers.mp3'])
process.stdout.write(`Rendered ${seconds}s original stereo soundscape; master peak −9.1 dBFS.\n`)
