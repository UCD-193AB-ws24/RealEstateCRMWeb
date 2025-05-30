"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import EditLeadModal from "./EditLeadModal"
import DeleteLeadButton from "./DeleteLeadButton"
import type { Lead } from "./types"
import { Eye } from "lucide-react"

interface LeadActionsProps {
  lead: Lead
  variant: "card" | "table"
}

export default function LeadActions({ lead, variant }: LeadActionsProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (variant === "table") {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="flex text-primary hover:text-primary/80 hover:underline"
          onClick={() => setIsEditing(true)}
        >
          View Details
        </Button>
        <EditLeadModal
          isOpen={isEditing}
          onCloseAction={() => setIsEditing(false)}
          lead={lead}
        />
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline"
        onClick={() => setIsEditing(true)}
      >
        <Eye className="h-4 w-4" />
        View Details
      </Button>
      <DeleteLeadButton leadId={lead.id} />
      <EditLeadModal
        isOpen={isEditing}
        onCloseAction={() => setIsEditing(false)}
        lead={lead}
      />
    </div>
  )
} 