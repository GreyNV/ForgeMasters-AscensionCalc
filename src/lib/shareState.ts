import type { PillarId, PlannerState, ResourceId } from '../types/planner'

const resourceKeys: ResourceId[] = ['tickets', 'eggshells', 'clockwinders']
const pillarKeys: PillarId[] = ['skills', 'pets', 'mounts']

export function serializePlannerState(state: PlannerState): string {
  const params = new URLSearchParams()

  params.set('pillar', state.pillar)
  params.set('asc', String(state.currentAscensionLevel))
  params.set('level', String(state.currentLevel))
  params.set('partial', String(state.currentPartialSummons))
  params.set('mode', state.targetMode)
  params.set('discount', String(state.discountPct))
  params.set('extra', String(state.extraDropPct))
  params.set('skill_dungeon', String(state.skillDungeonLevel))
  params.set('pet_dungeon', String(state.petDungeonLevel))
  params.set('ticket_bonus', String(state.skillTicketDungeonBonusPct))
  params.set('clan', state.clanTier)
  params.set('win', String(state.clanWinRate))
  params.set('league', state.rankedLeague)
  params.set('rank', state.rankBracket)
  params.set('rl', state.includeRankedLeague ? '1' : '0')
  params.set('milestones', state.includeMilestoneRewards ? '1' : '0')

  for (const pillar of pillarKeys) {
    const settings = state.pillarSettings[pillar]
    params.set(`${pillar}_asc`, String(settings.currentAscensionLevel))
    params.set(`${pillar}_level`, String(settings.currentLevel))
    params.set(`${pillar}_partial`, String(settings.currentPartialSummons))
    params.set(`${pillar}_discount`, String(settings.discountPct))
    params.set(`${pillar}_extra`, String(settings.extraDropPct))
    params.set(`${pillar}_ticket_bonus`, String(settings.skillTicketDungeonBonusPct))
  }

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
    pillarSettings: {
      skills: { ...fallback.pillarSettings.skills },
      pets: { ...fallback.pillarSettings.pets },
      mounts: { ...fallback.pillarSettings.mounts },
    },
  }

  nextState.pillar = (params.get('pillar') as PlannerState['pillar']) ?? nextState.pillar
  nextState.currentAscensionLevel = Number(
    params.get('asc') ?? nextState.currentAscensionLevel,
  ) as PlannerState['currentAscensionLevel']
  nextState.currentLevel = Number(params.get('level') ?? nextState.currentLevel)
  nextState.currentPartialSummons = Number(
    params.get('partial') ?? nextState.currentPartialSummons,
  )
  nextState.targetMode =
    (params.get('mode') as PlannerState['targetMode']) ?? nextState.targetMode
  nextState.discountPct = Number(params.get('discount') ?? nextState.discountPct)
  nextState.extraDropPct = Number(params.get('extra') ?? nextState.extraDropPct)
  const legacyDungeonLevel = Number(params.get('dungeon') ?? fallback.skillDungeonLevel)
  nextState.skillDungeonLevel = Number(
    params.get('skill_dungeon') ?? legacyDungeonLevel,
  )
  nextState.petDungeonLevel = Number(params.get('pet_dungeon') ?? legacyDungeonLevel)
  nextState.skillTicketDungeonBonusPct = Number(
    params.get('ticket_bonus') ?? nextState.skillTicketDungeonBonusPct,
  )
  nextState.clanTier = (params.get('clan') as PlannerState['clanTier']) ?? nextState.clanTier
  nextState.clanWinRate = Number(params.get('win') ?? nextState.clanWinRate)
  nextState.rankedLeague = params.get('league') ?? nextState.rankedLeague
  nextState.rankBracket = params.get('rank') ?? nextState.rankBracket
  nextState.includeRankedLeague = (params.get('rl') ?? '1') === '1'
  nextState.includeMilestoneRewards = (params.get('milestones') ?? '0') === '1'

  for (const pillar of pillarKeys) {
    nextState.pillarSettings[pillar].currentAscensionLevel = Number(
      params.get(`${pillar}_asc`) ?? nextState.pillarSettings[pillar].currentAscensionLevel,
    ) as PlannerState['currentAscensionLevel']
    nextState.pillarSettings[pillar].currentLevel = Number(
      params.get(`${pillar}_level`) ?? nextState.pillarSettings[pillar].currentLevel,
    )
    nextState.pillarSettings[pillar].currentPartialSummons = Number(
      params.get(`${pillar}_partial`) ?? nextState.pillarSettings[pillar].currentPartialSummons,
    )
    nextState.pillarSettings[pillar].discountPct = Number(
      params.get(`${pillar}_discount`) ?? nextState.pillarSettings[pillar].discountPct,
    )
    nextState.pillarSettings[pillar].extraDropPct = Number(
      params.get(`${pillar}_extra`) ?? nextState.pillarSettings[pillar].extraDropPct,
    )
    nextState.pillarSettings[pillar].skillTicketDungeonBonusPct = Number(
      params.get(`${pillar}_ticket_bonus`) ??
        nextState.pillarSettings[pillar].skillTicketDungeonBonusPct,
    )
  }

  const activePillarSettings = nextState.pillarSettings[nextState.pillar]
  nextState.currentAscensionLevel = activePillarSettings.currentAscensionLevel
  nextState.currentLevel = activePillarSettings.currentLevel
  nextState.currentPartialSummons = activePillarSettings.currentPartialSummons
  nextState.discountPct = activePillarSettings.discountPct
  nextState.extraDropPct = activePillarSettings.extraDropPct
  nextState.skillTicketDungeonBonusPct = activePillarSettings.skillTicketDungeonBonusPct

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
