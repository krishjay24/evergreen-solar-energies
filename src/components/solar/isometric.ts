export type Vec3 = readonly [x: number, y: number, z: number]

interface IsoOptions {
  scale: number
  originX: number
  originY: number
}

const COS_30 = Math.cos(Math.PI / 6)

/**
 * Isometric projection: +x runs down-right, +y down-left, +z up.
 * Visible faces of a box are its top, its `x = max` face (right) and its `y = max` face (left).
 */
export function createIso({ scale, originX, originY }: IsoOptions) {
  const project = ([x, y, z]: Vec3): [number, number] => [
    originX + (x - y) * COS_30 * scale,
    originY + (x + y) * 0.5 * scale - z * scale,
  ]

  const points = (...pts: Vec3[]) => pts.map((p) => project(p).map((n) => n.toFixed(1)).join(',')).join(' ')

  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => ({
    top: points([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]),
    right: points([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]),
    left: points([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]),
  })

  /** Rectangle on a plane of constant x (right-facing wall). */
  const onX = (x: number, y0: number, y1: number, z0: number, z1: number) => points([x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1])
  /** Rectangle on a plane of constant y (left-facing wall). */
  const onY = (y: number, x0: number, x1: number, z0: number, z1: number) => points([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1])
  /** Rectangle on a plane of constant z (floor / flat roof). */
  const onZ = (z: number, x0: number, x1: number, y0: number, y1: number) => points([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z])

  const line = (a: Vec3, b: Vec3) => {
    const [x1, y1] = project(a)
    const [x2, y2] = project(b)
    return { x1, y1, x2, y2 }
  }

  return { project, points, box, onX, onY, onZ, line }
}

export const range = (start: number, end: number, step: number): number[] => {
  const values: number[] = []
  for (let v = start; v <= end + 1e-6; v += step) values.push(Number(v.toFixed(3)))
  return values
}
