import { appConfig, resourceLabels } from '../data'
import { formatCompact, formatEta, formatNumber } from '../lib/formatting'
import type { PlannerResult } from '../types/planner'

export function ResultsSection({
  result,
  onCopySummary,
  copyLabel,
}: {
  result: PlannerResult
  onCopySummary: () => void
  copyLabel: string
}) {
  const visibleResources = result.resourceBreakdown.filter((row) => row.isRelevant)
  const visibleResourceIds = visibleResources.map((row) => row.resource)

  return (
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(17,11,24,0.92),rgba(10,7,14,0.88))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 4</p>
          <h2 className="text-3xl font-semibold text-white">Results</h2>
          <p className="max-w-3xl text-sm leading-6 text-violet-100/70">{result.summarySentence}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-red-400/30 bg-[linear-gradient(180deg,rgba(239,35,60,0.22),rgba(239,35,60,0.1))] px-5 py-3 text-sm font-semibold text-red-50 transition hover:border-red-300/60 hover:bg-red-500/18 hover:shadow-[0_0_28px_rgba(239,35,60,0.18)]"
          onClick={onCopySummary}
        >
          {copyLabel}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(39,14,24,0.85),rgba(17,10,24,0.9))] px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Resource breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-violet-100/72">
                <tr>
                  {[
                    'Resource',
                    'Base required',
                    'Adjusted required',
                    'Current owned',
                    'Remaining',
                    'Daily gain',
                    'ETA',
                  ].map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-violet-50/90">
                {visibleResources.map((row) => (
                  <tr key={row.resource} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">
                      {resourceLabels[row.resource]}
                    </td>
                    <td className="px-4 py-3">{formatNumber(row.baseRequired)}</td>
                    <td className="px-4 py-3">{formatNumber(row.adjustedRequired)}</td>
                    <td className="px-4 py-3">{formatNumber(row.currentOwned)}</td>
                    <td className="px-4 py-3">{formatNumber(row.remaining)}</td>
                    <td className="px-4 py-3">{formatNumber(row.dailyIncome, 1)}</td>
                    <td className="px-4 py-3">{formatEta(row.daysToTarget)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(55,17,82,0.76),rgba(17,10,24,0.9))] px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Income sources</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-violet-100/72">
                <tr>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Cadence</th>
                  {appConfig.resources
                    .filter((resource) => visibleResourceIds.includes(resource.id))
                    .map((resource) => (
                      <th key={resource.id} className="px-4 py-3 font-medium">
                        {resource.shortLabel}/day
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-violet-50/90">
                {result.incomeBreakdown.map((row) => (
                  <tr key={row.source} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">
                      {row.source}
                      {row.isEstimated ? (
                        <span className="ml-2 text-xs text-red-200/70">estimated</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-violet-100/72">
                      {row.periodDays === 1 ? 'Daily' : `Every ${row.periodDays} days`}
                    </td>
                    {appConfig.resources
                      .filter((resource) => visibleResourceIds.includes(resource.id))
                      .map((resource) => (
                        <td key={resource.id} className="px-4 py-3">
                          {formatCompact(row.values[resource.id])}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
