import { useEffect, useMemo, useRef, useState } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import worldData from 'world-atlas/countries-110m.json'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GlobeLocation = {
  lat: number
  lon: number
  city: string | null
  region: string | null
  country: string | null
  attempts: number
}

const world = worldData as unknown as Topology<{ countries: GeometryCollection }>
const LAND = feature(world, world.objects.countries)
const BORDERS = mesh(world, world.objects.countries, (a, b) => a !== b)
const GRATICULE = geoGraticule10()

const SIZE = 400
const R = SIZE / 2 - 8
const clampTilt = (v: number) => Math.max(-60, Math.min(60, v))
const placeName = (l: GlobeLocation) => [l.city, l.region, l.country].filter(Boolean).join(', ')
const delta = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180
const RESUME_AFTER_MS = 4000
const SPIN_SPEED = 0.12

export default function LocationGlobe({ locations }: { locations: GlobeLocation[] }) {
  const { t } = useTranslation()
  const label = (l: GlobeLocation) => placeName(l) || t('globe.unknown')
  const sphereRef = useRef<SVGPathElement>(null)
  const graticuleRef = useRef<SVGPathElement>(null)
  const landRef = useRef<SVGPathElement>(null)
  const bordersRef = useRef<SVGPathElement>(null)
  const markerRefs = useRef<(SVGGElement | null)[]>([])
  const [active, setActive] = useState<number | null>(null)

  const view = useRef({
    rot: [0, -15] as [number, number],
    target: null as [number, number] | null,
    drag: null as null | { x: number; y: number; rot: [number, number] },
    hover: false,
    idleUntil: 0,
    speed: SPIN_SPEED,
    locked: null as [number, number] | null,
  })

  const pause = () => {
    view.current.idleUntil = performance.now() + RESUME_AFTER_MS
    view.current.speed = 0
  }

  const total = useMemo(() => locations.reduce((s, l) => s + l.attempts, 0), [locations])
  const max = useMemo(() => Math.max(1, ...locations.map((l) => l.attempts)), [locations])

  const toggle = (i: number) => {
    const l = locations[i]
    if (!l) return
    if (active === i) return release()
    const rot: [number, number] = [-l.lon, clampTilt(-l.lat)]
    setActive(i)
    view.current.locked = rot
    view.current.target = rot
    view.current.speed = 0
  }

  const release = () => {
    setActive(null)
    view.current.locked = null
    view.current.target = null
    view.current.idleUntil = 0
    view.current.speed = 0
  }

  useEffect(() => {
    if (!locations.length) return
    view.current.rot = [-locations[0].lon, clampTilt(-locations[0].lat)]
    view.current.locked = null
    setActive(null)
  }, [locations])

  useEffect(() => {
    const projection = geoOrthographic().scale(R).translate([SIZE / 2, SIZE / 2]).clipAngle(90).precision(0.6)
    const path = geoPath(projection)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const draw = () => {
      const v = view.current
      if (!v.drag) {
        if (v.target) {
          const d0 = delta(v.rot[0], v.target[0])
          const d1 = v.target[1] - v.rot[1]
          v.rot = [v.rot[0] + d0 * 0.09, v.rot[1] + d1 * 0.09]
          if (Math.abs(d0) < 0.05 && Math.abs(d1) < 0.05) v.target = null
        } else if (v.locked) {
          if (performance.now() > v.idleUntil && !v.hover && (Math.abs(delta(v.rot[0], v.locked[0])) > 0.05 || Math.abs(v.rot[1] - v.locked[1]) > 0.05))
            v.target = v.locked
        } else if (!reduce && !v.hover && performance.now() > v.idleUntil) {
          v.speed = Math.min(SPIN_SPEED, v.speed + SPIN_SPEED / 90)
          v.rot = [v.rot[0] + v.speed, v.rot[1]]
        }
      }
      projection.rotate(v.rot)
      sphereRef.current?.setAttribute('d', path({ type: 'Sphere' }) ?? '')
      graticuleRef.current?.setAttribute('d', path(GRATICULE) ?? '')
      landRef.current?.setAttribute('d', path(LAND) ?? '')
      bordersRef.current?.setAttribute('d', path(BORDERS) ?? '')

      const center: [number, number] = [-v.rot[0], -v.rot[1]]
      locations.forEach((l, i) => {
        const g = markerRefs.current[i]
        if (!g) return
        const visible = geoDistance([l.lon, l.lat], center) < Math.PI / 2 - 0.05
        const p = projection([l.lon, l.lat])
        g.style.display = visible && p ? '' : 'none'
        if (p) g.setAttribute('transform', `translate(${p[0]} ${p[1]})`)
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [locations])

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    view.current.drag = { x: e.clientX, y: e.clientY, rot: [...view.current.rot] as [number, number] }
    view.current.target = null
    pause()
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = view.current.drag
    if (!d) return
    const k = 180 / (e.currentTarget.clientWidth || SIZE)
    view.current.rot = [d.rot[0] + (e.clientX - d.x) * k, clampTilt(d.rot[1] - (e.clientY - d.y) * k)]
  }
  const onPointerUp = () => {
    view.current.drag = null
    pause()
  }
  const onPointerEnter = () => {
    view.current.hover = true
    view.current.speed = 0
  }
  const onPointerLeave = () => {
    view.current.hover = false
    pause()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const [l, p] = view.current.target ?? view.current.rot
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [l + 20, p],
      ArrowRight: [l - 20, p],
      ArrowUp: [l, clampTilt(p - 15)],
      ArrowDown: [l, clampTilt(p + 15)],
    }
    if (e.key === 'Escape' && view.current.locked) {
      e.preventDefault()
      return release()
    }
    if (!moves[e.key]) return
    e.preventDefault()
    pause()
    view.current.target = moves[e.key]
  }

  if (!locations.length) return <p className="text-sm text-muted-foreground">{t('globe.empty')}</p>

  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_16rem]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="mx-auto w-full max-w-[26rem] cursor-grab touch-none select-none outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        role="img"
        tabIndex={0}
        aria-label={t('globe.aria', { count: locations.length })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      >
        <defs>
          <radialGradient id="globe-ocean" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="var(--card)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </radialGradient>
          <radialGradient id="globe-shade" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="55%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.18" />
          </radialGradient>
          <filter id="globe-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} className="fill-primary/25" filter="url(#globe-glow)" />
        <path ref={sphereRef} fill="url(#globe-ocean)" className="stroke-border" strokeWidth={1} />
        <path ref={graticuleRef} fill="none" className="stroke-primary/10" strokeWidth={0.6} />
        <path ref={landRef} className="fill-primary/35 dark:fill-primary/30" />
        <path ref={bordersRef} fill="none" className="stroke-card/70" strokeWidth={0.5} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="url(#globe-shade)" pointerEvents="none" />

        {locations.map((l, i) => {
          const r = 4 + 5 * Math.sqrt(l.attempts / max)
          const isActive = i === active
          const dimmed = active !== null && !isActive
          const pinTop = -r * 0.2 - r * 4.2 * (isActive ? 1.35 : 1)
          return (
            <g key={`${l.lat},${l.lon}`} ref={(el) => void (markerRefs.current[i] = el)} style={{ display: 'none' }}>
              <g className="transition-opacity duration-300" opacity={dimmed ? 0.35 : 1}>
              <title>{`${label(l)}: ${t('globe.attempts', { count: l.attempts })}`}</title>
              <circle r={r * 2.2} className="globe-pulse fill-primary/30" />
              <g transform={`translate(0 ${-r * 0.2}) scale(${isActive ? 1.35 : 1})`}>
                <path
                  d={`M0 0 C ${-r * 1.6} ${-r * 2.2} ${-r * 1.6} ${-r * 4.2} 0 ${-r * 4.2} C ${r * 1.6} ${-r * 4.2} ${r * 1.6} ${-r * 2.2} 0 0 Z`}
                  className={cn(isActive ? 'fill-primary' : 'fill-primary/80', 'stroke-card')}
                  strokeWidth={1.5}
                />
                <circle cy={-r * 2.9} r={r * 0.55} className="fill-card" />
              </g>
              <circle r={2} className="fill-primary" />
              </g>
              {isActive && (
                <text
                  y={pinTop - 8}
                  textAnchor="middle"
                  className="fill-foreground stroke-card text-[13px] font-semibold"
                  strokeWidth={4}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {l.city ?? l.country ?? t('globe.place')} · {l.attempts}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {t('globe.summary', { attempts: t('globe.attempts', { count: total }), places: t('globe.places', { count: locations.length }) })} ·{' '}
          {active === null ? t('globe.hintSelect') : t('globe.hintRelease')}
        </p>
        <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
          {locations.map((l, i) => (
            <li key={`${l.lat},${l.lon}`}>
              <button
                type="button"
                onClick={() => toggle(i)}
                onKeyDown={(e) => e.key === 'Escape' && active !== null && release()}
                aria-pressed={active === i}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent',
                  active === i && 'bg-accent text-accent-foreground',
                )}
              >
                <MapPin className={cn('size-4 shrink-0', active === i ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
                <span className="flex-1 truncate">{label(l)}</span>
                <span className="tabular-nums text-muted-foreground">{l.attempts}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
