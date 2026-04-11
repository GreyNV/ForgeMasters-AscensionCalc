import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { appConfig, rankedLeagueRewards } from '../data'
import { normalizePercentInput } from '../lib/parseNumber'
import type { PlannerState, ResourceId } from '../types/planner'

type PlannerStore = PlannerState & {
  setField: <K extends keyof PlannerState>(key: K, value: PlannerState[K]) => void
  setResourceValue: (
    collection: 'currentResources' | 'manualDailyIncome',
    resource: ResourceId,
    value: number,
  ) => void
  replaceState: (state: PlannerState) => void
  reset: () => void
}

const defaultState: PlannerState = {
  pillar: appConfig.defaults.pillar,
  currentLevel: appConfig.defaults.currentLevel,
  targetLevel: appConfig.defaults.targetLevel,
  currentPartialSummons: 0,
  targetMode: appConfig.defaults.targetMode,
  discountPct: appConfig.defaults.discountPct,
  extraDropPct: appConfig.defaults.extraDropPct,
  dungeonLevel: appConfig.defaults.dungeonLevel,
  skillTicketDungeonBonusPct: appConfig.defaults.skillTicketDungeonBonusPct,
  clanTier: appConfig.defaults.clanTier,
  clanWinRate: appConfig.defaults.clanWinRate,
  rankedLeague: appConfig.defaults.rankedLeague,
  rankBracket: appConfig.defaults.rankBracket,
  includeRankedLeague: appConfig.defaults.includeRankedLeague,
  includeMilestoneRewards: appConfig.defaults.includeMilestoneRewards,
  currentResources: appConfig.defaults.currentResources,
  manualDailyIncome: appConfig.defaults.manualDailyIncome,
}

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setField: (key, value) =>
        set((state) => {
          const nextState = { ...state, [key]: value }

          if (key === 'discountPct' || key === 'extraDropPct') {
            nextState[key] = normalizePercentInput(value as number) as PlannerStore[typeof key]
          }

          if (key === 'rankedLeague') {
            const firstBracket =
              rankedLeagueRewards.leagues[value as string]?.entries[0]?.rankBracket ??
              defaultState.rankBracket
            nextState.rankBracket = firstBracket
          }

          return nextState
        }),
      setResourceValue: (collection, resource, value) =>
        set((state) => ({
          ...state,
          [collection]: {
            ...state[collection],
            [resource]: Math.max(0, value),
          },
        })),
      replaceState: (state) => set({ ...state }),
      reset: () => set(defaultState),
    }),
    {
      name: 'forge-masters-planner',
      partialize: (state) => ({
        pillar: state.pillar,
        currentLevel: state.currentLevel,
        targetLevel: state.targetLevel,
        currentPartialSummons: state.currentPartialSummons,
        targetMode: state.targetMode,
        discountPct: state.discountPct,
        extraDropPct: state.extraDropPct,
        dungeonLevel: state.dungeonLevel,
        skillTicketDungeonBonusPct: state.skillTicketDungeonBonusPct,
        clanTier: state.clanTier,
        clanWinRate: state.clanWinRate,
        rankedLeague: state.rankedLeague,
        rankBracket: state.rankBracket,
        includeRankedLeague: state.includeRankedLeague,
        includeMilestoneRewards: state.includeMilestoneRewards,
        currentResources: state.currentResources,
        manualDailyIncome: state.manualDailyIncome,
      }),
    },
  ),
)
