import { useEffect, useMemo, useState } from 'react'
import { PlannerPanels } from './components/PlannerPanels'
import { ResultsSection } from './components/ResultsSection'
import { usePlannerResult } from './hooks/usePlannerResult'
import { deserializePlannerState, serializePlannerState } from './lib/shareState'
import { usePlannerStore } from './store/plannerStore'

function App() {
  const result = usePlannerResult()
  const store = usePlannerStore()
  const [copyLabel, setCopyLabel] = useState('Copy summary')
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    const query = serializePlannerState(store)
    return `${window.location.origin}${window.location.pathname}?${query}`
  }, [store])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const sharedState = deserializePlannerState(window.location.search, store)
    if (sharedState) {
      store.replaceState(sharedState)
    }
    // We only want to hydrate once from the incoming URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCopySummary() {
    await navigator.clipboard.writeText(`${result.copySummary}\n${shareUrl}`)
    setCopyLabel('Copied')
    window.setTimeout(() => setCopyLabel('Copy summary'), 1400)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,35,60,0.12),_transparent_28%),radial-gradient(circle_at_62%_24%,_rgba(181,70,255,0.16),_transparent_30%),linear-gradient(180deg,_#08060b_0%,_#0d0811_46%,_#070509_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,10,22,0.95),rgba(8,6,12,0.88))] px-6 py-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(239,35,60,0.24),transparent_58%)]" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(181,70,255,0.24),transparent_68%)] blur-2xl" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.36em] text-red-300/80">
                [EVL] Evil Ascension Planner
              </p>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Forge through the last gap, spot the bottleneck, and time your next ascension
                  with EVIL precision.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-violet-100/72">
                  Built for clanmates who want a fast answer instead of a spreadsheet dig. Pick a
                  pillar, drop in your stock and income, and get a clean ETA that feels at home in
                  the EVIL forge.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-violet-400/20 bg-[linear-gradient(160deg,rgba(46,17,56,0.84),rgba(17,10,24,0.9))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">
                Clan Directive
              </p>
              <p className="mt-3 text-lg font-medium text-white">
                Black iron, violet fire, and numbers you can trust before reset day hits.
              </p>
              <p className="mt-4 text-sm leading-6 text-violet-100/70">
                The planner stays sharp, mobile-friendly, and direct so anyone in EVIL can check
                readiness in seconds.
              </p>
            </div>
          </div>
        </section>

        <PlannerPanels />
        <ResultsSection
          result={result}
          onCopySummary={handleCopySummary}
          copyLabel={copyLabel}
        />
      </div>
    </main>
  )
}

export default App
