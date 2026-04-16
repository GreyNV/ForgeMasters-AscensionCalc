import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { appConfig, rankedLeagueRewards } from '../data'
import { normalizePercentInput } from '../lib/parseNumber'
import type { PillarId, PillarScopedSettings, PlannerState, ResourceId } from '../types/planner'

type PlannerStore = PlannerState & {
  setField: <K extends keyof PlannerState>(key: K, value: PlannerState[K]) => void
  setPillarScopedField: <K extends keyof PillarScopedSettings>(
    pillar: PillarId,
    key: K,
    value: PillarScopedSettings[K],
  ) => void
  setResourceValue: (
    collection: 'currentResources' | 'manualDailyIncome',
    resource: ResourceId,
    value: number,
  ) => void
  replaceState: (state: PlannerState) => void
  reset: () => void
}

const scopedSettingKeys: Array<keyof PillarScopedSettings> = [
  'currentLevel',
  'currentPartialSummons',
  'discountPct',
  'extraDropPct',
  'skillTicketDungeonBonusPct',
]

function createDefaultScopedSettings(): Record<PillarId, PillarScopedSettings> {
  return {
    skills: {
      currentLevel: appConfig.defaults.currentLevel,
      currentPartialSummons: 0,
      discountPct: appConfig.defaults.discountPct,
      extraDropPct: appConfig.defaults.extraDropPct,
      skillTicketDungeonBonusPct: appConfig.defaults.skillTicketDungeonBonusPct,
    },
    pets: {
      currentLevel: appConfig.defaults.currentLevel,
      currentPartialSummons: 0,
      discountPct: appConfig.defaults.discountPct,
      extraDropPct: appConfig.defaults.extraDropPct,
      skillTicketDungeonBonusPct: 0,
    },
    mounts: {
      currentLevel: appConfig.defaults.currentLevel,
      currentPartialSummons: 0,
      discountPct: appConfig.defaults.discountPct,
      extraDropPct: appConfig.defaults.extraDropPct,
      skillTicketDungeonBonusPct: 0,
    },
  }
}

function getScopedSettingsForPillar(
  pillar: PillarId,
  pillarSettings: Record<PillarId, PillarScopedSettings>,
): PillarScopedSettings {
  return pillarSettings[pillar]
}

function hydratePlannerState(state: Partial<PlannerState>): PlannerState {
  const pillarSettings = state.pillarSettings ?? createDefaultScopedSettings()
  const activePillar = state.pillar ?? appConfig.defaults.pillar
  const activeSettings = getScopedSettingsForPillar(activePillar, pillarSettings)

  return {
    pillar: activePillar,
    currentLevel: activeSettings.currentLevel,
    targetLevel: state.targetLevel ?? appConfig.defaults.targetLevel,
    currentPartialSummons: activeSettings.currentPartialSummons,
    targetMode: state.targetMode ?? appConfig.defaults.targetMode,
    discountPct: activeSettings.discountPct,
    extraDropPct: activeSettings.extraDropPct,
    skillDungeonLevel: state.skillDungeonLevel ?? appConfig.defaults.skillDungeonLevel,
    petDungeonLevel: state.petDungeonLevel ?? appConfig.defaults.petDungeonLevel,
    skillTicketDungeonBonusPct: activeSettings.skillTicketDungeonBonusPct,
    clanTier: state.clanTier ?? appConfig.defaults.clanTier,
    clanWinRate: state.clanWinRate ?? appConfig.defaults.clanWinRate,
    rankedLeague: state.rankedLeague ?? appConfig.defaults.rankedLeague,
    rankBracket: state.rankBracket ?? appConfig.defaults.rankBracket,
    includeRankedLeague: state.includeRankedLeague ?? appConfig.defaults.includeRankedLeague,
    includeMilestoneRewards: true,
    currentResources: state.currentResources ?? appConfig.defaults.currentResources,
    manualDailyIncome: state.manualDailyIncome ?? appConfig.defaults.manualDailyIncome,
    pillarSettings,
  }
}

const defaultState: PlannerState = hydratePlannerState({})

export const usePlannerStore = create<PlannerStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setField: (key, value) =>
        set((state) => {
          if (key === 'pillar') {
            const nextPillar = value as PillarId
            const nextScopedSettings = getScopedSettingsForPillar(nextPillar, state.pillarSettings)
            return {
              ...state,
              pillar: nextPillar,
              currentLevel: nextScopedSettings.currentLevel,
              currentPartialSummons: nextScopedSettings.currentPartialSummons,
              discountPct: nextScopedSettings.discountPct,
              extraDropPct: nextScopedSettings.extraDropPct,
              skillTicketDungeonBonusPct: nextScopedSettings.skillTicketDungeonBonusPct,
            }
          }

          const nextState = { ...state, [key]: value } as PlannerState

          if (key === 'discountPct' || key === 'extraDropPct') {
            nextState[key] = normalizePercentInput(value as number) as PlannerState[typeof key]
          }

          if (key === 'skillTicketDungeonBonusPct') {
            nextState.skillTicketDungeonBonusPct = normalizePercentInput(value as number)
          }

          if (key === 'rankedLeague') {
            const firstBracket =
              rankedLeagueRewards.leagues[value as string]?.entries[0]?.rankBracket ??
              defaultState.rankBracket
            nextState.rankBracket = firstBracket
          }

          if (scopedSettingKeys.includes(key as keyof PillarScopedSettings)) {
            nextState.pillarSettings = {
              ...state.pillarSettings,
              [state.pillar]: {
                ...state.pillarSettings[state.pillar],
                [key]: nextState[key as keyof PlannerState],
              },
            }
          }

          return nextState
        }),
      setPillarScopedField: (pillar, key, value) =>
        set((state) => {
          const nextValue =
            key === 'discountPct' || key === 'extraDropPct' || key === 'skillTicketDungeonBonusPct'
              ? normalizePercentInput(value as number)
              : value

          const nextPillarSettings = {
            ...state.pillarSettings,
            [pillar]: {
              ...state.pillarSettings[pillar],
              [key]: nextValue,
            },
          }

          const nextState: PlannerState = {
            ...state,
            pillarSettings: nextPillarSettings,
          }

          if (pillar === state.pillar) {
            const activeSettings = nextPillarSettings[pillar]
            nextState.currentLevel = activeSettings.currentLevel
            nextState.currentPartialSummons = activeSettings.currentPartialSummons
            nextState.discountPct = activeSettings.discountPct
            nextState.extraDropPct = activeSettings.extraDropPct
            nextState.skillTicketDungeonBonusPct = activeSettings.skillTicketDungeonBonusPct
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
      replaceState: (state) => set(hydratePlannerState(state)),
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
        skillDungeonLevel: state.skillDungeonLevel,
        petDungeonLevel: state.petDungeonLevel,
        skillTicketDungeonBonusPct: state.skillTicketDungeonBonusPct,
        clanTier: state.clanTier,
        clanWinRate: state.clanWinRate,
        rankedLeague: state.rankedLeague,
        rankBracket: state.rankBracket,
        includeRankedLeague: state.includeRankedLeague,
        currentResources: state.currentResources,
        manualDailyIncome: state.manualDailyIncome,
        pillarSettings: state.pillarSettings,
      }),
    },
  ),
)
