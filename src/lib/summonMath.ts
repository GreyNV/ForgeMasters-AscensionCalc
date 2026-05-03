import { pillarProgressions } from '../data'
import { addResourceMaps, createEmptyResourceMap } from './resourceMath'
import type {
  LevelProgression,
  PillarId,
  RequirementResult,
  ResourceMap,
  TargetModeId,
} from '../types/planner'

export function getPillarProgression(pillar: PillarId) {
  return pillarProgressions[pillar]
}

export function getSummonBatchSize(pillar: PillarId) {
  return pillar === 'skills' ? 5 : 1
}

export function normalizeSummonCount(pillar: PillarId, summons: number) {
  const batchSize = getSummonBatchSize(pillar)
  if (!Number.isFinite(summons) || summons <= 0) {
    return 0
  }

  return Math.floor(summons / batchSize) * batchSize
}

export function normalizePartialSummons(
  pillar: PillarId,
  levelEntry: LevelProgression | undefined,
  currentPartialSummons: number,
) {
  if (!levelEntry) {
    return 0
  }

  return Math.min(
    levelEntry.summonsRequired,
    normalizeSummonCount(pillar, currentPartialSummons),
  )
}

const RECOVERY_THRESHOLD = 5

function getRecoveryReserve(
  pillar: PillarId,
  targetMode: TargetModeId,
): Partial<ResourceMap> {
  if (targetMode === 'minimumAscend') {
    return {}
  }

  const progression = getPillarProgression(pillar)
  const oddsKey = targetMode === 'safeAscend' ? 'epic' : 'legendary'
  const recoveryLevel = progression.levels.find(
    (entry) => (entry.rarityOdds[oddsKey] ?? 0) >= RECOVERY_THRESHOLD,
  )

  if (!recoveryLevel) {
    return {}
  }

  const reserve = progression.levels
    .filter((entry) => entry.level >= 1 && entry.level < recoveryLevel.level)
    .reduce((sum, entry) => sum + entry.costPerLevel, 0)

  return {
    [progression.primaryResource]: Math.max(0, reserve),
  } as Partial<ResourceMap>
}

function getModeAdjustment(
  pillar: PillarId,
  targetMode: TargetModeId,
  targetLevel: number,
): Partial<ResourceMap> {
  if (targetMode === 'minimumAscend' || targetLevel !== 100) {
    return {}
  }

  return getRecoveryReserve(pillar, targetMode)
}

export function getAscensionReserve(pillar: PillarId, targetMode: TargetModeId): Partial<ResourceMap> {
  return getModeAdjustment(pillar, targetMode, 100)
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
      const normalizedPartialSummons = normalizePartialSummons(
        pillar,
        entry,
        currentPartialSummons,
      )
      const completedRatio = Math.min(normalizedPartialSummons / entry.summonsRequired, 1)
      summonsNeeded = Math.max(0, entry.summonsRequired - normalizedPartialSummons)
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
