import { resourceLabels } from '../data'

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value)
}

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  if (!Number.isFinite(value)) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatEta(days: number): string {
  if (!Number.isFinite(days)) {
    return 'N/A'
  }
  if (days < 1) {
    return '<1 day'
  }
  if (days < 7) {
    return `${formatNumber(days, 1)} days`
  }
  if (days < 30) {
    return `${formatNumber(days / 7, 1)} weeks`
  }
  return `${formatNumber(days / 30, 1)} months`
}

export function labelList(parts: Array<[string, number]>): string {
  const filtered = parts.filter(([, value]) => value > 0)
  if (filtered.length === 0) {
    return 'nothing else'
  }

  const formatted = filtered.map(
    ([resource, value]) => `${formatCompact(value)} ${resourceLabels[resource as keyof typeof resourceLabels].toLowerCase()}`,
  )

  if (formatted.length === 1) {
    return formatted[0]
  }
  if (formatted.length === 2) {
    return `${formatted[0]} and ${formatted[1]}`
  }

  return `${formatted.slice(0, -1).join(', ')}, and ${formatted.at(-1)}`
}

