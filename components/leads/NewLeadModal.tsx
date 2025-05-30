"use client"

import { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageUpload from "@/components/leads/ImageUpload"
import { LEAD_STATUSES } from "./constants"

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

interface NewLeadModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onSubmitAction: (data: LeadData) => Promise<void>
  userId: string
  states: { value: string; label: string }[]
}

export default function NewLeadModal({ isOpen, onCloseAction, onSubmitAction, userId, states }: NewLeadModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    owner: "",
    notes: "",
    status: "lead",
    images: [] as string[],
    userId: userId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmitAction(formData)
      onCloseAction()
    } catch (error) {
      console.error("Failed to create lead:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
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
                  {states.map((state) => (
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
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.zip}
              onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
              required
              />
            </div>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <ImageUpload onUploadAction={handleImageUpload} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCloseAction}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6b31ce]" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Submit Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 