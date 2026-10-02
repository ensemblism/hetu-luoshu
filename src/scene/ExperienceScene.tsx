import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import type { OrbitControls as OrbitControlsType } from 'three-stdlib'
import { BALANCE_LINES, ELEMENT_COLORS, GENERATING, HETU_PAIRS, groupFor, groupPosition, groupsFor, makeDots, phaseNodePosition, phaseSelection, phaseTarget, relatedNumbers, type Diagram, type Dot, type Vec3 } from '../domain/model'
import { useExperience } from '../state/store'

const ALL_DOTS = makeDots('hetu')
const object = new THREE.Object3D()
const color = new THREE.Color()
const tmpVector = new THREE.Vector3()

function Lighting() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const environment = generator.fromScene(room, 0.04)
    scene.environment = environment.texture
    scene.environmentIntensity = 0.65
    invalidate()
    return () => { scene.environment = null; environment.dispose(); room.dispose(); generator.dispose() }
  }, [gl, scene, invalidate])
  return <>
    <ambientLight intensity={0.35} />
    <hemisphereLight args={['#c5d0d8', '#191613', 1.25]} />
    <directionalLight position={[4, 8, 6]} intensity={3.6} color="#fff2dc" />
    <directionalLight position={[-5, 4, -6]} intensity={4.3} color="#9ab5c8" />
  </>
}

function CameraRig() {
  const controls = useRef<OrbitControlsType>(null)
  const { camera, size, invalidate, gl } = useThree()
  const { mode, lens, view, cameraVersion, selected, reduced, line } = useExperience()
  const animation = useRef<gsap.core.Timeline | null>(null)
  useEffect(() => {
    const control = controls.current
    if (!control) return
    animation.current?.kill()
    const ortho = camera as THREE.OrthographicCamera
    const mobile = size.width < 768
    const fit = Math.min(size.width / (mode === 'compare' && !mobile ? 19 : 11.8), size.height / (mobile && lens !== 'elements' ? 14.8 : 11.6))
    const expanded = view !== 'top' && mode !== 'compare'
    let target: Vec3 = [0, lens === 'elements' && expanded ? 1.2 : mode === 'hetu' && expanded && (lens === 'original' || lens === 'pairs') ? 1.8 : 0, 0]
    if (view === 'focus' && selected !== null && mode !== 'compare' && lens !== 'elements') {
      const members = mode === 'hetu' ? [...(HETU_PAIRS.find(pair => pair.some(n => n === selected)) || [selected])] : lens === 'balance' ? [...BALANCE_LINES[line]] : selected === 5 ? [5] : [selected, 5, 10 - selected]
      const points = members.map(n => groupPosition(mode, n, lens, expanded))
      target = [0, 1, 2].map(axis => (Math.min(...points.map(p => p[axis])) + Math.max(...points.map(p => p[axis]))) / 2) as Vec3
    }
    const position: Vec3 = view === 'top' ? [target[0], 16, target[2] + .01] : [target[0] + 1.1, target[1] + 11.5, target[2] + 12.5]
    const zoom = fit * (lens === 'elements' ? 1 : view === 'focus' && selected !== null ? 1.55 : 1)
    control.enabled = false
    animation.current = gsap.timeline({ onUpdate: () => { control.update(); invalidate() }, onComplete: () => { control.enabled = true; invalidate() } })
      .to(camera.position, { x: position[0], y: position[1], z: position[2], duration: reduced ? 0 : 0.85, ease: 'power3.inOut' }, 0)
      .to(control.target, { x: target[0], y: target[1], z: target[2], duration: reduced ? 0 : 0.85, ease: 'power3.inOut' }, 0)
      .to(ortho, { zoom, duration: reduced ? 0 : 0.85, ease: 'power3.inOut', onUpdate: () => ortho.updateProjectionMatrix() }, 0)
    return () => { animation.current?.kill(); if (controls.current) controls.current.enabled = true }
  }, [cameraVersion, mode, lens, view, view === 'focus' ? selected : null, view === 'focus' ? line : null, size.width, size.height, reduced, camera, invalidate])
  useEffect(() => {
    const element = gl.domElement
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const control = controls.current
      if (!control) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault()
        tmpVector.copy(camera.position).sub(control.target)
        const spherical = new THREE.Spherical().setFromVector3(tmpVector)
        if (event.key === 'ArrowLeft') spherical.theta -= 0.12
        if (event.key === 'ArrowRight') spherical.theta += 0.12
        if (event.key === 'ArrowUp') spherical.phi = Math.max(0.03, spherical.phi - 0.1)
        if (event.key === 'ArrowDown') spherical.phi = Math.min(1.3, spherical.phi + 0.1)
        camera.position.copy(tmpVector.setFromSpherical(spherical).add(control.target)); control.update(); invalidate()
      }
      if (['+', '=', '-', 'Home'].includes(event.key)) {
        event.preventDefault()
        if (event.key === 'Home') useExperience.getState().setView('oblique')
        else { const cam = camera as THREE.OrthographicCamera; cam.zoom = THREE.MathUtils.clamp(cam.zoom * (event.key === '-' ? 0.9 : 1.1), control.minZoom, control.maxZoom); cam.updateProjectionMatrix(); invalidate() }
      }
    }
    element.addEventListener('keydown', handler)
    return () => element.removeEventListener('keydown', handler)
  }, [camera, gl, invalidate])
  const fitZoom = Math.min(size.width / (mode === 'compare' && size.width >= 768 ? 19 : 11.8), size.height / (size.width < 768 && lens !== 'elements' ? 14.8 : 11.6))
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.065} rotateSpeed={0.52} zoomSpeed={0.65}
    minPolarAngle={0.015} maxPolarAngle={1.3} minZoom={fitZoom * .65} maxZoom={fitZoom * 3.2} onChange={() => invalidate()} />
}

function Stage() {
  const rings = useMemo(() => [4.9, 5.1].map(radius => Array.from({ length: 129 }, (_, i) => [Math.sin(i * Math.PI / 64) * radius, -0.12, Math.cos(i * Math.PI / 64) * radius] as Vec3)), [])
  const ticks = useMemo(() => Array.from({ length: 48 }, (_, i) => {
    const a = i * Math.PI / 24, r = i % 4 === 0 ? 5.03 : 5.09
    return [[Math.sin(a) * r, -0.12, Math.cos(a) * r], [Math.sin(a) * 5.15, -0.12, Math.cos(a) * 5.15]] as Vec3[]
  }).flat(), [])
  return <group>
    {rings.map((points, i) => <Line key={i} points={points} color="#9fa7aa" transparent opacity={i === 0 ? 0.13 : 0.035} lineWidth={0.7} />)}
    <Line points={[[-5.35, -0.12, 0], [5.35, -0.12, 0]]} color="#9ca3a8" transparent opacity={0.045} lineWidth={0.6} />
    <Line points={[[0, -0.12, -5.35], [0, -0.12, 5.35]]} color="#9ca3a8" transparent opacity={0.045} lineWidth={0.6} />
    <Line points={ticks} segments color="#8c969b" transparent opacity={0.19} lineWidth={0.7} />
  </group>
}

function DotField({ diagram }: { diagram: Diagram }) {
  const white = useRef<THREE.InstancedMesh>(null)
  const black = useRef<THREE.InstancedMesh>(null)
  const { invalidate, gl } = useThree()
  const { mode, lens, selected, hovered, line, reduced, quality, view, activePhase, phaseStudy } = useExperience()
  const whiteDots = useMemo(() => ALL_DOTS.filter(d => d.yang), [])
  const blackDots = useMemo(() => ALL_DOTS.filter(d => !d.yang), [])
  const expanded = view !== 'top' && mode !== 'compare'
  const targetDots = useMemo(() => new Map(makeDots(diagram).map(dot => [dot.id, { ...dot, position: [dot.position[0], groupPosition(diagram, dot.number, lens, expanded)[1], dot.position[2]] as Vec3 }])), [diagram, lens, expanded])
  const positions = useRef(new Map<string, Vec3>(ALL_DOTS.map(d => [d.id, [...d.position]])))
  const scales = useRef(new Map(ALL_DOTS.map(d => [d.id, 1])))
  const progress = useRef({ value: 1 })
  const startPositions = useRef(new Map<string, Vec3>())
  const startScales = useRef(new Map<string, number>())
  const visible = useRef(0)
  const duration = useRef(0)
  const phaseGroups = phaseSelection(diagram, activePhase, phaseStudy)
  const selectedNumbers = lens === 'elements' ? [...phaseGroups.from, ...phaseGroups.to] : relatedNumbers(diagram, lens, selected ?? hovered, line, undefined, mode === 'compare')
  const selectionKey = selectedNumbers.join(',')
  useEffect(() => {
    startPositions.current = new Map([...positions.current].map(([key, p]) => [key, [...p] as Vec3]))
    startScales.current = new Map(scales.current)
    progress.current.value = 0
    const tween = gsap.to(progress.current, { value: 1, duration: reduced ? 0 : 1.5, ease: 'power3.inOut', onUpdate: invalidate })
    invalidate()
    return () => { tween.kill() }
  }, [diagram, lens, expanded, reduced, invalidate])
  useEffect(() => { invalidate() }, [lens, selected, hovered, line, selectionKey, activePhase, phaseStudy, invalidate])
  useFrame((_, delta) => {
    let needsFrame = false
    const renderDots = (dots: Dot[], mesh: THREE.InstancedMesh | null) => {
      if (!mesh) return
      dots.forEach((dot, i) => {
        const target = targetDots.get(dot.id)
        const end = target?.position || dot.position
        const start = startPositions.current.get(dot.id) || end
        const t = progress.current.value
        const p: Vec3 = [THREE.MathUtils.lerp(start[0], end[0], t), THREE.MathUtils.lerp(start[1], end[1], t) + (reduced ? 0 : Math.sin(t * Math.PI) * 0.45), THREE.MathUtils.lerp(start[2], end[2], t)]
        const scale = THREE.MathUtils.lerp(startScales.current.get(dot.id) ?? 1, target ? 1 : 0, t)
        positions.current.set(dot.id, p); scales.current.set(dot.id, scale)
        const active = selectedNumbers.length === 0 || selectedNumbers.includes(dot.number)
        const phase = groupFor(diagram, dot.number)?.element
        const cycleActive = lens === 'elements' && phase === activePhase
        const grow = cycleActive ? 1.18 : active && selectedNumbers.length > 0 ? 1.1 : 1
        object.position.set(...p); object.scale.setScalar(scale * grow); object.updateMatrix(); mesh.setMatrixAt(i, object.matrix)
        const tint = '#ffffff'
        color.set(tint).multiplyScalar(!active ? (dot.yang ? 0.34 : 0.55) : 1)
        mesh.setColorAt(i, color)
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
    renderDots(whiteDots, white.current); renderDots(blackDots, black.current)
    if (progress.current.value < 1) needsFrame = true
    if (visible.current < 1) { visible.current += delta * 1.8; needsFrame = true }
    duration.current += delta
    if (needsFrame) invalidate()
  })
  const onOver = (dots: Dot[], e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); const dot = dots[e.instanceId ?? 0]; if (useExperience.getState().hovered !== dot.number) useExperience.setState({ hovered: dot.number }); gl.domElement.style.cursor = 'pointer' }
  const onOut = () => { useExperience.setState({ hovered: null }); gl.domElement.style.cursor = 'grab' }
  const onClick = (dots: Dot[], e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta < 6) useExperience.getState().select(dots[e.instanceId ?? 0].number) }
  return <>
    {groupsFor(diagram).map(group => <mesh key={`hit-${group.number}`} visible={false} position={groupPosition(diagram, group.number, lens, expanded)} rotation={group.number === 10 ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
      onPointerOver={event => { event.stopPropagation(); useExperience.setState({ hovered: group.number }); gl.domElement.style.cursor = 'pointer' }}
      onPointerOut={onOut} onClick={event => { event.stopPropagation(); if (event.delta < 6) useExperience.getState().select(group.number) }}>
      {group.number === 10 ? <torusGeometry args={[1.04, .22, 8, 32]} /> : <sphereGeometry args={[group.number < 4 ? .44 : .65, 8, 6]} />}
      <meshBasicMaterial />
    </mesh>)}
    <instancedMesh ref={white} args={[undefined, undefined, whiteDots.length]} frustumCulled={false} onPointerOver={e => onOver(whiteDots, e)} onPointerMove={e => onOver(whiteDots, e)} onPointerOut={onOut} onClick={e => onClick(whiteDots, e)}>
      <sphereGeometry args={[0.145, quality === 'low' ? 16 : 28, quality === 'low' ? 12 : 20]} />
      <meshPhysicalMaterial color="#e9e6dc" metalness={0.15} roughness={0.26} clearcoat={0.8} clearcoatRoughness={0.25} emissive="#cec9b4" emissiveIntensity={0.055} />
    </instancedMesh>
    <instancedMesh ref={black} args={[undefined, undefined, blackDots.length]} frustumCulled={false} onPointerOver={e => onOver(blackDots, e)} onPointerMove={e => onOver(blackDots, e)} onPointerOut={onOut} onClick={e => onClick(blackDots, e)}>
      <sphereGeometry args={[0.145, quality === 'low' ? 16 : 28, quality === 'low' ? 12 : 20]} />
      <meshPhysicalMaterial color="#161d23" metalness={0.68} roughness={0.34} clearcoat={0.7} clearcoatRoughness={0.25} />
    </instancedMesh>
  </>
}

function DirectionArrow({ from, to, tint }: { from: Vec3; to: Vec3; tint: string }) {
  const delta = new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize()
  const position = new THREE.Vector3(...to).addScaledVector(delta, -.24)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta)
  return <mesh position={position} quaternion={quaternion}><coneGeometry args={[.09, .26, 3]} /><meshBasicMaterial color={tint} /></mesh>
}

function Relations({ diagram }: { diagram: Diagram }) {
  const { mode, lens, view, selected, hovered, line, activePhase, phaseStudy, setPhase } = useExperience()
  const expanded = view !== 'top' && mode !== 'compare'
  const active = selected ?? hovered
  const phase = phaseSelection(diagram, activePhase, phaseStudy)
  const numbers = lens === 'elements' ? [...phase.from, ...phase.to] : relatedNumbers(diagram, lens, active, line, undefined, mode === 'compare')
  const point = (n: number) => groupPosition(diagram, n, lens, expanded)
  const palacePath = lens === 'balance' ? [...BALANCE_LINES[line]] : active === null || active === 5 ? [9, 5, 1] : [active, 5, 10 - active]
  const lifted = (lens === 'balance' ? palacePath : numbers).map(n => { const p = point(n); return [p[0], p[1] - .16, p[2]] as Vec3 })
  const circleSegments = GENERATING.flatMap(element => {
    const p = phaseNodePosition(element, expanded)
    return Array.from({ length: 24 }, (_, i) => [
      [p[0] + Math.cos(i * Math.PI / 12) * .17, p[1], p[2] + Math.sin(i * Math.PI / 12) * .17],
      [p[0] + Math.cos((i + 1) * Math.PI / 12) * .17, p[1], p[2] + Math.sin((i + 1) * Math.PI / 12) * .17],
    ] as Vec3[]).flat()
  })
  const phaseProjection = [...phase.from, ...phase.to].flatMap(n => [point(n), phaseNodePosition(groupFor(diagram, n)!.element, expanded)])
  const phaseCycle = phaseStudy === 'mapping' ? [] : GENERATING.flatMap(element => [phaseNodePosition(element, expanded), phaseNodePosition(phaseTarget(element, phaseStudy)!, expanded)])
  const from = phaseNodePosition(activePhase, expanded), to = phase.target ? phaseNodePosition(phase.target, expanded) : null
  return <group>
    {lens === 'elements' ? <>
      <Line points={circleSegments} segments color="#a2b2b9" transparent opacity={.55} lineWidth={1} />
      {phaseCycle.length > 0 && <Line points={phaseCycle} segments color="#9babb2" transparent opacity={.16} lineWidth={.7} />}
      {phaseProjection.length > 0 && <Line points={phaseProjection} segments color="#b3c5c7" transparent opacity={.3} lineWidth={.75} dashed dashSize={.09} gapSize={.09} />}
      {to && <><Line points={[from, to]} color={ELEMENT_COLORS[activePhase]} lineWidth={2} /><DirectionArrow from={from} to={to} tint={ELEMENT_COLORS[activePhase]} /></>}
      {GENERATING.map(element => <mesh key={element} position={phaseNodePosition(element, expanded)} onClick={event => { event.stopPropagation(); setPhase(element) }}><sphereGeometry args={[.4, 8, 6]} /><meshBasicMaterial visible={false} /></mesh>)}
    </> : diagram === 'hetu' && expanded && (lens === 'original' || lens === 'pairs') ? HETU_PAIRS.map(([a, b]) => {
      const start = point(a), end = point(b), chosen = numbers.includes(a)
      return <Line key={a} points={[start, [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2], end]} color="#bcaf8e" transparent opacity={chosen ? .8 : active === null ? .32 : .13} lineWidth={chosen ? 1.5 : .8} />
    }) : diagram === 'luoshu' && expanded && (lens === 'original' || lens === 'balance') ? <>
      <Line points={palacePath.map(n => { const p = point(n); return [p[0], 1.8, p[2]] as Vec3 })} color="#c0b28e" transparent opacity={.7} lineWidth={1.5} />
      <Line points={palacePath.flatMap(n => { const p = point(n); return [p, [p[0], 1.8, p[2]] as Vec3] })} segments color="#a7b7b9" transparent opacity={.25} lineWidth={.7} dashed dashSize={.09} gapSize={.09} />
    </> : lifted.length > 1 && lens !== 'polarity' && <Line points={lifted} color="#c0b28e" opacity={.55} transparent lineWidth={1.2} />}
    {groupsFor(diagram).map(group => {
      const highlighted = numbers.includes(group.number)
      if (!highlighted) return null
      return <mesh key={group.number} position={[point(group.number)[0], point(group.number)[1] - .19, point(group.number)[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[group.number === 10 ? 1.3 : .8, group.number === 10 ? 1.32 : .82, 48]} />
        <meshBasicMaterial color={lens === 'elements' ? ELEMENT_COLORS[group.element] : '#c2b491'} transparent opacity={.75} forceSinglePass side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    })}
  </group>
}

function ProjectLabels() {
  const { camera, size, invalidate, gl } = useThree()
  const { mode, comparisonDiagram, lens, view, selected, hovered, line, language, activePhase, phaseStudy } = useExperience()
  const entries = useRef<HTMLElement[]>([])
  useEffect(() => { entries.current = [...document.querySelectorAll<HTMLElement>('.scene-label')]; invalidate() }, [mode, comparisonDiagram, language, lens, view, activePhase, phaseStudy, selected, hovered, line, size, invalidate])
  useFrame(() => {
    if (!entries.current.length || entries.current.some(element => !element.isConnected)) entries.current = [...document.querySelectorAll<HTMLElement>('.scene-label')]
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls)
    gl.domElement.dataset.renderFrame = String(gl.info.render.frame)
    camera.updateMatrixWorld()
    for (const element of entries.current) {
      const [x, y, z] = element.dataset.position!.split(',').map(Number)
      tmpVector.set(x, y, z).project(camera)
      element.style.transform = `translate(${(tmpVector.x * .5 + .5) * size.width}px,${(-tmpVector.y * .5 + .5) * size.height}px) translate(-50%,-50%)`
      element.style.opacity = tmpVector.z >= -1 && tmpVector.z <= 1 ? '1' : '0'
    }
  })
  return null
}

function QualityController() {
  const samples = useRef({ count: 0, time: 0 })
  useFrame((_, delta) => {
    if (document.hidden || delta > .2 || useExperience.getState().quality === 'low') return
    samples.current.count++
    if (samples.current.count < 45) return
    samples.current.time += delta
    if (samples.current.count === 105) {
      if (samples.current.time / 60 > .035) useExperience.setState({ quality: 'low' })
      samples.current = { count: 45, time: 0 }
    }
  })
  return null
}

function SceneContent({ onReady }: { onReady: () => void }) {
  const { mode, comparisonDiagram, language } = useExperience()
  const { size, gl } = useThree()
  useEffect(() => {
    gl.domElement.tabIndex = 0
    const frame = requestAnimationFrame(onReady)
    const lost = (e: Event) => { e.preventDefault(); useExperience.setState({ failed: true, twoD: true }) }
    gl.domElement.addEventListener('webglcontextlost', lost)
    return () => { cancelAnimationFrame(frame); gl.domElement.removeEventListener('webglcontextlost', lost) }
  }, [gl, onReady])
  useEffect(() => {
    gl.domElement.setAttribute('aria-label', language === 'zh-CN'
      ? '交互图式。方向键旋转，加减键缩放，Home 复位。也可使用数字列表选择。'
      : 'Interactive diagram. Arrow keys to orbit, plus or minus to zoom, Home to reset. Use the number controls for accessible selection.')
  }, [gl, language])
  const compare = mode === 'compare' && size.width >= 768
  return <>
    <Lighting />
    <CameraRig />
    {compare ? <>
      <group position={[-4.5, 0, 0]} scale={0.72}><Stage /><DotField diagram="hetu" /><Relations diagram="hetu" /></group>
      <group position={[4.5, 0, 0]} scale={0.72}><Stage /><DotField diagram="luoshu" /><Relations diagram="luoshu" /></group>
    </> : <><Stage /><DotField diagram={mode === 'compare' ? comparisonDiagram : mode} /><Relations diagram={mode === 'compare' ? comparisonDiagram : mode} /></>}
    <ProjectLabels />
    <QualityController />
  </>
}

export default function ExperienceScene({ onReady }: { onReady: () => void }) {
  const { quality, select } = useExperience()
  return <Canvas orthographic frameloop="demand" dpr={quality === 'low' ? 1 : [1, 1.5]}
    camera={{ position: [1.1, 11.5, 12.5], zoom: 60, near: 0.1, far: 100 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
    onPointerMissed={e => { if (e.type === 'click') select(null) }}>
    <SceneContent onReady={onReady} />
  </Canvas>
}
