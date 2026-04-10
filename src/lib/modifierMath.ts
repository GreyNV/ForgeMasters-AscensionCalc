import { roundUp } from './rounding'
import type { ModifierResult } from '../types/planner'

export function applyModifiers(
  baseAmount: number,
  discountPct: number,
  extraDropPct: number,
): ModifierResult {
  const effectiveRequirementMultiplier = (1 - discountPct) / (1 + extraDropPct)
  const adjustedAmount = roundUp(baseAmount * effectiveRequirementMultiplier)
  const effectiveFinalDiscount = 1 - effectiveRequirementMultiplier

  return {
    adjustedAmount,
    effectiveFinalDiscount,
    effectiveRequirementMultiplier,
  }
}

