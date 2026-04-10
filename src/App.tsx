import { useState } from 'react'
import { PlannerPanels } from './components/PlannerPanels'
import { ResultsSection } from './components/ResultsSection'
import { usePlannerResult } from './hooks/usePlannerResult'

function App() {
  const result = usePlannerResult()
  const [copyLabel, setCopyLabel] = useState('Copy summary')

  async function handleCopySummary() {
    await navigator.clipboard.writeText(result.summarySentence)
    setCopyLabel('Copied')
    window.setTimeout(() => setCopyLabel('Copy summary'), 1400)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,_#17130f_0%,_#0d0a08_55%,_#090807_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-black/25 px-6 py-8 shadow-2xl shadow-black/30 backdrop-blur-sm sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">
                Forge Masters Ascension Planner
              </p>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  See what you still need, what is slowing you down, and when you can ascend safely.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-stone-300">
                  Workbook data is normalized into typed config, the modifier formula matches the
                  source sheet, and yield assumptions stay editable where the spreadsheet is
                  incomplete.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-300/15 bg-amber-300/10 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">
                Planner principle
              </p>
              <p className="mt-3 text-lg font-medium text-white">
                Correctness first, modifiability second, and zero spreadsheet archaeology required
                for clanmates.
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
