"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import NewLeadModal from "./NewLeadModal"

interface NewLeadButtonProps {
  userId: string
}

export default function NewLeadButton({ userId }: NewLeadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: session } = useSession()

  const handleSubmit = async (data: any) => {
    console.log(data)
    data.userId = session?.user?.id
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
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
} 