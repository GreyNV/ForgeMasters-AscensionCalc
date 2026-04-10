import { dungeonYieldConfig } from '../data'
import { getClanWarExpectedIncome, getMilestoneIncome, getRankedLeagueIncome } from './rewardMath'
import { addResourceMaps, createEmptyResourceMap } from './resourceMath'
import type { IncomeBreakdownRow, PlannerState, ResourceMap } from '../types/planner'

export function getDungeonIncome(dungeonLevel: number): {
  dailyReward: ResourceMap
  assumptions: string[]
} {
  const match =
    dungeonYieldConfig.levels.find((entry) => entry.dungeonLevel === dungeonLevel) ??
    dungeonYieldConfig.levels[0]

  return {
    dailyReward: match?.dailyYields ?? createEmptyResourceMap(),
    assumptions: [dungeonYieldConfig.note],
  }
}

export function getTotalIncome(state: PlannerState): {
  totalDailyIncome: ResourceMap
  breakdown: IncomeBreakdownRow[]
  assumptions: string[]
} {
  const dungeon = getDungeonIncome(state.dungeonLevel)
  const clanWar = getClanWarExpectedIncome({
    clanTier: state.clanTier,
    winRate: state.clanWinRate,
  })
  const ranked = getRankedLeagueIncome({
    league: state.rankedLeague,
    rankBracket: state.rankBracket,
    includeRankedLeague: state.includeRankedLeague,
  })
  const milestone = getMilestoneIncome(state.includeMilestoneRewards)

  const manual = {
    dailyReward: state.manualDailyIncome,
    assumptions: [],
  }

  const breakdown: IncomeBreakdownRow[] = [
    { source: `Dungeon L${state.dungeonLevel}`, values: dungeon.dailyReward, isEstimated: true },
    { source: `Clan War Tier ${state.clanTier}`, values: clanWar.dailyReward, isEstimated: true },
    { source: 'Ranked League', values: ranked.dailyReward, isEstimated: true },
    { source: 'Clan Milestones', values: milestone.dailyReward, isEstimated: true },
    { source: 'Manual Override', values: manual.dailyReward },
  ]

  return {
    totalDailyIncome: addResourceMaps(
      dungeon.dailyReward,
      clanWar.dailyReward,
      ranked.dailyReward,
      milestone.dailyReward,
      manual.dailyReward,
    ),
    breakdown,
    assumptions: [
      ...dungeon.assumptions,
      ...clanWar.assumptions,
      ...ranked.assumptions,
      ...milestone.assumptions,
    ],
  }
}

export function getTimeToTarget(remaining: number, dailyIncome: number): number {
  if (remaining <= 0) {
    return 0
  }

  if (dailyIncome <= 0) {
    return Number.POSITIVE_INFINITY
  }

  return remaining / dailyIncome
}

