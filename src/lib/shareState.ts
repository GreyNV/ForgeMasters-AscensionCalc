import type { PlannerState, ResourceId } from '../types/planner'

const resourceKeys: ResourceId[] = ['tickets', 'eggshells', 'clockwinders']

export function serializePlannerState(state: PlannerState): string {
  const params = new URLSearchParams()

  params.set('pillar', state.pillar)
  params.set('level', String(state.currentLevel))
  params.set('partial', String(state.currentPartialSummons))
  params.set('mode', state.targetMode)
  params.set('discount', String(state.discountPct))
  params.set('extra', String(state.extraDropPct))
  params.set('dungeon', String(state.dungeonLevel))
  params.set('clan', state.clanTier)
  params.set('win', String(state.clanWinRate))
  params.set('league', state.rankedLeague)
  params.set('rank', state.rankBracket)
  params.set('rl', state.includeRankedLeague ? '1' : '0')
  params.set('milestones', state.includeMilestoneRewards ? '1' : '0')

  for (const resource of resourceKeys) {
    params.set(`own_${resource}`, String(state.currentResources[resource] ?? 0))
    params.set(`daily_${resource}`, String(state.manualDailyIncome[resource] ?? 0))
  }

  return params.toString()
}

export function deserializePlannerState(
  search: string,
  fallback: PlannerState,
): PlannerState | null {
  const params = new URLSearchParams(search)
  if (!params.toString()) {
    return null
  }

  const nextState: PlannerState = {
    ...fallback,
    currentResources: { ...fallback.currentResources },
    manualDailyIncome: { ...fallback.manualDailyIncome },
  }

  nextState.pillar = (params.get('pillar') as PlannerState['pillar']) ?? nextState.pillar
  nextState.currentLevel = Number(params.get('level') ?? nextState.currentLevel)
  nextState.currentPartialSummons = Number(
    params.get('partial') ?? nextState.currentPartialSummons,
  )
  nextState.targetMode =
    (params.get('mode') as PlannerState['targetMode']) ?? nextState.targetMode
  nextState.discountPct = Number(params.get('discount') ?? nextState.discountPct)
  nextState.extraDropPct = Number(params.get('extra') ?? nextState.extraDropPct)
  nextState.dungeonLevel = Number(params.get('dungeon') ?? nextState.dungeonLevel)
  nextState.clanTier = (params.get('clan') as PlannerState['clanTier']) ?? nextState.clanTier
  nextState.clanWinRate = Number(params.get('win') ?? nextState.clanWinRate)
  nextState.rankedLeague = params.get('league') ?? nextState.rankedLeague
  nextState.rankBracket = params.get('rank') ?? nextState.rankBracket
  nextState.includeRankedLeague = (params.get('rl') ?? '1') === '1'
  nextState.includeMilestoneRewards = (params.get('milestones') ?? '0') === '1'

  for (const resource of resourceKeys) {
    nextState.currentResources[resource] = Number(
      params.get(`own_${resource}`) ?? nextState.currentResources[resource],
    )
    nextState.manualDailyIncome[resource] = Number(
      params.get(`daily_${resource}`) ?? nextState.manualDailyIncome[resource],
    )
  }

  return nextState
}
