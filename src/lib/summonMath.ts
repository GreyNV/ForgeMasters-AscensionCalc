import { ascensionTargets, forgeProgression, pillarProgressions } from '../data'
import { addResourceMaps, createEmptyResourceMap } from './resourceMath'
import type {
  PillarId,
  RequirementResult,
  ResourceMap,
  ResourceId,
  TargetModeId,
} from '../types/planner'

export function getPillarProgression(pillar: PillarId) {
  return pillarProgressions[pillar]
}

function getForgeGoldRequirement(currentLevel: number, targetLevel: number) {
  return forgeProgression.levels
    .filter((entry) => entry.level >= currentLevel && entry.level < targetLevel)
    .reduce((total, entry) => total + entry.goldCost, 0)
}

function getModeAdjustment(
  pillar: PillarId,
  targetMode: TargetModeId,
  currentLevel: number,
  targetLevel: number,
): Partial<ResourceMap> {
  if (targetMode === 'minimumAscend' || targetLevel !== 100 || currentLevel >= 100) {
    return {}
  }

  const config = ascensionTargets.pillarTargets[pillar]
  const primaryResource = config.primaryResource as ResourceId
  const targetConfig = config[targetMode] as Partial<ResourceMap>
  const minimumConfig = config.minimumAscend as Partial<ResourceMap>
  const reserve =
    (targetConfig[primaryResource] ?? 0) - (minimumConfig[primaryResource] ?? 0)

  return {
    [primaryResource]: Math.max(0, reserve),
  } as Partial<ResourceMap>
}

export function getBaseRequirement(params: {
  pillar: PillarId
  currentLevel: number
  targetLevel: number
  currentPartialSummons?: number
  targetMode: TargetModeId
}): RequirementResult {
  const { pillar, currentLevel, targetLevel, currentPartialSummons = 0, targetMode } = params

  if (currentLevel >= targetLevel) {
    return {
      totalSummonsNeeded: 0,
      totalCosts: createEmptyResourceMap(),
      levelStart: currentLevel,
      levelEnd: targetLevel,
    }
  }

  const progression = getPillarProgression(pillar)
  const primaryResource = progression.primaryResource
  const relevantLevels = progression.levels.filter(
    (entry) => entry.level >= currentLevel && entry.level < targetLevel,
  )

  const requirement = createEmptyResourceMap()
  let totalSummonsNeeded = 0

  for (const entry of relevantLevels) {
    let summonsNeeded = entry.summonsRequired
    let levelCost = entry.costPerLevel

    if (entry.level === currentLevel && currentPartialSummons > 0) {
      const completedRatio = Math.min(currentPartialSummons / entry.summonsRequired, 1)
      summonsNeeded = Math.max(0, entry.summonsRequired - currentPartialSummons)
      levelCost = Math.ceil(entry.costPerLevel * (1 - completedRatio))
    }

    totalSummonsNeeded += summonsNeeded
    requirement[primaryResource] += levelCost
  }

  requirement.gold = getForgeGoldRequirement(currentLevel, targetLevel)

  return {
    totalSummonsNeeded,
    totalCosts: addResourceMaps(requirement, getModeAdjustment(pillar, targetMode, currentLevel, targetLevel)),
    levelStart: currentLevel,
    levelEnd: targetLevel,
  }
}
