import { describe, expect, it } from 'vitest'
import { BALANCE_LINES, CONTROLLING, GENERATING, HETU, HETU_PAIRS, LUOSHU, LUOSHU_GRID, OPPOSITE_PAIRS, groupFor, groupPosition, localDots, makeDots, phaseSelection, phaseTarget, pointCount } from '../../src/domain/model'
import { copy, lessons } from '../../src/content/text'
import { sources } from '../../src/content/sources'

describe('diagram invariants, checked against the chosen traditional arrangements', () => {
  it('has exact point counts, stable identities and correct parity', () => {
    for (const [diagram, total, max] of [['hetu', 55, 10], ['luoshu', 45, 9]] as const) {
      const dots = makeDots(diagram)
      expect(dots).toHaveLength(total)
      expect(new Set(dots.map(d => d.id)).size).toBe(total)
      for (let n = 1; n <= max; n++) {
        expect(dots.filter(d => d.number === n)).toHaveLength(n)
        expect(dots.filter(d => d.number === n).every(d => d.yang === (n % 2 === 1))).toBe(true)
        expect(new Set(localDots(n).map(p => p.join(','))).size).toBe(n)
      }
    }
    expect(makeDots('hetu').filter(d => d.yang)).toHaveLength(25)
    expect(makeDots('hetu').filter(d => !d.yang)).toHaveLength(30)
    expect(makeDots('luoshu').filter(d => d.yang)).toHaveLength(25)
    expect(makeDots('luoshu').filter(d => !d.yang)).toHaveLength(20)
  })
  it('keeps generating pairs in the correct direction and phase', () => {
    const reference = ['water', 'fire', 'wood', 'metal', 'earth']
    const directions = ['north', 'south', 'east', 'west', 'center']
    HETU_PAIRS.forEach(([a, b], index) => {
      expect(b - a).toBe(5)
      expect(groupFor('hetu', a)?.element).toBe(reference[index])
      expect(groupFor('hetu', b)?.element).toBe(reference[index])
      expect(groupFor('hetu', a)?.direction).toBe(directions[index])
      expect(groupFor('hetu', b)?.direction).toBe(directions[index])
    })
    expect(HETU).toHaveLength(10)
  })
  it('uses the south-above grid without mirroring and satisfies all eight sums', () => {
    expect(LUOSHU_GRID).toEqual([[4, 9, 2], [3, 5, 7], [8, 1, 6]])
    expect(BALANCE_LINES).toHaveLength(8)
    for (const line of BALANCE_LINES) expect(line.reduce<number>((a, b) => a + b, 0)).toBe(15)
    for (const pair of OPPOSITE_PAIRS) expect(pair[0] + pair[1]).toBe(10)
    expect(groupFor('luoshu', 9)?.center[2]).toBeLessThan(0)
    expect(groupFor('luoshu', 3)?.center[0]).toBeLessThan(0)
    expect(groupFor('luoshu', 6)?.direction).toBe('nw')
    expect(LUOSHU).toHaveLength(9)
  })
  it('does not conflate Hetu phases with later palace associations', () => {
    expect(groupFor('hetu', 6)?.element).toBe('water')
    expect(groupFor('luoshu', 6)?.element).toBe('metal')
    expect(groupFor('hetu', 2)?.element).toBe('fire')
    expect(groupFor('luoshu', 2)?.element).toBe('earth')
  })
  it('matches 45 points across the transition, leaving only the ten-group to fade', () => {
    const targetIds = new Set(makeDots('luoshu').map(d => d.id))
    const removed = makeDots('hetu').filter(d => !targetIds.has(d.id))
    expect(removed).toHaveLength(10)
    expect(removed.every(d => d.number === 10)).toBe(true)
  })
  it('explains totals from the actual number groups and includes every member of both phase endpoints', () => {
    expect(pointCount('hetu')).toMatchObject({ total: 55, white: 25, black: 30 })
    expect(pointCount('luoshu')).toMatchObject({ total: 45, white: 25, black: 20 })
    expect(phaseSelection('hetu', 'water', 'generating')).toEqual({ from: [1, 6], to: [3, 8], target: 'wood' })
    expect(phaseSelection('luoshu', 'water', 'generating')).toEqual({ from: [1], to: [3, 4], target: 'wood' })
    expect(phaseSelection('luoshu', 'earth', 'mapping')).toEqual({ from: [2, 5, 8], to: [], target: null })
    for (const [study, sequence] of [['generating', GENERATING], ['controlling', CONTROLLING]] as const) sequence.forEach((phase, index) => expect(phaseTarget(phase, study)).toBe(sequence[(index + 1) % 5]))
  })
  it('keeps canonical directions independent from contemporary heights and later trigram associations', () => {
    expect(groupFor('luoshu', 6)?.trigram).toBe('qian')
    expect(groupFor('luoshu', 5)?.trigram).toBeUndefined()
    for (const diagram of ['hetu', 'luoshu'] as const) for (const group of diagram === 'hetu' ? HETU : LUOSHU) {
      const expanded = groupPosition(diagram, group.number, 'original', true)
      const flat = groupPosition(diagram, group.number, 'original', false)
      expect([expanded[0], expanded[2]]).toEqual([flat[0], flat[2]])
      expect(flat[1]).toBe(.2)
      expect(expanded[1]).toBe(diagram === 'hetu' && group.number >= 6 ? 5.1 : .2)
    }
  })
})
describe('bilingual content and traceable references', () => {
  it('has both languages and resolves every cited source', () => {
    for (const text of Object.values(copy)) expect(text.every(v => v.trim().length > 0)).toBe(true)
    for (const item of Object.values(lessons).flat()) {
      expect(item.title.every(Boolean)).toBe(true)
      expect(item.body.every(Boolean)).toBe(true)
      if (item.source) expect(sources[item.source]).toBeDefined()
      if ('source2' in item && typeof item.source2 === 'string') expect(sources[item.source2]).toBeDefined()
    }
    for (const source of Object.values(sources)) {
      expect(source.title).toBeTruthy(); expect(source.author).toBeTruthy(); expect(source.section).toBeTruthy()
      expect(new URL(source.url).protocol).toBe('https:')
    }
  })
})
