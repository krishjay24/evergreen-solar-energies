import { createIso, range, type Vec3 } from './isometric'

export const SOLAR_HOUSE_VIEWBOX = { width: 780, height: 670 } as const

export type SolarHouseAnchor = 'sun-power' | 'solar-panels' | 'rooftop-solar' | 'clean-energy' | 'energy-flow' | 'site-assessment'

const iso = createIso({ scale: 32, originX: 349, originY: 176 })
export const { box, onX, onY, onZ, points, project, line } = iso

// ---- Geometry (units ≈ metres) ----
export const PLATFORM = { x0: 0, x1: 15, y0: 0, y1: 12, z0: -0.8, z1: 0 }
export const GROUND = { x0: 3, x1: 11.5, y0: 2.5, y1: 9, z0: 0, z1: 3.2 }
export const SLAB = { x0: 2.2, x1: 13, y0: 1.8, y1: 10.4, z0: 3.2, z1: 3.5 }
export const UPPER = { x0: 3.6, x1: 10.6, y0: 3, y1: 8.6, z0: 3.5, z1: 6.2 }
export const ROOF = { x0: 3, x1: 11.2, y0: 2.4, y1: 9.2, z0: 6.2, z1: 6.5 }

const PANEL_X0 = 3.5
const PANEL_X1 = 10.7
const tiltZ = (x: number) => 6.8 + (PANEL_X1 - x) * 0.17
const panelPoint = (x: number, y: number, lift = 0): Vec3 => [x, y, tiltZ(x) + lift]
const ARRAYS = [
  { y0: 2.75, y1: 5.65 },
  { y0: 5.95, y1: 8.85 },
] as const
const COLS = 6
const ROWS = 3
const GAP = 0.06

export const cells = ARRAYS.flatMap(({ y0, y1 }, a) =>
  Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS
    const r = Math.floor(i / COLS)
    const cw = (PANEL_X1 - PANEL_X0) / COLS
    const rh = (y1 - y0) / ROWS
    const xa = PANEL_X0 + c * cw + GAP
    const xb = PANEL_X0 + (c + 1) * cw - GAP
    const ya = y0 + r * rh + GAP
    const yb = y0 + (r + 1) * rh - GAP
    return { key: `${a}-${r}-${c}`, points: points(panelPoint(xa, ya), panelPoint(xb, ya), panelPoint(xb, yb), panelPoint(xa, yb)) }
  }),
)

export const arrayFrames = ARRAYS.map(({ y0, y1 }) => ({
  surface: points(panelPoint(PANEL_X0, y0), panelPoint(PANEL_X1, y0), panelPoint(PANEL_X1, y1), panelPoint(PANEL_X0, y1)),
  front: points(panelPoint(PANEL_X1, y0), panelPoint(PANEL_X1, y1), panelPoint(PANEL_X1, y1, -0.16), panelPoint(PANEL_X1, y0, -0.16)),
  side: points(panelPoint(PANEL_X0, y1), panelPoint(PANEL_X1, y1), panelPoint(PANEL_X1, y1, -0.16), panelPoint(PANEL_X0, y1, -0.16)),
  legs: [y0 + 0.3, (y0 + y1) / 2, y1 - 0.3].flatMap((y) => [
    line([PANEL_X0 + 0.25, y, ROOF.z1], panelPoint(PANEL_X0 + 0.25, y, -0.16)),
    line([PANEL_X0 + 3.6, y, ROOF.z1], panelPoint(PANEL_X0 + 3.6, y, -0.16)),
  ]),
}))

interface WindowSpec {
  face: 'x' | 'y'
  at: number
  from: number
  to: number
  z0: number
  z1: number
  panes: number
}

const WINDOWS: WindowSpec[] = [
  // Ground floor – left face (y = 9)
  { face: 'y', at: GROUND.y1, from: 3.8, to: 7.4, z0: 0.15, z1: 2.85, panes: 3 },
  { face: 'y', at: GROUND.y1, from: 8.3, to: 10.8, z0: 1.0, z1: 2.6, panes: 2 },
  // Ground floor – right face (x = 11.5)
  { face: 'x', at: GROUND.x1, from: 3.3, to: 6.2, z0: 0.15, z1: 2.85, panes: 2 },
  { face: 'x', at: GROUND.x1, from: 6.7, to: 7.9, z0: 1.0, z1: 2.6, panes: 1 },
  // Upper floor – left face (y = 8.6)
  { face: 'y', at: UPPER.y1, from: 4.3, to: 7.6, z0: 3.75, z1: 5.9, panes: 3 },
  { face: 'y', at: UPPER.y1, from: 8.4, to: 10.0, z0: 4.3, z1: 5.6, panes: 1 },
  // Upper floor – right face (x = 10.6)
  { face: 'x', at: UPPER.x1, from: 3.7, to: 7.8, z0: 3.75, z1: 5.9, panes: 3 },
]

export const windowGeometry = WINDOWS.map((w, i) => {
  const rect = (a: number, b: number, z0: number, z1: number) => (w.face === 'x' ? onX(w.at + 0.01, a, b, z0, z1) : onY(w.at + 0.01, a, b, z0, z1))
  const pt = (s: number, z: number): Vec3 => (w.face === 'x' ? [w.at + 0.01, s, z] : [s, w.at + 0.01, z])
  const step = (w.to - w.from) / w.panes
  return {
    key: i,
    face: w.face,
    frame: rect(w.from - 0.08, w.to + 0.08, w.z0 - 0.08, w.z1 + 0.08),
    glass: rect(w.from, w.to, w.z0, w.z1),
    reflection: points(pt(w.from, w.z0 + (w.z1 - w.z0) * 0.55), pt(w.from + step * 0.9, w.z1), pt(w.from + step * 1.4, w.z1), pt(w.from, w.z0 + (w.z1 - w.z0) * 0.2)),
    mullions: range(w.from + step, w.to - step + 1e-3, step).map((s) => line(pt(s, w.z0), pt(s, w.z1))),
  }
})

const cladding = (b: typeof GROUND) => ({
  left: range(b.x0 + 0.4, b.x1 - 0.2, 0.42).map((x) => line([x, b.y1, b.z0], [x, b.y1, b.z1])),
  right: range(b.y0 + 0.4, b.y1 - 0.2, 0.42).map((y) => line([b.x1, y, b.z0], [b.x1, y, b.z1])),
})

export const groundCladding = cladding(GROUND)
export const upperCladding = cladding(UPPER)

export const railing = {
  left: onY(SLAB.y1 - 0.15, SLAB.x0 + 0.15, SLAB.x1 - 0.15, SLAB.z1, SLAB.z1 + 0.95),
  right: onX(SLAB.x1 - 0.15, SLAB.y0 + 0.15, SLAB.y1 - 0.15, SLAB.z1, SLAB.z1 + 0.95),
  railLeft: line([SLAB.x0 + 0.15, SLAB.y1 - 0.15, SLAB.z1 + 0.95], [SLAB.x1 - 0.15, SLAB.y1 - 0.15, SLAB.z1 + 0.95]),
  railRight: line([SLAB.x1 - 0.15, SLAB.y0 + 0.15, SLAB.z1 + 0.95], [SLAB.x1 - 0.15, SLAB.y1 - 0.15, SLAB.z1 + 0.95]),
  posts: [
    ...range(SLAB.x0 + 0.15, SLAB.x1 - 0.15, 1.2).map((x) => line([x, SLAB.y1 - 0.15, SLAB.z1], [x, SLAB.y1 - 0.15, SLAB.z1 + 0.95])),
    ...range(SLAB.y0 + 0.15, SLAB.y1 - 0.15, 1.2).map((y) => line([SLAB.x1 - 0.15, y, SLAB.z1], [SLAB.x1 - 0.15, y, SLAB.z1 + 0.95])),
  ],
}

export const inverter = box(GROUND.x1, GROUND.x1 + 0.22, 8.2, 8.75, 1.15, 1.95)
export const conduit = [
  [GROUND.x1 + 0.05, 8.47, 1.95],
  [GROUND.x1 + 0.05, 8.47, 3.2],
] as const

export interface Tree {
  at: Vec3
  size: number
}

export const BACK_TREES: Tree[] = [
  { at: [1.3, 1.6, 0], size: 1.25 },
  { at: [13.4, 1.4, 0], size: 1.05 },
]
export const FRONT_TREES: Tree[] = [
  { at: [1.4, 10.6, 0], size: 1.15 },
  { at: [13.8, 9.2, 0], size: 0.95 },
]
export const SHRUBS: Vec3[] = [
  [3.0, 10.9, 0],
  [12.2, 10.9, 0],
  [14.1, 6.6, 0],
  [14.2, 4.2, 0],
]
export const GARDEN_LIGHTS: Vec3[] = [
  [7.6, 10.2, 0],
  [7.6, 11.4, 0],
  [9.7, 10.2, 0],
  [9.7, 11.4, 0],
  [14.4, 9.8, 0],
  [0.6, 9.4, 0],
]

const anchorPoint = (p: Vec3) => {
  const [x, y] = project(p)
  return { cx: Number(x.toFixed(1)), cy: Number(y.toFixed(1)) }
}

export const SOLAR_HOUSE_ANCHORS: Record<SolarHouseAnchor, { cx: number; cy: number }> = {
  'sun-power': anchorPoint(panelPoint(4.3, 3.6, 0.02)),
  'rooftop-solar': anchorPoint(panelPoint(6.4, 7.3, 0.02)),
  'solar-panels': anchorPoint(panelPoint(9.8, 4.4, 0.02)),
  'clean-energy': anchorPoint([1.4, 10.6, 2.4]),
  'energy-flow': anchorPoint([GROUND.x1 + 0.22, 8.47, 1.55]),
  'site-assessment': anchorPoint([12.2, 10.6, 0.05]),
}

export const shadowFootprint = onZ(0.01, GROUND.x0 + 0.4, GROUND.x1 + 1.4, GROUND.y0 + 0.4, GROUND.y1 + 1.2)
export const spillLeft = points([3.6, 9, 0.01], [7.6, 9, 0.01], [8.6, 11.6, 0.01], [3.2, 11.6, 0.01])
export const spillRight = points([11.5, 3.1, 0.01], [11.5, 6.4, 0.01], [14.4, 7.2, 0.01], [14.4, 2.6, 0.01])
export const grassLeft = points([0.4, 8.4, 0.01], [4.6, 10.2, 0.01], [5.4, 11.6, 0.01], [0.4, 11.6, 0.01])
export const grassRight = points([12.4, 0.4, 0.01], [14.6, 0.4, 0.01], [14.6, 8.2, 0.01], [13.4, 7.4, 0.01])
export const path = onZ(0.015, 7.9, 9.4, 9, 12)
