import appConfigJson from './appConfig.json'
import ascensionTargetsJson from './ascensionTargets.json'
import clanWarRewardsJson from './clanWarRewards.json'
import dungeonYieldConfigJson from './dungeonYieldConfig.json'
import forgeJson from './forge.json'
import individualClanRewardsJson from './individualClanRewards.json'
import mountsJson from './mounts.json'
import petsJson from './pets.json'
import rankedLeagueRewardsJson from './rankedLeagueRewards.json'
import skillsJson from './skills.json'
import type {
  AppConfig,
  PillarId,
  PillarProgression,
  ResourceId,
  ResourceMap,
} from '../types/planner'

type RewardTable = {
  periodDays: number
  assumptions: string[]
}

type AscensionTargets = typeof ascensionTargetsJson
type ForgeProgression = typeof forgeJson

export const appConfig = appConfigJson as AppConfig
export const ascensionTargets = ascensionTargetsJson as AscensionTargets
export const clanWarRewards = clanWarRewardsJson as RewardTable & {
  tiers: Record<string, { win: ResourceMap; loss: ResourceMap }>
}
export const dungeonYieldConfig = dungeonYieldConfigJson as {
  editable: boolean
  note: string
  keysPerDay: number
  stagesPerWorld: number
  worlds: number
  baseStage: {
    world: number
    stage: number
    stageIndex: number
    dailyYields: ResourceMap
  }
  midStage: {
    world: number
    stage: number
    stageIndex: number
    dailyYields: ResourceMap
  }
  anchorStage: {
    world: number
    stage: number
    stageIndex: number
    dailyYields: ResourceMap
  }
  ticketFormula: {
    kind: 'roundedLinearPerKeyWithBonus'
    basePerKey: number
    incrementPerStage: number
  }
  eggshellFormula: {
    kind: 'roundedLinearPerKey'
    basePerKey: number
    incrementPerStage: number
  }
  perStageDailyIncrement: ResourceMap
}
export const forgeProgression = forgeJson as ForgeProgression
export const individualClanRewards = individualClanRewardsJson as RewardTable & {
  milestones: Array<{
    milestone: string
    rewards: ResourceMap
  }>
}
const rawRankedLeagueRewards = rankedLeagueRewardsJson as RewardTable & {
  leagues: Record<
    string,
    {
      label: string
      placementRule: string
      entries: Array<{
        rankBracket: string
        rewards: ResourceMap
      }>
    }
  >
}
export const rankedLeagueRewards = {
  ...rawRankedLeagueRewards,
  leagues: Object.fromEntries(
    Object.entries(rawRankedLeagueRewards.leagues).map(([leagueKey, league]) => [
      leagueKey,
      {
        ...league,
        entries: league.entries.map((entry, index) => ({
          ...entry,
          rankBracket:
            index === 0
              ? '1st'
              : index === 1
                ? '2nd'
                : index === 2
                  ? '3rd'
                  : entry.rankBracket,
        })),
      },
    ]),
  ),
} as typeof rawRankedLeagueRewards

export const pillarProgressions = {
  skills: skillsJson,
  pets: petsJson,
  mounts: mountsJson,
} as Record<PillarId, PillarProgression>

export const resourceIds = appConfig.resources.map((resource) => resource.id)
export const resourceLabels = Object.fromEntries(
  appConfig.resources.map((resource) => [resource.id, resource.label]),
) as Record<ResourceId, string>

export function getPrimaryResourceForPillar(pillar: PillarId): ResourceId {
  return appConfig.pillars.find((entry) => entry.id === pillar)!.primaryResource
}

export function getVisibleResourceIds(pillar: PillarId): ResourceId[] {
  return [getPrimaryResourceForPillar(pillar)]
}

export function formatDungeonStage(stageIndex: number): string {
  const stagesPerWorld = dungeonYieldConfig.stagesPerWorld
  const world = Math.floor((stageIndex - 1) / stagesPerWorld) + 1
  const stage = ((stageIndex - 1) % stagesPerWorld) + 1
  return `${world}-${stage}`
}
