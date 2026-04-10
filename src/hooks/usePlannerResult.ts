import { usePlannerStore } from '../store/plannerStore'
import { getPlannerResult } from '../lib/plannerMath'

export function usePlannerResult() {
  const state = usePlannerStore()
  return getPlannerResult(state)
}
