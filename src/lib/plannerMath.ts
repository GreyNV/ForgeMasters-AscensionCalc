import { appConfig, getVisibleResourceIds } from '../data'
import { formatEta, labelList } from './formatting'
import { getTotalIncome, getTimeToTarget } from './incomeMath'
import { applyModifiers } from './modifierMath'
import { createEmptyResourceMap, mapResources } from './resourceMath'
import { getBaseRequirement } from './summonMath'
import type { PlannerResult, PlannerState } from '../types/planner'

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

export function getPlannerStateForPillar(state: PlannerState, pillar = state.pillar): PlannerState {
  const scopedSettings = state.pillarSettings[pillar]

  return {
    ...state,
    pillar,
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
