import clockwindersIcon from '../assets/clockwinders.png'
import eggshellsIcon from '../assets/eggshells.png'
import skillTicketsIcon from '../assets/skilltickets.png'
import type { ResourceId } from '../types/planner'

const resourceIconMap: Record<ResourceId, string> = {
  gold: skillTicketsIcon,
  tickets: skillTicketsIcon,
  eggshells: eggshellsIcon,
  clockwinders: clockwindersIcon,
}

export function ResourceIcon({
  resource,
  className = 'h-5 w-5',
}: {
  resource: ResourceId
  className?: string
}) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      <img
        src={resourceIconMap[resource]}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
      />
    </span>
  )
}
