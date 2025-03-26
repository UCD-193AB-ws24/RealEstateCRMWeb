"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteLeadButtonProps {
  leadId: number
  leadName: string
}

export default function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDelete = async () => {  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/${leadId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete lead")
      }

      setIsDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Failed to delete lead:", error)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lead &quot;{leadName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 