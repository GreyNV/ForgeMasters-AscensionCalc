import { clanWarRewards, individualClanRewards, rankedLeagueRewards } from '../data'
import { createEmptyResourceMap, mapResources } from './resourceMath'
import type { ClanTier, ResourceMap } from '../types/planner'

export function getClanWarExpectedIncome(params: {
  clanTier: ClanTier
  winRate: number
}): {
  perCycleReward: ResourceMap
  dailyReward: ResourceMap
  assumptions: string[]
} {
  const tierRewards = clanWarRewards.tiers[params.clanTier]

  const perCycleReward = mapResources(createEmptyResourceMap(), (_, resource) => {
    const win = tierRewards.win[resource]
    const loss = tierRewards.loss[resource]
    return win * params.winRate + loss * (1 - params.winRate)
  })

  return {
    perCycleReward,
    dailyReward: mapResources(perCycleReward, (value) => value / clanWarRewards.periodDays),
    assumptions: clanWarRewards.assumptions,
  }
}

export function getRankedLeagueIncome(params: {
  league: string
  rankBracket: string
  includeRankedLeague: boolean
}): {
  dailyReward: ResourceMap
  assumptions: string[]
} {
  if (!params.includeRankedLeague) {
    return {
      dailyReward: createEmptyResourceMap(),
      assumptions: [],
    }
  }

  const league = rankedLeagueRewards.leagues[params.league]
  const entry = league?.entries.find((item) => item.rankBracket === params.rankBracket)

  if (!entry) {
    return {
      dailyReward: createEmptyResourceMap(),
      assumptions: rankedLeagueRewards.assumptions,
    }
  }

  return {
    dailyReward: mapResources(entry.rewards, (value) => value / rankedLeagueRewards.periodDays),
    assumptions: rankedLeagueRewards.assumptions,
  }
}

export function getMilestoneIncome(includeMilestoneRewards: boolean): {
  dailyReward: ResourceMap
  assumptions: string[]
} {
  if (!includeMilestoneRewards) {
    return {
      dailyReward: createEmptyResourceMap(),
      assumptions: [],
    }
  }

  if (individualClanRewards.milestones.length === 0) {
    return {
      dailyReward: createEmptyResourceMap(),
      assumptions: individualClanRewards.assumptions,
    }
  }

  return {
    dailyReward: mapResources(
      individualClanRewards.milestones.reduce(
        (total, milestone) => ({
          gold: total.gold + milestone.rewards.gold,
          tickets: total.tickets + milestone.rewards.tickets,
          eggshells: total.eggshells + milestone.rewards.eggshells,
          clockwinders: total.clockwinders + milestone.rewards.clockwinders,
        }),
        createEmptyResourceMap(),
      ),
      (value) => value / individualClanRewards.periodDays,
    ),
    assumptions: individualClanRewards.assumptions,
  }
}
