import { dungeonYieldConfig, formatDungeonStage } from '../data'
import { getClanWarExpectedIncome, getMilestoneIncome, getRankedLeagueIncome } from './rewardMath'
import { addResourceMaps, createEmptyResourceMap, mapResources } from './resourceMath'
import { roundTo } from './rounding'
import type { IncomeBreakdownRow, PlannerState, ResourceId, ResourceMap } from '../types/planner'

export function getDungeonIncome(dungeonLevel: number): {
  dailyReward: ResourceMap
  assumptions: string[]
} {
  const baseIndex = dungeonYieldConfig.baseStage.stageIndex
  const anchorIndex = dungeonYieldConfig.anchorStage.stageIndex
  const { a, b, c } = dungeonYieldConfig.ticketFormula.coefficients
  const eggshellFormula = dungeonYieldConfig.eggshellFormula

  const dailyReward = mapResources(createEmptyResourceMap(), (_, resource) => {
    if (resource === 'tickets') {
      const perKey = Math.round(a * dungeonLevel * dungeonLevel + b * dungeonLevel + c)
      return Math.max(0, perKey * dungeonYieldConfig.keysPerDay)
    }

    if (resource === 'eggshells') {
      const perKey = Math.round(
        eggshellFormula.basePerKey +
          (dungeonLevel - baseIndex) * eggshellFormula.incrementPerStage,
      )
      return Math.max(0, perKey * dungeonYieldConfig.keysPerDay)
    }

    const base = dungeonYieldConfig.baseStage.dailyYields[resource]
    const increment = dungeonYieldConfig.perStageDailyIncrement[resource]
    return Math.max(0, Math.round(base + (dungeonLevel - baseIndex) * increment))
  })

  return {
    dailyReward,
    assumptions: [
      dungeonYieldConfig.note,
      `Skill ticket anchors: ${formatDungeonStage(dungeonYieldConfig.baseStage.stageIndex)} = ${dungeonYieldConfig.baseStage.dailyYields.tickets / dungeonYieldConfig.keysPerDay}/key, ${formatDungeonStage(dungeonYieldConfig.midStage.stageIndex)} = ${dungeonYieldConfig.midStage.dailyYields.tickets / dungeonYieldConfig.keysPerDay}/key, ${formatDungeonStage(anchorIndex)} = ${dungeonYieldConfig.anchorStage.dailyYields.tickets / dungeonYieldConfig.keysPerDay}/key.`,
      `Eggshell anchors: ${formatDungeonStage(dungeonYieldConfig.baseStage.stageIndex)} = ${dungeonYieldConfig.baseStage.dailyYields.eggshells}/day, ${formatDungeonStage(dungeonYieldConfig.midStage.stageIndex)} = ${dungeonYieldConfig.midStage.dailyYields.eggshells}/day, and ${formatDungeonStage(anchorIndex)} = ${dungeonYieldConfig.anchorStage.dailyYields.eggshells}/day.`,
    ],
  }
}

export function getTotalIncome(state: PlannerState): {
  totalDailyIncome: ResourceMap
  breakdown: IncomeBreakdownRow[]
  assumptions: string[]
} {
  const dungeon =
    state.pillar === 'mounts'
      ? {
          dailyReward: createEmptyResourceMap(),
          assumptions: ['Mounts do not use dungeon income, so clockwinders are sourced from weekly rewards and manual overrides only.'],
        }
      : getDungeonIncome(state.dungeonLevel)
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
    {
      source: state.pillar === 'mounts' ? 'Dungeon' : `Dungeon ${formatDungeonStage(state.dungeonLevel)}`,
      values: dungeon.dailyReward,
      periodDays: 1,
      isEstimated: true,
    },
    {
      source: `Clan War Tier ${state.clanTier}`,
      values: clanWar.dailyReward,
      periodDays: 7,
      isEstimated: true,
    },
    { source: 'Ranked League', values: ranked.dailyReward, periodDays: 7, isEstimated: true },
    { source: 'Clan Milestones', values: milestone.dailyReward, periodDays: 7, isEstimated: true },
    { source: 'Manual Override', values: manual.dailyReward, periodDays: 1 },
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

export function getTimeToTarget(
  remaining: number,
  dailyIncome: number,
  breakdown: IncomeBreakdownRow[],
  resource: ResourceId,
): number {
  if (remaining <= 0) {
    return 0
  }

  if (dailyIncome <= 0) {
    return Number.POSITIVE_INFINITY
  }

  let cumulative = 0
  for (let day = 1; day <= 3650; day += 1) {
    for (const row of breakdown) {
      if (row.periodDays === 1) {
        cumulative += row.values[resource]
      } else if (day % row.periodDays === 0) {
        cumulative += row.values[resource] * row.periodDays
      }
    }

    if (cumulative >= remaining) {
      return day
    }
  }

  return roundTo(remaining / dailyIncome, 1)
}
