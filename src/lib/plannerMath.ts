import { appConfig, getVisibleResourceIds } from '../data'
import { formatEta, labelList } from './formatting'
import { getTotalIncome, getTimeToTarget } from './incomeMath'
import { applyModifiers } from './modifierMath'
import { createEmptyResourceMap, mapResources } from './resourceMath'
import { getBaseRequirement, getPillarProgression } from './summonMath'
import type { PlannerResult, PlannerState } from '../types/planner'

const MAX_ASCENSION_LEVEL = 4

function getActiveRequirementModifiers(state: PlannerState): {
  discountPct: number
  extraDropPct: number
} {
  if (state.pillar === 'skills') {
    return {
      discountPct: state.discountPct,
      extraDropPct: 0,
    }
  }

  if (state.pillar === 'pets') {
    return {
      discountPct: 0,
      extraDropPct: state.extraDropPct,
    }
  }

  return {
    discountPct: state.discountPct,
    extraDropPct: state.extraDropPct,
  }
}

function normalizeAscensionLevel(value: number): 1 | 2 | 3 | 4 {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.min(MAX_ASCENSION_LEVEL, Math.max(1, Math.floor(value))) as 1 | 2 | 3 | 4
}

function addExpectedRarityDrops(
  totals: Record<string, number>,
  rarityOdds: Record<string, number>,
  summonsSpent: number,
) {
  if (summonsSpent <= 0) {
    return
  }

  for (const [rarity, chance] of Object.entries(rarityOdds)) {
    if (chance <= 0) {
      continue
    }

    totals[rarity] = (totals[rarity] ?? 0) + summonsSpent * (chance / 100)
  }
}

function getLandingProjection(
  state: PlannerState,
  modifiers: { discountPct: number; extraDropPct: number },
): Pick<
  PlannerResult,
  | 'landingLevel'
  | 'landingAscensionLevel'
  | 'landingPartialSummons'
  | 'landingTotalSummonsSpent'
  | 'landingRarityEstimates'
  | 'landingOdds'
> {
  const progression = getPillarProgression(state.pillar)
  const currentOwned = state.currentResources[progression.primaryResource]
  const maxSummonLevel = (progression.levels.at(-1)?.level ?? 99) + 1
  let spendableResource = currentOwned
  let landingAscensionLevel = normalizeAscensionLevel(state.currentAscensionLevel)
  let landingLevel = state.currentLevel
  let landingPartialSummons = state.currentPartialSummons
  let landingTotalSummonsSpent = 0
  const landingRarityEstimates: Record<string, number> = {}

  while (spendableResource > 0) {
    if (landingLevel >= maxSummonLevel) {
      if (landingAscensionLevel >= MAX_ASCENSION_LEVEL) {
        landingLevel = maxSummonLevel
        landingPartialSummons = 0
        break
      }

      landingAscensionLevel = normalizeAscensionLevel(landingAscensionLevel + 1)
      landingLevel = 1
      landingPartialSummons = 0
      continue
    }

    const levelEntry = progression.levels.find((entry) => entry.level === landingLevel)

    if (!levelEntry) {
      break
    }

    const completedRatio =
      landingPartialSummons > 0
        ? Math.min(landingPartialSummons / levelEntry.summonsRequired, 1)
        : 0
    const remainingSummons = Math.max(0, levelEntry.summonsRequired - landingPartialSummons)
    const remainingBaseCost = Math.ceil(levelEntry.costPerLevel * (1 - completedRatio))
    const adjustedLevelCost = applyModifiers(
      remainingBaseCost,
      modifiers.discountPct,
      modifiers.extraDropPct,
    ).adjustedAmount

    if (spendableResource >= adjustedLevelCost) {
      spendableResource -= adjustedLevelCost
      landingTotalSummonsSpent += remainingSummons
      addExpectedRarityDrops(landingRarityEstimates, levelEntry.rarityOdds, remainingSummons)
      landingLevel += 1
      landingPartialSummons = 0
      continue
    }

    if (adjustedLevelCost > 0 && spendableResource > 0) {
      const partialSummonsSpent = Math.floor((spendableResource / adjustedLevelCost) * remainingSummons)
      landingPartialSummons = Math.min(
        levelEntry.summonsRequired,
        landingPartialSummons + partialSummonsSpent,
      )
      landingTotalSummonsSpent += partialSummonsSpent
      addExpectedRarityDrops(landingRarityEstimates, levelEntry.rarityOdds, partialSummonsSpent)
    }
    break
  }

  const cappedLandingLevel = Math.min(landingLevel, maxSummonLevel)
  const oddsLevel =
    progression.levels.find((entry) => entry.level === Math.min(cappedLandingLevel, maxSummonLevel - 1)) ??
    progression.levels.at(-1) ??
    progression.levels[0]

  return {
    landingLevel: cappedLandingLevel,
    landingAscensionLevel,
    landingPartialSummons: cappedLandingLevel >= maxSummonLevel ? 0 : landingPartialSummons,
    landingTotalSummonsSpent,
    landingRarityEstimates,
    landingOdds: oddsLevel?.rarityOdds ?? {},
  }
}

export function getPlannerStateForPillar(state: PlannerState, pillar = state.pillar): PlannerState {
  const scopedSettings = state.pillarSettings[pillar]

  return {
    ...state,
    pillar,
    currentAscensionLevel: normalizeAscensionLevel(scopedSettings.currentAscensionLevel),
    currentLevel: scopedSettings.currentLevel,
    currentPartialSummons: scopedSettings.currentPartialSummons,
    discountPct: scopedSettings.discountPct,
    extraDropPct: scopedSettings.extraDropPct,
    skillTicketDungeonBonusPct: scopedSettings.skillTicketDungeonBonusPct,
  }
}

export function getPlannerResult(state: PlannerState): PlannerResult {
  const requirement = getBaseRequirement({
    pillar: state.pillar,
    currentLevel: state.currentLevel,
    targetLevel: state.targetLevel,
    currentPartialSummons: state.currentPartialSummons,
    targetMode: state.targetMode,
  })

  const totalIncome = getTotalIncome(state)
  const primaryResource = appConfig.pillars.find((pillar) => pillar.id === state.pillar)!
    .primaryResource
  const visibleResourceIds = getVisibleResourceIds(state.pillar)
  const targetModeLabel =
    appConfig.targetModes.find((mode) => mode.id === state.targetMode)?.label.toLowerCase() ??
    'selected ascension'
  const requirementModifiers = getActiveRequirementModifiers(state)
  const landingProjection = getLandingProjection(state, requirementModifiers)

  const adjustedRequirement = createEmptyResourceMap()
  let effectiveFinalDiscount = 0

  for (const resource of visibleResourceIds) {
    const shouldModify = resource === primaryResource
    const modifier = applyModifiers(
      requirement.totalCosts[resource],
      shouldModify ? requirementModifiers.discountPct : 0,
      shouldModify ? requirementModifiers.extraDropPct : 0,
    )
    adjustedRequirement[resource] = modifier.adjustedAmount
    if (resource === primaryResource) {
      effectiveFinalDiscount = modifier.effectiveFinalDiscount
    }
  }

  const resourceBreakdown = visibleResourceIds.map((resource) => {
    const ascendRequired = requirement.ascendCosts[resource]
    const rarityBufferRequired = requirement.rarityBufferCosts[resource]
    const totalRequired = requirement.totalCosts[resource]
    const adjustedTotalRequired = adjustedRequirement[resource]
    const currentOwned = state.currentResources[resource]
    const remaining = Math.max(0, adjustedTotalRequired - currentOwned)
    const dailyIncome = totalIncome.totalDailyIncome[resource]
    const daysToTarget = getTimeToTarget(
      remaining,
      dailyIncome,
      totalIncome.breakdown,
      resource,
    )

    return {
      resource,
      ascendRequired,
      rarityBufferRequired,
      totalRequired,
      adjustedTotalRequired,
      currentOwned,
      remaining,
      dailyIncome,
      daysToTarget,
      isRelevant: adjustedTotalRequired > 0 || currentOwned > 0 || dailyIncome > 0,
    }
  })

  const relevantRows = resourceBreakdown.filter((row) => row.isRelevant)
  const bottleneck = relevantRows
    .filter((row) => row.remaining > 0)
    .sort((left, right) => right.daysToTarget - left.daysToTarget)[0]

  let readinessStatus: PlannerResult['readinessStatus'] = 'Ready Now'
  if (relevantRows.some((row) => row.remaining > 0 && !Number.isFinite(row.daysToTarget))) {
    readinessStatus = 'Income Data Incomplete'
  } else if (relevantRows.some((row) => row.daysToTarget > 30)) {
    readinessStatus = 'Missing Key Resources'
  } else if (relevantRows.some((row) => row.daysToTarget > 0)) {
    readinessStatus = 'Nearly Ready'
  }

  const assumptionSet = Array.from(new Set(totalIncome.assumptions.concat(appConfig.assumptionNotices)))
  const remainingMap = mapResources(adjustedRequirement, (value, resource) =>
    Math.max(0, value - state.currentResources[resource]),
  )
  const summarySentence =
    readinessStatus === 'Ready Now'
      ? 'You have enough stock on hand to ascend with the current settings.'
      : `You still need ${labelList(
          relevantRows.map((row) => [row.resource, row.remaining]),
        )}. At your current yields you are about ${formatEta(
          bottleneck?.daysToTarget ?? Number.POSITIVE_INFINITY,
        )} away from ${targetModeLabel}.`
  const pillarLabel =
    appConfig.pillars.find((pillar) => pillar.id === state.pillar)?.label ?? state.pillar
  const materialLabel =
    appConfig.resources.find((resource) => resource.id === primaryResource)?.label ??
    primaryResource
  const copySummary =
    readinessStatus === 'Ready Now'
      ? `${pillarLabel} can ascend now. No additional ${materialLabel.toLowerCase()} needed.`
      : `${formatEta(
          bottleneck?.daysToTarget ?? Number.POSITIVE_INFINITY,
        )} to ascend ${pillarLabel}. ${labelList([[primaryResource, remainingMap[primaryResource]]])} still needed. Open shared planner:`

  return {
    pillar: state.pillar,
    targetMode: state.targetMode,
    primaryResource,
    resourceBreakdown,
    incomeBreakdown: totalIncome.breakdown,
    currentAscensionLevel: normalizeAscensionLevel(state.currentAscensionLevel),
    currentLevel: state.currentLevel,
    targetLevel: state.targetLevel,
    landingLevel: landingProjection.landingLevel,
    landingAscensionLevel: landingProjection.landingAscensionLevel,
    landingPartialSummons: landingProjection.landingPartialSummons,
    landingTotalSummonsSpent: landingProjection.landingTotalSummonsSpent,
    landingRarityEstimates: landingProjection.landingRarityEstimates,
    landingOdds: landingProjection.landingOdds,
    ascendRequirement: requirement.ascendCosts,
    rarityBufferRequirement: requirement.rarityBufferCosts,
    baseRequirement: requirement.totalCosts,
    adjustedRequirement,
    remaining: remainingMap,
    bottleneckResource: bottleneck?.resource ?? null,
    bottleneckDays: bottleneck?.daysToTarget ?? 0,
    readinessStatus,
    summarySentence,
    copySummary,
    effectiveFinalDiscount,
    assumptions: assumptionSet,
  }
}

export function getPlannerResultsByPillar(state: PlannerState): PlannerResult[] {
  return appConfig.pillars.map((pillar) =>
    getPlannerResult(getPlannerStateForPillar(state, pillar.id)),
  )
}
