import { ascensionTargets, pillarProgressions } from '../data'
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

function getModeAdjustment(
  pillar: PillarId,
  targetMode: TargetModeId,
  targetLevel: number,
): Partial<ResourceMap> {
  if (targetMode === 'minimumAscend' || targetLevel !== 100) {
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
    // Ascend costs are zero (already at target level), but the rarity buffer still
    // applies — a player who reached level 100 on the minimum ticket path may still
    // need extra resources for their chosen safe/optimal ascend mode.
    const rarityBufferCosts = addResourceMaps(
      createEmptyResourceMap(),
      getModeAdjustment(pillar, targetMode, targetLevel),
    )
    return {
      totalSummonsNeeded: 0,
      ascendCosts: createEmptyResourceMap(),
      rarityBufferCosts,
      totalCosts: rarityBufferCosts,
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

  const rarityBufferCosts = addResourceMaps(
    createEmptyResourceMap(),
    getModeAdjustment(pillar, targetMode, targetLevel),
  )

  return {
    totalSummonsNeeded,
    ascendCosts: requirement,
    rarityBufferCosts,
    totalCosts: addResourceMaps(requirement, rarityBufferCosts),
    levelStart: currentLevel,
    levelEnd: targetLevel,
  }
}
