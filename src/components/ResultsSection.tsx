import { appConfig, resourceLabels } from '../data'
import { formatEta, formatNumber } from '../lib/formatting'
import type { PlannerResult } from '../types/planner'
import { ResourceIcon } from './ResourceIcon'

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

    return {
      ...result,
      pillarLabel,
      mainRow,
    }
  })

  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(17,11,24,0.92),rgba(10,7,14,0.88))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 4</p>
          <h2 className="text-3xl font-semibold text-white">Summary</h2>
          <p className="max-w-3xl text-sm leading-6 text-violet-100/70">
            This is where each pillar lands for <span className="text-white">{targetModeLabel}</span>{' '}
            based on your current stock, summon levels, and income setup.
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

      <div className="grid gap-4 lg:grid-cols-3">
        {summaryRows.map((result) => (
          <article
            key={result.pillar}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(39,14,24,0.5),rgba(17,10,24,0.78))] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-red-200/70">
                  {result.pillarLabel}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {result.readinessStatus}
                </h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-stone-200">
                {targetModeLabel}
              </span>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
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
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Total</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.totalRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Adjusted total</dt>
                <dd className="text-right font-medium text-white">
                  {formatNumber(result.mainRow?.adjustedTotalRequired ?? 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-violet-100/60">Missing</dt>
                <dd className="text-right font-medium text-white">
                  {result.mainRow && result.mainRow.remaining > 0
                    ? (
                        <span className="inline-flex items-center gap-2">
                          <ResourceIcon resource={result.mainRow.resource} className="h-5 w-5" />
                          <span>
                            {formatNumber(result.mainRow.remaining)}{' '}
                            {resourceLabels[result.mainRow.resource]}
                          </span>
                        </span>
                      )
                    : 'Ready now'}
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
                <dd className="text-right font-medium text-white">
                  {formatEta(result.mainRow?.daysToTarget ?? 0)}
                </dd>
              </div>
            </dl>

            <p className="mt-5 text-sm leading-6 text-violet-100/68">{result.summarySentence}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/10">
        <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(55,17,82,0.76),rgba(17,10,24,0.9))] px-5 py-4">
          <h3 className="text-lg font-semibold text-white">All pillars at a glance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-violet-100/72">
              <tr>
                <th className="px-4 py-3 font-medium">Pillar</th>
                <th className="px-4 py-3 font-medium">Resources to ascend</th>
                <th className="px-4 py-3 font-medium">Rarity buffer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Adjusted total</th>
                <th className="px-4 py-3 font-medium">Missing</th>
                <th className="px-4 py-3 font-medium">Daily gain</th>
                <th className="px-4 py-3 font-medium">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-violet-50/90">
              {summaryRows.map((result) => (
                <tr key={result.pillar} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{result.pillarLabel}</td>
                  <td className="px-4 py-3">{formatNumber(result.mainRow?.ascendRequired ?? 0)}</td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.rarityBufferRequired ?? 0)}
                  </td>
                  <td className="px-4 py-3">{formatNumber(result.mainRow?.totalRequired ?? 0)}</td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.adjustedTotalRequired ?? 0)}
                  </td>
                  <td className="px-4 py-3">
                    {result.mainRow
                      ? (
                          <span className="inline-flex items-center gap-2">
                            <ResourceIcon resource={result.mainRow.resource} className="h-4 w-4" />
                            <span>
                              {formatNumber(result.mainRow.remaining)}{' '}
                              {resourceLabels[result.mainRow.resource]}
                            </span>
                          </span>
                        )
                      : 'Ready now'}
                  </td>
                  <td className="px-4 py-3">
                    {formatNumber(result.mainRow?.dailyIncome ?? 0, 1)}
                  </td>
                  <td className="px-4 py-3">{formatEta(result.mainRow?.daysToTarget ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
