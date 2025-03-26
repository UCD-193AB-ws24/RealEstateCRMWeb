export interface Lead {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  owner: string
  status: "active" | "pending" | "closed"
  notes: string
  images: string[]
  latitude: number
  longitude: number
}
  
  