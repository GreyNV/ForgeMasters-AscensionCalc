import { useEffect, useMemo, useState } from 'react'
import clanLogo from './assets/clan logo.jpeg'
import { PlannerPanels } from './components/PlannerPanels'
import { ResultsSection } from './components/ResultsSection'
import { appConfig } from './data'
import { getPlannerResultsByPillar } from './lib/plannerMath'
import { deserializePlannerState, serializePlannerState } from './lib/shareState'
import { usePlannerStore } from './store/plannerStore'

function App() {
  const store = usePlannerStore()
  const [copyLabel, setCopyLabel] = useState('Copy summary')
  const results = useMemo(() => getPlannerResultsByPillar(store), [store])
  const targetModeLabel =
    appConfig.targetModes.find((mode) => mode.id === store.targetMode)?.label ?? 'Ascend'
  const combinedSummary = useMemo(
    () =>
      results
        .map((result) => {
          const pillarLabel =
            appConfig.pillars.find((pillar) => pillar.id === result.pillar)?.label ?? result.pillar
          return `${pillarLabel}: ${result.copySummary}`
        })
        .join('\n'),
    [results],
  )
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
    await navigator.clipboard.writeText(`${combinedSummary}\n${shareUrl}`)
    setCopyLabel('Copied')
    window.setTimeout(() => setCopyLabel('Copy summary'), 1400)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,35,60,0.12),_transparent_28%),radial-gradient(circle_at_62%_24%,_rgba(181,70,255,0.16),_transparent_30%),linear-gradient(180deg,_#08060b_0%,_#0d0811_46%,_#070509_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,10,22,0.95),rgba(8,6,12,0.88))] px-5 py-4 shadow-[0_16px_48px_rgba(0,0,0,0.40)] backdrop-blur-sm sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(239,35,60,0.18),transparent_60%)]" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/12 bg-white/6 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                <img src={clanLogo} alt="EVL clan logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-red-300/80">
                  [EVL] Evil Ascension Planner
                </p>
                <h1 className="mt-0.5 text-sm uppercase tracking-[0.2em] text-violet-100/50">
                  Clan Readiness Console
                </h1>
              </div>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-violet-100/50 sm:block">
              Enter inventory, summon levels, and income to see each pillar's ascension outlook.
            </p>
          </div>
        </header>

        <PlannerPanels />
        <ResultsSection
          results={results}
          targetModeLabel={targetModeLabel}
          onCopySummary={handleCopySummary}
          copyLabel={copyLabel}
        />
      </div>
    </main>
  )
}

export default App
