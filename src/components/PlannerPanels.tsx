import { appConfig, dungeonYieldConfig, formatDungeonStage, rankedLeagueRewards } from '../data'
import { formatPercent } from '../lib/formatting'
import { usePlannerStore } from '../store/plannerStore'
import type { PillarId, ResourceId } from '../types/planner'
import { LevelField } from './LevelField'
import { NumberField } from './NumberField'
import { ResourceIcon } from './ResourceIcon'
import { SelectField } from './SelectField'

const winRateOptions = [
  { label: '0% wins', value: '0' },
  { label: '25% wins', value: '0.25' },
  { label: '50% wins', value: '0.5' },
  { label: '75% wins', value: '0.75' },
  { label: '100% wins', value: '1' },
]

export function PlannerPanels() {
  const store = usePlannerStore()

  const rankOptions =
    rankedLeagueRewards.leagues[store.rankedLeague]?.entries.map((entry) => ({
      value: entry.rankBracket,
      label: entry.rankBracket,
    })) ?? []

  const dungeonOptions = Array.from(
    { length: dungeonYieldConfig.worlds * dungeonYieldConfig.stagesPerWorld },
    (_, index) => {
      const stageIndex = index + 1
      return {
        value: String(stageIndex),
        label: formatDungeonStage(stageIndex),
      }
    },
  )

  return (
    <div className="grid gap-6">
      <section className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(18,12,24,0.92),rgba(11,8,16,0.82))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 1</p>
          <h2 className="text-2xl font-semibold text-white">Current Inventory</h2>
          <p className="max-w-2xl text-sm text-violet-100/60">
            Start with the materials you already own. All three summon resources stay visible in
            one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {appConfig.resources.map((resource) => (
            <NumberField
              key={resource.id}
              label=""
              value={store.currentResources[resource.id]}
              onChange={(value) =>
                store.setResourceValue(
                  'currentResources',
                  resource.id as ResourceId,
                  Math.max(0, value),
                )
              }
              labelContent={
                <span className="flex items-center gap-2">
                  <ResourceIcon resource={resource.id} className="h-5 w-5" />
                  <span>{resource.label} owned</span>
                </span>
              }
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(165deg,rgba(15,10,20,0.96),rgba(8,7,13,0.92))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)]">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 2</p>
            <h2 className="text-2xl font-semibold text-white">Current Summon Levels</h2>
          </div>

          <div className="grid gap-4">
            <SelectField
              label="Ascend goal"
              value={store.targetMode}
              options={appConfig.targetModes.map((mode) => ({
                value: mode.id,
                label: mode.label,
              }))}
              onChange={(value) => store.setField('targetMode', value as typeof store.targetMode)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {appConfig.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-red-200/70">
                  {pillar.label}
                </p>
                <div className="grid gap-4 sm:grid-cols-[104px_minmax(0,1.45fr)]">
                  <div className="pt-5">
                    <SelectField
                      label="Ascension"
                      value={String(store.pillarSettings[pillar.id].currentAscensionLevel)}
                      options={[1, 2, 3, 4].map((value) => ({
                        value: String(value),
                        label: `Asc ${value}`,
                      }))}
                      onChange={(value) =>
                        store.setPillarScopedField(
                          pillar.id as PillarId,
                          'currentAscensionLevel',
                          Number(value) as 1 | 2 | 3 | 4,
                        )
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <LevelField
                      label="Summon level"
                      value={store.pillarSettings[pillar.id].currentLevel}
                      onChange={(value) =>
                        store.setPillarScopedField(pillar.id as PillarId, 'currentLevel', value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 space-y-1">
              <h3 className="text-lg font-semibold text-white">Partial Progress</h3>
              <p className="text-sm text-violet-100/55">
                Use this only if a pillar is already partway through its current summon level.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {appConfig.pillars.map((pillar) => (
                <NumberField
                  key={pillar.id}
                  label={`${pillar.label} partial summons`}
                  value={store.pillarSettings[pillar.id].currentPartialSummons}
                  min={0}
                  onChange={(value) =>
                    store.setPillarScopedField(
                      pillar.id as PillarId,
                      'currentPartialSummons',
                      Math.max(0, Math.floor(value)),
                    )
                  }
                  hint="Optional progress inside the current level."
                />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 space-y-1">
              <h3 className="text-lg font-semibold text-white">Tech Levels</h3>
              <p className="text-sm text-violet-100/55">
                These tech modifiers are stored separately per pillar and remain after refresh.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-200/70">Skills</p>
                  <p className="mt-2 text-sm text-violet-100/55">
                    Skill summon tech affects summon cost and skill-ticket dungeon drops.
                  </p>
                </div>
                <div className="grid gap-4">
                  <NumberField
                    label="Summon cost tech %"
                    value={store.pillarSettings.skills.discountPct * 100}
                    step={0.1}
                    onChange={(value) =>
                      store.setPillarScopedField('skills', 'discountPct', value / 100)
                    }
                    hint={`Normalized: ${formatPercent(store.pillarSettings.skills.discountPct)}`}
                  />
                  <NumberField
                    label="Skill ticket drop tech %"
                    value={store.pillarSettings.skills.skillTicketDungeonBonusPct * 100}
                    step={0.1}
                    onChange={(value) =>
                      store.setPillarScopedField(
                        'skills',
                        'skillTicketDungeonBonusPct',
                        value / 100,
                      )
                    }
                    hint={`Normalized: ${formatPercent(
                      store.pillarSettings.skills.skillTicketDungeonBonusPct,
                    )}`}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-200/70">Pets</p>
                  <p className="mt-2 text-sm text-violet-100/55">
                    Pet summoning uses its own extra drop chance tech.
                  </p>
                </div>
                <div className="grid gap-4">
                  <NumberField
                    label="Extra drop chance tech %"
                    value={store.pillarSettings.pets.extraDropPct * 100}
                    step={0.1}
                    onChange={(value) =>
                      store.setPillarScopedField('pets', 'extraDropPct', value / 100)
                    }
                    hint={`Normalized: ${formatPercent(store.pillarSettings.pets.extraDropPct)}`}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-red-200/70">Mounts</p>
                  <p className="mt-2 text-sm text-violet-100/55">
                    Mount summoning uses both summon cost and extra drop chance techs.
                  </p>
                </div>
                <div className="grid gap-4">
                  <NumberField
                    label="Summon cost tech %"
                    value={store.pillarSettings.mounts.discountPct * 100}
                    step={0.1}
                    onChange={(value) =>
                      store.setPillarScopedField('mounts', 'discountPct', value / 100)
                    }
                    hint={`Normalized: ${formatPercent(store.pillarSettings.mounts.discountPct)}`}
                  />
                  <NumberField
                    label="Extra drop chance tech %"
                    value={store.pillarSettings.mounts.extraDropPct * 100}
                    step={0.1}
                    onChange={(value) =>
                      store.setPillarScopedField('mounts', 'extraDropPct', value / 100)
                    }
                    hint={`Normalized: ${formatPercent(store.pillarSettings.mounts.extraDropPct)}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(18,12,24,0.92),rgba(11,8,16,0.82))] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-red-300/80">Section 3</p>
            <h2 className="text-2xl font-semibold text-white">Income Settings</h2>
            <p className="max-w-2xl text-sm text-violet-100/60">
              Add the dungeon progress and weekly sources that feed skill tickets, eggshells, and
              clockwinders.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Skill dungeon level"
              value={String(store.skillDungeonLevel)}
              options={dungeonOptions}
              onChange={(value) => store.setField('skillDungeonLevel', Number(value))}
              hint={`Modeled at ${dungeonYieldConfig.keysPerDay} keys/day.`}
            />
            <SelectField
              label="Pet dungeon level"
              value={String(store.petDungeonLevel)}
              options={dungeonOptions}
              onChange={(value) => store.setField('petDungeonLevel', Number(value))}
              hint={`Max stage: ${dungeonYieldConfig.worlds}-${dungeonYieldConfig.stagesPerWorld}.`}
            />
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
              label="Clan war wins"
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
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <p className="text-sm font-medium text-white">Clan milestones</p>
              <p className="mt-2 text-sm leading-6 text-violet-100/55">
                Clan milestone rewards are always included.
              </p>
            </div>
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
              Planner values persist locally in your browser so clanmates can tweak scenarios
              without re-entering their state.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
