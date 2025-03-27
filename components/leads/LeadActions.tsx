"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import DeleteLeadButton from "./DeleteLeadButton"
import EditLeadModal from "./EditLeadModal"
import type { Lead } from "./types"

interface LeadActionsProps {
  lead: Lead
  variant?: "card" | "table"
}

export default function LeadActions({ lead, variant = "card" }: LeadActionsProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size={variant === "card" ? "sm" : "default"}
          className={`text-xs text-primary hover:text-primary/80 font-medium ${variant === "table" ? "px-3" : ""}`}
          onClick={() => setIsEditing(true)}
        >
          View Details
        </Button>
        <DeleteLeadButton
          leadId={lead.id}
          leadName={lead.name}
        />
      </div>

      {isEditing && (
        <EditLeadModal
          isOpen={isEditing}
          onCloseAction={() => setIsEditing(false)}
          lead={lead}
        />
      )}
    </>
  )
} 