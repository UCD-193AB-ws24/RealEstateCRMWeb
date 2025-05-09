"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { LEAD_STATUSES, US_STATES } from "./constants"
import type { Lead } from "./types"

interface EditLeadModalProps {
  isOpen: boolean
  onCloseAction: () => void
  lead: Lead
}

export default function EditLeadModal({ isOpen, onCloseAction, lead }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead>(lead)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData(lead)
  }, [lead])

  async function updateLead() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/${lead.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      throw new Error("Failed to update lead")
    }
    window.location.reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateLead()
      onCloseAction()
    } catch (error) {
      console.error("Failed to update lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    newImages.push(...formData.images || [])
    for (let i = 0; i < files.length && i + formData.images?.length <= 10; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        newImages.push(reader.result as string)
      }
      
    }
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="edit-lead-description">
        <DialogHeader>
          <DialogTitle>Edit Lead Details</DialogTitle>
          <DialogDescription>Update the details of the selected lead below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "lead" | "contact" | "offer" | "sale" }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                required
                value={formData.zip}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Images (Max 10)</Label>
            <div className="grid grid-cols-5 gap-4">
              {formData.images?.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    fill
                    src={image}
                    alt={`Lead image ${index + 1}`}
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      images: prev.images?.filter((_, i) => i !== index) || []
                    }))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {(!formData.images || formData.images.length < 10) && (
                <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Plus className="h-6 w-6 text-gray-400" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCloseAction}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-500" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 