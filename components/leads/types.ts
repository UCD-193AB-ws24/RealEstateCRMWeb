export type LeadStatus = "Lead" | "Contact" | "Offer" | "Sale";

export interface Lead {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  owner: string
  notes: string
  status: LeadStatus
  images: string[]
  userId: string
  latitude: number
  longitude: number
}
  
  