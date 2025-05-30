"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LEAD_STATUSES, US_STATES } from "./constants"
import type { Lead, LeadStatus } from "./types"
import { toast } from "sonner"
import ImageUpload from "./ImageUpload"

interface EditLeadModalProps {
  isOpen: boolean
  onCloseAction: () => void
  lead: Lead
}

export default function EditLeadModal({ isOpen, onCloseAction, lead }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead>(lead)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Reset the form data when the lead changes
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
    
    // Form validation
    if (!formData.name.trim()) {
      toast.error("Please enter a name for the lead");
      return;
    }
    
    if (!formData.address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    
    if (!formData.city.trim()) {
      toast.error("Please enter a city");
      return;
    }
    
    if (!formData.state) {
      toast.error("Please select a state");
      return;
    }
    
    if (!formData.zip.trim()) {
      toast.error("Please enter a ZIP code");
      return;
    }
    
    if (!formData.owner.trim()) {
      toast.error("Please enter an owner name");
      return;
    }
    
    setIsSubmitting(true)
    try {
      await updateLead()
      toast.success("Lead updated successfully")
      onCloseAction()
    } catch (error) {
      console.error("Failed to update lead:", error)
      toast.error("Failed to update lead")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Lead, value: string | number | LeadStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpdate = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleClose = () => {
    setFormData(lead); // Reset to original data
    onCloseAction();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: LeadStatus) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(({ value, label, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        {label}
                      </div>
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
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleInputChange("state", value)}
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
                onChange={(e) => handleInputChange("zip", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={formData.owner}
              onChange={(e) => handleInputChange("owner", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Images (Max 10)</Label>
            <ImageUpload 
              initialImages={formData.images || []} 
              onUploadAction={handleImageUpdate} 
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6b31ce]" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 