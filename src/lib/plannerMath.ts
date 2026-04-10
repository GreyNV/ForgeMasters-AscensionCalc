import { appConfig, resourceIds } from '../data'
import { formatEta, labelList } from './formatting'
import { getTotalIncome, getTimeToTarget } from './incomeMath'
import { applyModifiers } from './modifierMath'
import { createEmptyResourceMap, mapResources } from './resourceMath'
import { getBaseRequirement } from './summonMath'
import type { PlannerResult, PlannerState } from '../types/planner'

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

  const adjustedRequirement = createEmptyResourceMap()
  let effectiveFinalDiscount = 0

  for (const resource of resourceIds) {
    const shouldModify = resource === primaryResource
    const modifier = applyModifiers(
      requirement.totalCosts[resource],
      shouldModify ? state.discountPct : 0,
      shouldModify ? state.extraDropPct : 0,
    )
    adjustedRequirement[resource] = modifier.adjustedAmount
    if (resource === primaryResource) {
      effectiveFinalDiscount = modifier.effectiveFinalDiscount
    }
  }

  const resourceBreakdown = resourceIds.map((resource) => {
    const baseRequired = requirement.totalCosts[resource]
    const adjustedRequired = adjustedRequirement[resource]
    const currentOwned = state.currentResources[resource]
    const remaining = Math.max(0, adjustedRequired - currentOwned)
    const dailyIncome = totalIncome.totalDailyIncome[resource]
    const daysToTarget = getTimeToTarget(remaining, dailyIncome)

    return {
      resource,
      baseRequired,
      adjustedRequired,
      currentOwned,
      remaining,
      dailyIncome,
      daysToTarget,
      isRelevant: adjustedRequired > 0 || currentOwned > 0 || dailyIncome > 0,
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
        )}. At your current yields, the bottleneck is ${
          bottleneck?.resource ?? 'income setup'
        } and you are about ${formatEta(bottleneck?.daysToTarget ?? Number.POSITIVE_INFINITY)} away from ${
          state.targetMode === 'minimumAscend' ? 'minimum ascension' : 'safe ascension'
        }.`

  return {
    pillar: state.pillar,
    targetMode: state.targetMode,
    primaryResource,
    resourceBreakdown,
    incomeBreakdown: totalIncome.breakdown,
    baseRequirement: requirement.totalCosts,
    adjustedRequirement,
    remaining: remainingMap,
    bottleneckResource: bottleneck?.resource ?? null,
    bottleneckDays: bottleneck?.daysToTarget ?? 0,
    readinessStatus,
    summarySentence,
    effectiveFinalDiscount,
    assumptions: assumptionSet,
  }
}
