import type { ResourceId, ResourceMap } from '../types/planner'

export function createEmptyResourceMap(): ResourceMap {
  return {
    gold: 0,
    tickets: 0,
    eggshells: 0,
    clockwinders: 0,
  }
}

export function addResourceMaps(...maps: Partial<ResourceMap>[]): ResourceMap {
  const result = createEmptyResourceMap()

  for (const map of maps) {
    for (const resource of Object.keys(result) as ResourceId[]) {
      result[resource] += map[resource] ?? 0
    }
  }

  return result
}

export function subtractResourceMaps(
  left: Partial<ResourceMap>,
  right: Partial<ResourceMap>,
): ResourceMap {
  const result = createEmptyResourceMap()

  for (const resource of Object.keys(result) as ResourceId[]) {
    result[resource] = (left[resource] ?? 0) - (right[resource] ?? 0)
  }

  return result
}

export function mapResources(
  map: Partial<ResourceMap>,
  fn: (value: number, resource: ResourceId) => number,
): ResourceMap {
  const result = createEmptyResourceMap()

  for (const resource of Object.keys(result) as ResourceId[]) {
    result[resource] = fn(map[resource] ?? 0, resource)
  }

  return result
}

