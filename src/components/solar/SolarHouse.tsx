import { useId } from 'react'
import type { Vec3 } from './isometric'
import { arrayFrames, BACK_TREES, box, cells, conduit, FRONT_TREES, GARDEN_LIGHTS, grassLeft, grassRight, GROUND, groundCladding, inverter, path, PLATFORM, points, project, railing, ROOF, shadowFootprint, SHRUBS, SLAB, SOLAR_HOUSE_ANCHORS, SOLAR_HOUSE_VIEWBOX, spillLeft, spillRight, UPPER, upperCladding, windowGeometry, type Tree } from './solarHouseGeometry'

/** Original illustration – not a photograph of an Evergreen installation. */

function TreeShape({ tree, ids }: { tree: Tree; ids: Ids }) {
  const [x, y] = project(tree.at)
  const s = tree.size * 32
  return (
    <g>
      <ellipse cx={x + s * 0.2} cy={y + 3} rx={s * 0.9} ry={s * 0.32} fill="#000" opacity="0.35" />
      <line x1={x} y1={y} x2={x} y2={y - s * 1.3} stroke="#3b2f22" strokeWidth={s * 0.12} strokeLinecap="round" />
      <circle cx={x - s * 0.35} cy={y - s * 1.55} r={s * 0.62} fill={`url(#${ids.leafDark})`} />
      <circle cx={x + s * 0.38} cy={y - s * 1.6} r={s * 0.58} fill={`url(#${ids.leafDark})`} />
      <circle cx={x} cy={y - s * 2.05} r={s * 0.68} fill={`url(#${ids.leaf})`} />
      <circle cx={x - s * 0.2} cy={y - s * 2.3} r={s * 0.28} fill="#6fae6c" opacity="0.35" />
    </g>
  )
}

function Shrub({ at, ids }: { at: Vec3; ids: Ids }) {
  const [x, y] = project(at)
  return (
    <g>
      <ellipse cx={x + 3} cy={y + 2} rx="16" ry="6" fill="#000" opacity="0.3" />
      <ellipse cx={x - 6} cy={y - 7} rx="11" ry="9" fill={`url(#${ids.leafDark})`} />
      <ellipse cx={x + 6} cy={y - 8} rx="10" ry="8.5" fill={`url(#${ids.leafDark})`} />
      <ellipse cx={x} cy={y - 13} rx="10" ry="8" fill={`url(#${ids.leaf})`} />
    </g>
  )
}

type Ids = ReturnType<typeof useIds>

function useIds() {
  const id = useId().replace(/:/g, '')
  const make = (name: string) => `${id}-${name}`
  return {
    cell: make('cell'),
    cellLit: make('cell-lit'),
    glass: make('glass'),
    glassCool: make('glass-cool'),
    wallLeft: make('wall-left'),
    wallRight: make('wall-right'),
    slabTop: make('slab-top'),
    roofTop: make('roof-top'),
    leaf: make('leaf'),
    leafDark: make('leaf-dark'),
    spill: make('spill'),
    grass: make('grass'),
    panelClip: make('panel-clip'),
    glint: make('glint'),
    blur: make('blur'),
    glow: make('glow'),
    groundShadow: make('ground-shadow'),
  }
}

interface SolarHouseProps {
  className?: string
}

export function SolarHouse({ className }: SolarHouseProps) {
  const ids = useIds()
  const platform = box(PLATFORM.x0, PLATFORM.x1, PLATFORM.y0, PLATFORM.y1, PLATFORM.z0, PLATFORM.z1)
  const ground = box(GROUND.x0, GROUND.x1, GROUND.y0, GROUND.y1, GROUND.z0, GROUND.z1)
  const slab = box(SLAB.x0, SLAB.x1, SLAB.y0, SLAB.y1, SLAB.z0, SLAB.z1)
  const upper = box(UPPER.x0, UPPER.x1, UPPER.y0, UPPER.y1, UPPER.z0, UPPER.z1)
  const roof = box(ROOF.x0, ROOF.x1, ROOF.y0, ROOF.y1, ROOF.z0, ROOF.z1)
  const [shadowX, shadowY] = project([7.5, 6, PLATFORM.z0])

  return (
    <svg
      viewBox={`0 0 ${SOLAR_HOUSE_VIEWBOX.width} ${SOLAR_HOUSE_VIEWBOX.height}`}
      className={className}
      role="img"
      aria-label="Illustration of a modern two-storey house with rooftop solar panels"
    >
      <defs>
        <linearGradient id={ids.cell} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5f9c" />
          <stop offset="1" stopColor="#0c2a4d" />
        </linearGradient>
        <linearGradient id={ids.cellLit} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fd3ff" />
          <stop offset="0.45" stopColor="#3f8fd6" />
          <stop offset="1" stopColor="#2774b8" />
        </linearGradient>
        <linearGradient id={ids.glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe7ad" />
          <stop offset="1" stopColor="#d9963f" />
        </linearGradient>
        <linearGradient id={ids.glassCool} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d58e" />
          <stop offset="1" stopColor="#b9742f" />
        </linearGradient>
        <linearGradient id={ids.wallLeft} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#35413d" />
          <stop offset="0.55" stopColor="#222d29" />
          <stop offset="1" stopColor="#151e1a" />
        </linearGradient>
        <linearGradient id={ids.wallRight} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0" stopColor="#28332f" />
          <stop offset="0.7" stopColor="#19231f" />
          <stop offset="1" stopColor="#101916" />
        </linearGradient>
        <linearGradient id={ids.slabTop} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9cec6" />
          <stop offset="0.55" stopColor="#a5b0aa" />
          <stop offset="1" stopColor="#7c8b86" />
        </linearGradient>
        <linearGradient id={ids.roofTop} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#394640" />
          <stop offset="1" stopColor="#202a26" />
        </linearGradient>
        <radialGradient id={ids.leaf} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#5a9c5c" />
          <stop offset="1" stopColor="#1f4f2f" />
        </radialGradient>
        <radialGradient id={ids.leafDark} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#3d7a45" />
          <stop offset="1" stopColor="#163a24" />
        </radialGradient>
        <radialGradient id={ids.spill} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#f0c66e" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f0c66e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.grass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#21492f" />
          <stop offset="1" stopColor="#163826" />
        </linearGradient>
        <radialGradient id={ids.groundShadow}>
          <stop offset="0" stopColor="#000" stopOpacity="0.65" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.glint} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={ids.panelClip}>
          {arrayFrames.map((frame, i) => (
            <polygon key={i} points={frame.surface} />
          ))}
        </clipPath>
        <filter id={ids.blur} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx={shadowX} cy={shadowY + 26} rx="390" ry="82" fill={`url(#${ids.groundShadow})`} />

      {/* Platform */}
      <polygon points={platform.left} fill="#13201b" />
      <polygon points={platform.right} fill="#0d1613" />
      <polygon points={platform.top} fill="#25302c" />
      <polygon points={grassLeft} fill={`url(#${ids.grass})`} />
      <polygon points={grassRight} fill={`url(#${ids.grass})`} />
      <polygon points={path} fill="#3a4541" />
      <polyline
        points={points([PLATFORM.x0, PLATFORM.y1, 0], [PLATFORM.x1, PLATFORM.y1, 0], [PLATFORM.x1, PLATFORM.y0, 0])}
        fill="none"
        stroke="#4a5853"
        strokeWidth="1.2"
      />

      {BACK_TREES.map((tree, i) => (
        <TreeShape key={i} tree={tree} ids={ids} />
      ))}

      <polygon points={shadowFootprint} fill="#000" opacity="0.45" filter={`url(#${ids.blur})`} />
      <g filter={`url(#${ids.blur})`}>
        <polygon points={spillLeft} fill={`url(#${ids.spill})`} opacity="0.75" />
        <polygon points={spillRight} fill={`url(#${ids.spill})`} opacity="0.5" />
      </g>

      {/* Ground floor */}
      <polygon points={ground.left} fill={`url(#${ids.wallLeft})`} />
      <polygon points={ground.right} fill={`url(#${ids.wallRight})`} />
      <g stroke="#2c3431" strokeWidth="1">
        {groundCladding.left.map((l, i) => (
          <line key={`gl${i}`} {...l} />
        ))}
        {groundCladding.right.map((l, i) => (
          <line key={`gr${i}`} {...l} opacity="0.7" />
        ))}
      </g>

      {/* Inverter + conduit */}
      <polyline points={points(...conduit)} fill="none" stroke="#8c969a" strokeWidth="2" />
      <polygon points={inverter.left} fill="#c9d1d4" />
      <polygon points={inverter.right} fill="#e5eaec" />
      <polygon points={inverter.top} fill="#f2f5f6" />

      {/* Windows (glow + glass) */}
      <g filter={`url(#${ids.glow})`} opacity="0.55">
        {windowGeometry.map((w) => (
          <polygon key={w.key} points={w.glass} fill="#f0c66e" />
        ))}
      </g>
      {windowGeometry.slice(0, 4).map((w) => (
        <WindowShape key={w.key} w={w} ids={ids} />
      ))}

      {/* First-floor slab + glass balustrade (rear part) */}
      <polygon points={slab.left} fill="#8a918a" />
      <polygon points={slab.right} fill="#6f766f" />
      <polygon points={slab.top} fill={`url(#${ids.slabTop})`} />

      {/* Upper floor */}
      <polygon points={upper.left} fill={`url(#${ids.wallLeft})`} />
      <polygon points={upper.right} fill={`url(#${ids.wallRight})`} />
      <g stroke="#2f3835" strokeWidth="1">
        {upperCladding.left.map((l, i) => (
          <line key={`ul${i}`} {...l} />
        ))}
        {upperCladding.right.map((l, i) => (
          <line key={`ur${i}`} {...l} opacity="0.7" />
        ))}
      </g>
      {windowGeometry.slice(4).map((w) => (
        <WindowShape key={w.key} w={w} ids={ids} />
      ))}

      <g>
        <polygon points={railing.left} fill="#a9d6ea" opacity="0.13" />
        <polygon points={railing.right} fill="#a9d6ea" opacity="0.1" />
        <g stroke="#d7e9f1" strokeOpacity="0.35" strokeWidth="0.8">
          {railing.posts.map((l, i) => (
            <line key={i} {...l} />
          ))}
        </g>
        <line {...railing.railLeft} stroke="#e6f1f5" strokeOpacity="0.7" strokeWidth="1.4" />
        <line {...railing.railRight} stroke="#e6f1f5" strokeOpacity="0.6" strokeWidth="1.4" />
      </g>

      {/* Roof */}
      <polygon points={roof.left} fill="#1b201e" />
      <polygon points={roof.right} fill="#141816" />
      <polygon points={roof.top} fill={`url(#${ids.roofTop})`} />
      <polyline
        points={points([ROOF.x0, ROOF.y1, ROOF.z1], [ROOF.x1, ROOF.y1, ROOF.z1], [ROOF.x1, ROOF.y0, ROOF.z1])}
        fill="none"
        stroke="#4b5551"
        strokeWidth="1.2"
      />

      {/* Solar arrays */}
      <g data-solar-panels>
        {arrayFrames.map((frame, i) => (
          <g key={i}>
            <g stroke="#7d8b95" strokeWidth="1.6">
              {frame.legs.map((l, j) => (
                <line key={j} {...l} />
              ))}
            </g>
            <polygon points={frame.side} fill="#5d6b76" />
            <polygon points={frame.front} fill="#8796a2" />
            <polygon points={frame.surface} fill="#0a1a2d" stroke="#c9d4dd" strokeWidth="1.4" strokeLinejoin="round" />
          </g>
        ))}
        {cells.map((cell) => (
          <polygon key={cell.key} points={cell.points} fill={`url(#${ids.cell})`} />
        ))}
        <g data-panel-highlight>
          {cells.map((cell) => (
            <polygon key={cell.key} data-panel-cell points={cell.points} fill={`url(#${ids.cellLit})`} opacity="0" />
          ))}
        </g>
        <g clipPath={`url(#${ids.panelClip})`}>
          <rect data-panel-glint x="-160" y="80" width="150" height="320" fill={`url(#${ids.glint})`} transform="rotate(28 0 240)" opacity="0" />
        </g>
      </g>

      {FRONT_TREES.map((tree, i) => (
        <TreeShape key={i} tree={tree} ids={ids} />
      ))}
      {SHRUBS.map((at, i) => (
        <Shrub key={i} at={at} ids={ids} />
      ))}
      {GARDEN_LIGHTS.map((at, i) => {
        const [x, y] = project(at)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="#f0c66e" opacity="0.18" filter={`url(#${ids.glow})`} />
            <line x1={x} y1={y} x2={x} y2={y - 7} stroke="#2f3532" strokeWidth="2" />
            <circle cx={x} cy={y - 8} r="1.8" fill="#ffe7ad" />
          </g>
        )
      })}

      {/* Connection anchors (measured by the hero to draw information lines) */}
      <g aria-hidden="true">
        {Object.entries(SOLAR_HOUSE_ANCHORS).map(([name, p]) => (
          <circle key={name} data-anchor={name} cx={p.cx} cy={p.cy} r="0" />
        ))}
      </g>
    </svg>
  )
}

function WindowShape({ w, ids }: { w: (typeof windowGeometry)[number]; ids: Ids }) {
  return (
    <g>
      <polygon points={w.frame} fill="#0d1110" />
      <polygon points={w.glass} fill={`url(#${w.face === 'x' ? ids.glassCool : ids.glass})`} />
      <polygon points={w.reflection} fill="#fff" opacity="0.12" />
      <g stroke="#0d1110" strokeWidth="2.2">
        {w.mullions.map((l, i) => (
          <line key={i} {...l} />
        ))}
      </g>
    </g>
  )
}
