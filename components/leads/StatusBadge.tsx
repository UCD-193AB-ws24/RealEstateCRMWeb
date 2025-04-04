import { LEAD_STATUSES } from "./constants"

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = LEAD_STATUSES.find(s => s.value === status) || LEAD_STATUSES[0]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusConfig.color}`}>
      {statusConfig.label}
    </span>
  )
}
  
  