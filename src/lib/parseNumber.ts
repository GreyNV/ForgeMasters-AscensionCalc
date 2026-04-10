export function parseNumericInput(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const sanitized = value.replace(/,/g, '').trim()
  if (!sanitized) {
    return 0
  }

  const parsed = Number(sanitized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function normalizePercentInput(value: string | number): number {
  const numeric = parseNumericInput(value)
  if (numeric <= 0) {
    return 0
  }

  if (numeric > 1) {
    return numeric / 100
  }

  return numeric
}

