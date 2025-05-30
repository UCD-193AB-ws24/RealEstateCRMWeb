"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import NewLeadModal from "./NewLeadModal"
import { US_STATES } from "./constants"

interface NewLeadButtonProps {
  userId: string
}

export default function NewLeadButton({ userId }: NewLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  interface LeadData {
    name: string
    address: string
    city: string
    state: string
    zip: string
    owner: string
    notes: string
    status: string
    images: string[]
    userId: string
  }

  const handleSubmit = async (data: LeadData) => {
    console.log(data)
    data.userId = userId
    console.log(data)
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error("Failed to create lead")
    }

    // Refresh the page to show the new lead
    window.location.reload()
  }


  return (
    <>
      <Button
        variant="default"
        className="bg-[#7C3AED] hover:bg-[#6b31ce] text-white"
        onClick={() => setIsOpen(true)}
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <NewLeadModal
        isOpen={isOpen}
        onCloseAction={() => setIsOpen(false)}
        onSubmitAction={handleSubmit}
        userId={userId}
        states={US_STATES}
      />
    </>
  )
} 