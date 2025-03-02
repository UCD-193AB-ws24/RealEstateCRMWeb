export default function StatusBadge({ status }: { status: string }) {
    const getStatusStyles = (status: string) => {
      switch (status.toLowerCase()) {
        case "new":
          return "bg-blue-50 text-blue-700 border-blue-100"
        case "contacted":
          return "bg-purple-50 text-purple-700 border-purple-100"
        case "qualified":
          return "bg-green-50 text-green-700 border-green-100"
        case "proposal":
          return "bg-amber-50 text-amber-700 border-amber-100"
        case "closed":
          return "bg-emerald-50 text-emerald-700 border-emerald-100"
        case "lost":
          return "bg-red-50 text-red-700 border-red-100"
        default:
          return "bg-gray-50 text-gray-700 border-gray-100"
      }
    }
  
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyles(status)}`}>{status}</span>
    )
  }
  
  