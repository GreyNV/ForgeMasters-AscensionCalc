import { appConfig, resourceLabels } from '../data'
import { formatCompact, formatEta, formatNumber, formatPercent } from '../lib/formatting'
import type { PlannerResult } from '../types/planner'

const statusTone: Record<PlannerResult['readinessStatus'], string> = {
  'Ready Now': 'bg-emerald-400/15 text-emerald-200 border-emerald-300/20',
  'Nearly Ready': 'bg-sky-400/15 text-sky-200 border-sky-300/20',
  'Missing Key Resources': 'bg-rose-400/15 text-rose-200 border-rose-300/20',
  'Income Data Incomplete': 'bg-amber-400/15 text-amber-100 border-amber-300/20',
}

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
    <section className="space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">Section 4</p>
          <h2 className="text-3xl font-semibold text-white">Results</h2>
          <p className="max-w-3xl text-sm leading-6 text-stone-300">{result.summarySentence}</p>
        </div>
        <button
          type="button"
          className="rounded-full border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-300/15"
          onClick={onCopySummary}
        >
          {copyLabel}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Status"
          value={result.readinessStatus}
          accent={statusTone[result.readinessStatus]}
        />
        <MetricCard
          label="Bottleneck"
          value={result.bottleneckResource ? resourceLabels[result.bottleneckResource] : 'None'}
        />
        <MetricCard label="ETA" value={formatEta(result.bottleneckDays)} />
        <MetricCard label="Modifier effect" value={formatPercent(result.effectiveFinalDiscount)} />
        <MetricCard label="Relevant resources" value={String(visibleResources.length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="border-b border-white/10 bg-black/20 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Resource breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-stone-300">
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
              <tbody className="divide-y divide-white/5 text-stone-200">
                {visibleResources.map((row) => (
                  <tr key={row.resource}>
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
          <div className="border-b border-white/10 bg-black/20 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">Income sources</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-stone-300">
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
              <tbody className="divide-y divide-white/5 text-stone-200">
                {result.incomeBreakdown.map((row) => (
                  <tr key={row.source}>
                    <td className="px-4 py-3 font-medium text-white">
                      {row.source}
                      {row.isEstimated ? (
                        <span className="ml-2 text-xs text-amber-200/70">estimated</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-stone-300">
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

      <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
        <h3 className="text-lg font-semibold text-white">Confidence and assumptions</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-300">
          {result.assumptions.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  accent = 'bg-white/5 text-white border-white/10',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className={`rounded-[24px] border p-5 ${accent}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-stone-300/75">{label}</p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  )
}
