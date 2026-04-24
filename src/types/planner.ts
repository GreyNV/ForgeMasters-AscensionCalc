export type ResourceId = 'gold' | 'tickets' | 'eggshells' | 'clockwinders'
export type PillarId = 'skills' | 'pets' | 'mounts'
export type TargetModeId = 'minimumAscend' | 'safeAscend' | 'optimalReset'
export type ClanTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E'

export type ResourceMap = Record<ResourceId, number>
export type PillarScopedSettings = {
  currentAscensionLevel: 1 | 2 | 3 | 4
  currentLevel: number
  currentPartialSummons: number
  discountPct: number
  extraDropPct: number
  skillTicketDungeonBonusPct: number
}

export type LevelProgression = {
  level: number
  summonsRequired: number
  costPerLevel: number
  rarityOdds: Record<string, number>
}

export type PillarProgression = {
  pillar: PillarId
  sheetName: string
  primaryResource: ResourceId
  levels: LevelProgression[]
  summary?: {
    targetLevel: number
    totalSummonsToLevel100: number
    totalPrimaryResourceCost: number
  }
}

export type PillarTargetConfig = {
  primaryResource: ResourceId
  minimumAscend: Partial<ResourceMap>
  safeAscend: Partial<ResourceMap>
  optimalReset: Partial<ResourceMap>
  withMaxTech: Partial<ResourceMap>
  safeAscendWithMaxTech: Partial<ResourceMap>
  legendaryRecovery: {
    targetLevel: number
    legendaryPullChance: number
    reserveCost: number
    reserveCostWithMaxTech: number
  }
}

export type AppConfig = {
  resources: Array<{
    id: ResourceId
    label: string
    shortLabel: string
    tone: string
  }>
  pillars: Array<{
    id: PillarId
    label: string
    primaryResource: ResourceId
  }>
  targetModes: Array<{
    id: TargetModeId
    label: string
  }>
  defaults: {
    pillar: PillarId
    currentLevel: number
    targetLevel: number
    targetMode: TargetModeId
    discountPct: number
    extraDropPct: number
    skillDungeonLevel: number
    petDungeonLevel: number
    skillTicketDungeonBonusPct: number
    clanTier: ClanTier
    clanWinRate: number
    rankedLeague: string
    rankBracket: string
    includeRankedLeague: boolean
    includeMilestoneRewards: boolean
    currentResources: ResourceMap
    manualDailyIncome: ResourceMap
  }
  assumptionNotices: string[]
  sourceWorkbook: string
}

export type PlannerState = {
  pillar: PillarId
  currentAscensionLevel: 1 | 2 | 3 | 4
  currentLevel: number
  targetLevel: number
  currentPartialSummons: number
  targetMode: TargetModeId
  discountPct: number
  extraDropPct: number
  skillDungeonLevel: number
  petDungeonLevel: number
  skillTicketDungeonBonusPct: number
  clanTier: ClanTier
  clanWinRate: number
  rankedLeague: string
  rankBracket: string
  includeRankedLeague: boolean
  includeMilestoneRewards: boolean
  currentResources: ResourceMap
  manualDailyIncome: ResourceMap
  pillarSettings: Record<PillarId, PillarScopedSettings>
}

export type RequirementResult = {
  totalSummonsNeeded: number
  ascendCosts: ResourceMap
  rarityBufferCosts: ResourceMap
  totalCosts: ResourceMap
  levelStart: number
  levelEnd: number
}

export type ModifierResult = {
  adjustedAmount: number
  effectiveFinalDiscount: number
  effectiveRequirementMultiplier: number
}

export type IncomeBreakdownRow = {
  source: string
  values: ResourceMap
  periodDays: number
  isEstimated?: boolean
}

export type ResourceBreakdownRow = {
  resource: ResourceId
  ascendRequired: number
  rarityBufferRequired: number
  totalRequired: number
  adjustedTotalRequired: number
  currentOwned: number
  remaining: number
  dailyIncome: number
  daysToTarget: number
  isRelevant: boolean
}

export type PlannerResult = {
  pillar: PillarId
  targetMode: TargetModeId
  primaryResource: ResourceId
  resourceBreakdown: ResourceBreakdownRow[]
  incomeBreakdown: IncomeBreakdownRow[]
  currentAscensionLevel: 1 | 2 | 3 | 4
  currentLevel: number
  targetLevel: number
  landingLevel: number
  landingAscensionLevel: 1 | 2 | 3 | 4
  landingPartialSummons: number
  landingOdds: Record<string, number>
  ascendRequirement: ResourceMap
  rarityBufferRequirement: ResourceMap
  baseRequirement: ResourceMap
  adjustedRequirement: ResourceMap
  remaining: ResourceMap
  bottleneckResource: ResourceId | null
  bottleneckDays: number
  readinessStatus: 'Ready Now' | 'Nearly Ready' | 'Missing Key Resources' | 'Income Data Incomplete'
  summarySentence: string
  copySummary: string
  effectiveFinalDiscount: number
  assumptions: string[]
}
