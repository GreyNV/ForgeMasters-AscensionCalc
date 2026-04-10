export function roundUp(value: number): number {
  return Math.ceil(value)
}

export function roundTo(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

