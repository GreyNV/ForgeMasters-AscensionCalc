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
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(145deg,rgba(16,10,22,0.95),rgba(8,6,12,0.88))] px-6 py-8 shadow-[0_32px_90px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(239,35,60,0.24),transparent_58%)]" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(181,70,255,0.24),transparent_68%)] blur-2xl" />
          <div className="pointer-events-none absolute right-6 top-6 hidden h-32 w-32 overflow-hidden rounded-[28px] border border-white/8 opacity-12 shadow-[0_16px_44px_rgba(0,0,0,0.35)] lg:block">
            <img src={clanLogo} alt="" aria-hidden="true" className="h-full w-full object-cover" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/12 bg-white/6 shadow-[0_14px_34px_rgba(0,0,0,0.3)]">
                  <img src={clanLogo} alt="EVL clan logo" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.36em] text-red-300/80">
                    [EVL] Evil Ascension Planner
                  </p>
                  <p className="text-sm uppercase tracking-[0.22em] text-violet-100/48">
                    Clan Readiness Console
                  </p>
                </div>
              </div>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  Fill in inventory, levels, and income once, then see every pillar's ascension
                  outlook in one pass.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-violet-100/72">
                  Built for clanmates who want a straight path instead of a spreadsheet puzzle:
                  enter your materials, set current summon levels, add dungeon and clan income, and
                  get a clean summary for skills, pets, and mounts.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-violet-400/20 bg-[linear-gradient(160deg,rgba(46,17,56,0.84),rgba(17,10,24,0.9))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-black/20">
                  <img src={clanLogo} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">
                    Clan Directive
                  </p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-violet-100/40">
                    EVL Operations
                  </p>
                </div>
              </div>
              <p className="mt-3 text-lg font-medium text-white">
                One setup flow. Three pillar answers. No guessing which screen comes next.
              </p>
              <p className="mt-4 text-sm leading-6 text-violet-100/70">
                The planner now follows the same order players think through the problem in game,
                which makes readiness checks much faster on both desktop and mobile.
              </p>
            </div>
          </div>
        </section>

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
