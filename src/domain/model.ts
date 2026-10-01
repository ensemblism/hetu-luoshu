export type Diagram = 'hetu' | 'luoshu'
export type Mode = Diagram | 'compare'
export type Language = 'zh-CN' | 'en'
export type Lens = 'original' | 'polarity' | 'pairs' | 'balance' | 'elements'
export type Direction = 'north' | 'south' | 'east' | 'west' | 'center' | 'ne' | 'nw' | 'se' | 'sw'
export type Element = 'water' | 'fire' | 'wood' | 'metal' | 'earth'
export type Vec3 = [number, number, number]
export interface NumberGroup { number: number; direction: Direction; center: Vec3; element: Element }
export interface Dot { id: string; number: number; index: number; position: Vec3; yang: boolean }

// World X points west; world Z points north. The reading view has south at the top.
export const HETU: NumberGroup[] = [
  { number: 1, direction: 'north', center: [0, 0, 2.35], element: 'water' },
  { number: 2, direction: 'south', center: [0, 0, -2.35], element: 'fire' },
  { number: 3, direction: 'east', center: [-2.35, 0, 0], element: 'wood' },
  { number: 4, direction: 'west', center: [2.35, 0, 0], element: 'metal' },
  { number: 5, direction: 'center', center: [0, 0, 0], element: 'earth' },
  { number: 6, direction: 'north', center: [0, 0, 3.6], element: 'water' },
  { number: 7, direction: 'south', center: [0, 0, -3.6], element: 'fire' },
  { number: 8, direction: 'east', center: [-3.6, 0, 0], element: 'wood' },
  { number: 9, direction: 'west', center: [3.6, 0, 0], element: 'metal' },
  { number: 10, direction: 'center', center: [0, 0, 0], element: 'earth' },
]
export const LUOSHU_GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]] as const
const palaceElements: Element[] = ['earth', 'water', 'earth', 'wood', 'wood', 'earth', 'metal', 'metal', 'earth', 'fire']
const palaceDirections: Direction[][] = [['se', 'south', 'sw'], ['east', 'center', 'west'], ['ne', 'north', 'nw']]
export const LUOSHU: NumberGroup[] = LUOSHU_GRID.flatMap((row, z) => row.map((number, x) => ({
  number, direction: palaceDirections[z][x], center: [(x - 1) * 2.8, 0, (z - 1) * 2.8] as Vec3,
  element: palaceElements[number],
}))).sort((a, b) => a.number - b.number)
export const HETU_PAIRS = [[1, 6], [2, 7], [3, 8], [4, 9], [5, 10]] as const
export const BALANCE_LINES = [
  [4, 9, 2], [3, 5, 7], [8, 1, 6], [4, 3, 8], [9, 5, 1], [2, 7, 6], [4, 5, 6], [2, 5, 8],
] as const
export const OPPOSITE_PAIRS = [[1, 9], [2, 8], [3, 7], [4, 6]] as const
export const ELEMENT_COLORS: Record<Element, string> = { water: '#829cad', fire: '#c18c7c', wood: '#8ea992', metal: '#b7c2cb', earth: '#c5ae7d' }
export const GENERATING: Element[] = ['wood', 'fire', 'earth', 'metal', 'water']
export const CONTROLLING: Element[] = ['wood', 'earth', 'water', 'fire', 'metal']
export const groupsFor = (diagram: Diagram) => diagram === 'hetu' ? HETU : LUOSHU
export const groupFor = (diagram: Diagram, number: number) => groupsFor(diagram).find(group => group.number === number)
export function numberLabelPosition(diagram: Diagram, number: number): Vec3 {
  const center = groupFor(diagram, number)!.center
  const offsets: Record<number, [number, number]> = { 1: [.65, 0], 2: [.7, 0], 3: [0, .75], 4: [0, .75], 5: [0, .75], 6: [0, .92], 7: [0, -.88], 8: [-.86, 0], 9: [.86, 0], 10: [1.45, 0] }
  const [x, z] = diagram === 'hetu' ? offsets[number] : [0, .86]
  return [center[0] + x, .12, center[2] + z]
}

export function localDots(number: number): [number, number][] {
  const s = 0.38
  if (number === 1) return [[0, 0]]
  if (number === 2) return [[-s / 2, 0], [s / 2, 0]]
  if (number === 3) return [[-s, 0], [0, 0], [s, 0]]
  if (number === 4) return [[-s / 2, -s / 2], [s / 2, -s / 2], [-s / 2, s / 2], [s / 2, s / 2]]
  if (number === 5) return [[-s, -s], [s, -s], [0, 0], [-s, s], [s, s]]
  if (number === 6) return [-s / 2, s / 2].flatMap(x => [-s, 0, s].map(z => [x, z] as [number, number]))
  if (number === 7) return [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 0.48, Math.sin(i * Math.PI / 3) * 0.48] as [number, number])]
  if (number === 8) return [-s, 0, s].flatMap(x => [-s, 0, s].filter(z => x !== 0 || z !== 0).map(z => [x, z] as [number, number]))
  if (number === 9) return [-s, 0, s].flatMap(x => [-s, 0, s].map(z => [x, z] as [number, number]))
  return Array.from({ length: 10 }, (_, i) => [Math.cos(i * Math.PI / 5) * 1.04, Math.sin(i * Math.PI / 5) * 1.04])
}
export function makeDots(diagram: Diagram): Dot[] {
  return groupsFor(diagram).flatMap(group => localDots(group.number).map(([x, z], index) => ({
    id: `${group.number}:${index}`, number: group.number, index, yang: group.number % 2 === 1,
    position: [group.center[0] + x, 0.2, group.center[2] + z] as Vec3,
  })))
}
export function relatedNumbers(diagram: Diagram, lens: Lens, selected: number | null, line: number): number[] {
  if (lens === 'balance' && diagram === 'luoshu') return [...BALANCE_LINES[line % 8]]
  if (selected === null) return []
  if (lens === 'polarity') return groupsFor(diagram).filter(g => g.number % 2 === selected % 2).map(g => g.number)
  if (lens === 'elements') return groupsFor(diagram).filter(g => g.element === groupFor(diagram, selected)?.element).map(g => g.number)
  if (diagram === 'hetu') return [...(HETU_PAIRS.find(pair => pair.includes(selected as never)) || [selected])]
  return selected === 5 ? [5] : [selected, 10 - selected, 5]
}
