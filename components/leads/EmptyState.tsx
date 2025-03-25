"use client"

import { AlertCircle } from "lucide-react"
import NewLeadButton from "./NewLeadButton"

interface EmptyStateProps {
  userId: string
}

export default function EmptyState({ userId }: EmptyStateProps) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center max-w-md mx-auto">
      <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-10 w-10 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">No leads found</h2>
      <p className="text-gray-500 mb-6">You don&apos;t have any leads yet. Start adding new leads to grow your business.</p>
      <NewLeadButton userId={userId} />
    </div>
  )
} 