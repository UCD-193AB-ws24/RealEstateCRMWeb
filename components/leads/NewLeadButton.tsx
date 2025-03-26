"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import NewLeadModal from "./NewLeadModal"

interface NewLeadButtonProps {
  userId: string
}

export default function NewLeadButton({ userId }: NewLeadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Lead
      </Button>

      <NewLeadModal
        isOpen={isModalOpen}
        onCloseAction={() => setIsModalOpen(false)}
        onSubmitAction={handleSubmit}
      />
    </>
  )
} 