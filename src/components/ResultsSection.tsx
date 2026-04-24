import { appConfig, resourceLabels } from '../data'
import { formatEta, formatNumber } from '../lib/formatting'
import type { PlannerResult } from '../types/planner'
import { ResourceIcon } from './ResourceIcon'

function formatOddsEntries(odds: Record<string, number>) {
  return Object.entries(odds)
    .filter(([, value]) => value > 0)
    .sort((left, right) => right[1] - left[1])
}

type ReadinessStatus = PlannerResult['readinessStatus']

function statusConfig(status: ReadinessStatus) {
  switch (status) {
    case 'Ready Now':
      return {
        border: 'border-emerald-500/30',
        bg: 'bg-[linear-gradient(180deg,rgba(16,45,28,0.55),rgba(12,25,18,0.78))]',
        badgeBg: 'bg-emerald-500/15 border-emerald-400/30',
        badgeText: 'text-emerald-300',
        dot: 'bg-emerald-400',
        barFill: 'bg-emerald-500',
      }
    case 'Nearly Ready':
      return {
        border: 'border-amber-500/30',
        bg: 'bg-[linear-gradient(180deg,rgba(45,35,10,0.55),rgba(25,18,8,0.78))]',
        badgeBg: 'bg-amber-500/15 border-amber-400/30',
        badgeText: 'text-amber-300',
        dot: 'bg-amber-400',
        barFill: 'bg-amber-500',
      }
    case 'Missing Key Resources':
      return {
        border: 'border-orange-500/30',
        bg: 'bg-[linear-gradient(180deg,rgba(45,20,10,0.55),rgba(25,12,8,0.78))]',
        badgeBg: 'bg-orange-500/15 border-orange-400/30',
        badgeText: 'text-orange-300',
        dot: 'bg-orange-500',
        barFill: 'bg-orange-500',
      }
    case 'Income Data Incomplete':
      return {
        border: 'border-slate-500/30',
        bg: 'bg-[linear-gradient(180deg,rgba(20,20,28,0.55),rgba(12,12,18,0.78))]',
        badgeBg: 'bg-slate-500/15 border-slate-400/30',
        badgeText: 'text-slate-300',
        dot: 'bg-slate-400',
        barFill: 'bg-slate-500',
      }
  }
}

function LevelProgressBar({
  currentLevel,
  landingLevel,
  targetLevel = 100,
  barFill,
}: {
  currentLevel: number
  landingLevel: number
  targetLevel?: number
  barFill: string
}) {
  const currentPct = Math.min(100, Math.max(0, ((currentLevel - 1) / (targetLevel - 1)) * 100))
  const landingPct = Math.min(100, Math.max(0, ((landingLevel - 1) / (targetLevel - 1)) * 100))

  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex justify-between text-xs text-violet-100/50">
        <span>Lv {currentLevel}</span>
        <span className="text-violet-100/70">→ Lv {landingLevel}</span>
        <span>Lv {targetLevel}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/8">
        {/* Base fill to current level */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/20"
          style={{ width: `${currentPct}%` }}
        />
        {/* Gain from current to landing */}
        <div
          className={`absolute inset-y-0 rounded-full ${barFill} opacity-80 transition-all duration-500`}
          style={{ left: `${currentPct}%`, width: `${Math.max(0, landingPct - currentPct)}%` }}
        />
        {/* Current level marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/60"
          style={{ left: `${currentPct}%` }}
        />
      </div>
    </div>
  )
}

export function ResultsSection({
  results,
  targetModeLabel,
  onCopySummary,
  copyLabel,
}: {
  results: PlannerResult[]
  targetModeLabel: string
  onCopySummary: () => void
  copyLabel: string
}) {
  const summaryRows = results.map((result) => {
    const pillarLabel =
      appConfig.pillars.find((pillar) => pillar.id === result.pillar)?.label ?? result.pillar
    const mainRow = result.resourceBreakdown.find((row) => row.resource === result.primaryResource)
    const cfg = statusConfig(result.readinessStatus)

    return {
      ...result,
      pillarLabel,
      mainRow,
      cfg,
    }
  })

  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(17,11,24,0.92),rgba(10,7,14,0.88))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 4</p>
          <h2 className="text-3xl font-semibold text-white">Summary</h2>
          <p className="max-w-3xl text-sm leading-6 text-violet-100/70">
            Each pillar's ascension outlook for{' '}
            <span className="text-white">{targetModeLabel}</span> based on your current stock,
            summon levels, and income.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-red-400/30 bg-[linear-gradient(180deg,rgba(239,35,60,0.22),rgba(239,35,60,0.1))] px-5 py-3 text-sm font-semibold text-red-50 transition hover:border-red-300/60 hover:bg-red-500/18 hover:shadow-[0_0_28px_rgba(239,35,60,0.18)]"
          onClick={onCopySummary}
        >
          {copyLabel}
        </button>
      </div>

      {/* Per-pillar cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {summaryRows.map((result) => (
          <article
            key={result.pillar}
            className={`rounded-[24px] border p-5 ${result.cfg.border} ${result.cfg.bg}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-200/70">
                  {result.pillarLabel}
                </p>
                <h3 className="mt-1.5 text-xl font-semibold text-white">
                  {result.readinessStatus}
                </h3>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${result.cfg.badgeBg} ${result.cfg.badgeText}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${result.cfg.dot}`} />
                {targetModeLabel}
              </span>
            </div>

            {/* Progress bar: current level → landing with stock → target */}
            <LevelProgressBar
              currentLevel={result.currentLevel}
              landingLevel={result.landingLevel}
              targetLevel={result.targetLevel}
              barFill={result.cfg.barFill}
            />

            {/* Stats */}
            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Resources to ascend</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.ascendRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Rarity buffer</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.rarityBufferRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-2.5">
                <dt className="text-violet-100/60">Total needed</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.totalRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Adjusted (tech)</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.adjustedTotalRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-2.5">
                <dt className="text-violet-100/60">Still missing</dt>
                <dd className="text-right font-medium">
                  {result.mainRow && result.mainRow.remaining > 0 ? (
                    <span className={`inline-flex items-center gap-1.5 ${result.cfg.badgeText}`}>
                      <ResourceIcon resource={result.mainRow.resource} className="h-4 w-4" />
                      <span>{formatNumber(result.mainRow.remaining)}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-300">Ready now</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Daily gain</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.dailyIncome ?? 0, 1)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">ETA</dt>
                <dd className={`text-right font-semibold ${result.cfg.badgeText}`}>
                  {formatEta(result.mainRow?.daysToTarget ?? 0)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-white/8 pt-4 text-xs leading-5 text-violet-100/55">
              {result.summarySentence}
            </p>
          </article>
        ))}
      </div>

      {/* Landing projection */}
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(39,14,24,0.85),rgba(17,10,24,0.9))] px-5 py-4">
          <h3 className="text-lg font-semibold text-white">Landing with current stock</h3>
          <p className="mt-0.5 text-xs text-violet-100/50">
            How far your existing resources get each pillar before income kicks in.
          </p>
        </div>
        <div className="grid gap-px bg-white/10 lg:grid-cols-3">
          {summaryRows.map((result) => (
            <div
              key={`${result.pillar}-landing`}
              className="bg-[linear-gradient(180deg,rgba(16,10,22,0.9),rgba(12,8,17,0.94))] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-red-200/70">
                    {result.pillarLabel}
                  </p>
                  <h4 className="mt-2 text-2xl font-semibold text-white">
                    Asc {result.landingAscensionLevel} · Lv {formatNumber(result.landingLevel)}
                  </h4>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-stone-200">
                  <ResourceIcon resource={result.primaryResource} className="h-4 w-4" />
                  <span>Stock</span>
                </span>
              </div>

              {result.landingPartialSummons > 0 && (
                <p className="mt-3 text-xs text-violet-100/50">
                  {formatNumber(result.landingPartialSummons)} partial summons into this level
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {formatOddsEntries(result.landingOdds).map(([rarity, chance]) => (
                  <span
                    key={rarity}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-stone-200"
                  >
                    {rarity}: {formatNumber(chance, chance < 1 ? 2 : 1)}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary table */}
      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(55,17,82,0.76),rgba(17,10,24,0.9))] px-5 py-4">
          <h3 className="text-lg font-semibold text-white">All pillars at a glance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-violet-100/72">
              <tr>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ascend cost</th>
                <th className="px-4 py-3 font-medium">Buffer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Adjusted</th>
                <th className="px-4 py-3 font-medium">Missing</th>
                <th className="px-4 py-3 font-medium">Daily</th>
                <th className="px-4 py-3 font-medium">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-violet-50/90">
              {summaryRows.map((result) => (
                <tr key={result.pillar} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{result.pillarLabel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${result.cfg.badgeBg} ${result.cfg.badgeText}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${result.cfg.dot}`} />
                      {result.readinessStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatNumber(result.mainRow?.ascendRequired ?? 0)}</td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.rarityBufferRequired ?? 0)}
                  </td>
                  <td className="px-4 py-3">{formatNumber(result.mainRow?.totalRequired ?? 0)}</td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.adjustedTotalRequired ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    {result.mainRow && result.mainRow.remaining > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ResourceIcon resource={result.mainRow.resource} className="h-4 w-4" />
                        <span>{formatNumber(result.mainRow.remaining)}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.dailyIncome ?? 0, 1)}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${result.cfg.badgeText}`}>
                    {formatEta(result.mainRow?.daysToTarget ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
