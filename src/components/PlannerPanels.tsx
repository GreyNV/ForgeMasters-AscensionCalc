import {
  appConfig,
  dungeonYieldConfig,
  formatDungeonStage,
  getVisibleResourceIds,
  rankedLeagueRewards,
  resourceLabels,
} from '../data'
import { formatPercent } from '../lib/formatting'
import { NumberField } from './NumberField'
import { SelectField } from './SelectField'
import { usePlannerStore } from '../store/plannerStore'
import type { ResourceId } from '../types/planner'

const winRateOptions = [
  { label: 'Always lose', value: '0' },
  { label: '25% wins', value: '0.25' },
  { label: '50% wins', value: '0.5' },
  { label: '75% wins', value: '0.75' },
  { label: 'Always win', value: '1' },
]

export function PlannerPanels() {
  const store = usePlannerStore()
  const visibleResources = appConfig.resources.filter((resource) =>
    getVisibleResourceIds(store.pillar).includes(resource.id),
  )
  const showDungeonControls = store.pillar !== 'mounts'

  const rankOptions =
    rankedLeagueRewards.leagues[store.rankedLeague]?.entries.map((entry) => ({
      value: entry.rankBracket,
      label: entry.rankBracket,
    })) ?? []

  const presetButtons = [
    { label: 'None', discountPct: 0, extraDropPct: 0 },
    { label: 'Discount only', discountPct: 0.25, extraDropPct: 0 },
    { label: 'Extra drop only', discountPct: 0, extraDropPct: 0.2 },
    { label: 'Both', discountPct: 0.25, extraDropPct: 0.2 },
  ]

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
      <section className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(18,12,24,0.92),rgba(11,8,16,0.82))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">
            Section 1
          </p>
          <h2 className="text-2xl font-semibold text-white">Planner Settings</h2>
          <p className="max-w-2xl text-sm text-violet-100/60">
            Choose the pillar, current summon progress, and modifier state you want to plan
            against.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Pillar"
            value={store.pillar}
            options={appConfig.pillars.map((pillar) => ({
              value: pillar.id,
              label: pillar.label,
            }))}
            onChange={(value) => store.setField('pillar', value as typeof store.pillar)}
          />
          <SelectField
            label="Target mode"
            value={store.targetMode}
            options={appConfig.targetModes.map((mode) => ({
              value: mode.id,
              label: mode.label,
            }))}
            onChange={(value) => store.setField('targetMode', value as typeof store.targetMode)}
          />
          <NumberField
            label="Current summon level"
            value={store.currentLevel}
            min={1}
            max={100}
            onChange={(value) => store.setField('currentLevel', Math.max(1, Math.min(100, value)))}
          />
          <NumberField
            label="Current partial summons"
            value={store.currentPartialSummons}
            min={0}
            onChange={(value) =>
              store.setField('currentPartialSummons', Math.max(0, Math.floor(value)))
            }
            hint="Optional v1.1-style progress inside the current level."
          />
          <NumberField
            label="Discount %"
            value={store.discountPct * 100}
            step={0.1}
            onChange={(value) => store.setField('discountPct', value / 100)}
            hint={`Normalized: ${formatPercent(store.discountPct)}`}
          />
          <NumberField
            label="Extra drop %"
            value={store.extraDropPct * 100}
            step={0.1}
            onChange={(value) => store.setField('extraDropPct', value / 100)}
            hint={`Normalized: ${formatPercent(store.extraDropPct)}`}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {presetButtons.map((preset) => (
            <button
              key={preset.label}
              className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:border-red-400/55 hover:bg-red-500/16 hover:shadow-[0_0_24px_rgba(239,35,60,0.16)]"
              onClick={() => {
                store.setField('discountPct', preset.discountPct)
                store.setField('extraDropPct', preset.extraDropPct)
              }}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">
              Section 2
            </p>
            <h2 className="text-2xl font-semibold text-white">Income Settings</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {showDungeonControls ? (
              <SelectField
                label="Dungeon level"
                value={String(store.dungeonLevel)}
                options={Array.from(
                  { length: dungeonYieldConfig.worlds * dungeonYieldConfig.stagesPerWorld },
                  (_, index) => {
                    const stageIndex = index + 1
                    return {
                      value: String(stageIndex),
                      label: formatDungeonStage(stageIndex),
                    }
                  },
                )}
                onChange={(value) => store.setField('dungeonLevel', Number(value))}
                hint={`Modeled at ${dungeonYieldConfig.keysPerDay} keys/day. Max stage: ${dungeonYieldConfig.worlds}-${dungeonYieldConfig.stagesPerWorld}.`}
              />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="text-sm font-medium text-white">Dungeon level</p>
                <p className="mt-2 text-sm leading-6 text-violet-100/55">
                  Mounts do not use dungeon income, so this selector is hidden for the mount
                  planner.
                </p>
              </div>
            )}
            <SelectField
              label="Clan tier"
              value={store.clanTier}
              options={['S', 'A', 'B', 'C', 'D', 'E'].map((tier) => ({
                value: tier,
                label: `Tier ${tier}`,
              }))}
              onChange={(value) => store.setField('clanTier', value as typeof store.clanTier)}
            />
            <SelectField
              label="Clan war win frequency"
              value={String(store.clanWinRate)}
              options={winRateOptions}
              onChange={(value) => store.setField('clanWinRate', Number(value))}
            />
            <SelectField
              label="Ranked league"
              value={store.rankedLeague}
              options={Object.entries(rankedLeagueRewards.leagues).map(([key, league]) => ({
                value: key,
                label: league.label,
              }))}
              onChange={(value) => store.setField('rankedLeague', value)}
            />
            <SelectField
              label="Rank bracket"
              value={store.rankBracket}
              options={rankOptions}
              onChange={(value) => store.setField('rankBracket', value)}
              hint={rankedLeagueRewards.leagues[store.rankedLeague]?.placementRule}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span className="text-sm font-medium text-white">Include ranked league rewards</span>
              <input
                type="checkbox"
                checked={store.includeRankedLeague}
                onChange={(event) => store.setField('includeRankedLeague', event.target.checked)}
                className="h-5 w-5 accent-red-500"
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span className="text-sm font-medium text-white">Include clan milestones</span>
              <input
                type="checkbox"
                checked={store.includeMilestoneRewards}
                onChange={(event) =>
                  store.setField('includeMilestoneRewards', event.target.checked)
                }
                className="h-5 w-5 accent-red-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {visibleResources.map((resource) => (
              <NumberField
                key={resource.id}
                label={`Manual ${resource.label} / day`}
                value={store.manualDailyIncome[resource.id]}
                onChange={(value) =>
                  store.setResourceValue(
                    'manualDailyIncome',
                    resource.id as ResourceId,
                    Math.max(0, value),
                  )
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(165deg,rgba(15,10,20,0.96),rgba(8,7,13,0.92))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">
            Section 3
          </p>
          <h2 className="text-2xl font-semibold text-white">Current Inventory</h2>
          <p className="text-sm text-violet-100/60">
            Enter what you already own for the selected pillar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {visibleResources.map((resource) => (
            <NumberField
              key={resource.id}
              label={`${resource.label} owned`}
              value={store.currentResources[resource.id]}
              onChange={(value) =>
                store.setResourceValue(
                  'currentResources',
                  resource.id as ResourceId,
                  Math.max(0, value),
                )
              }
            />
          ))}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Save & Load</h3>
            <button
              type="button"
              className="rounded-full border border-red-400/25 px-4 py-2 text-sm font-medium text-red-100 transition hover:border-red-400/55 hover:bg-red-500/10"
              onClick={store.reset}
            >
              Reset to defaults
            </button>
          </div>
          <p className="text-sm text-violet-100/55">
            Planner values persist locally in your browser so clanmates can tweak scenarios without
            re-entering their state.
          </p>
        </div>
      </section>
    </div>
  )
}

export function ResourceTag({ resource }: { resource: ResourceId }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-stone-200">
      {resourceLabels[resource]}
    </span>
  )
}
