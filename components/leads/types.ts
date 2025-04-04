export interface Lead {
  id: number
  name: string
  address: string
  city: string
  state: string
  zip: string
  owner: string
  notes: string
  status: "lead" | "contact" | "offer" | "sale"
  images: string[]
  userId: string
  latitude: number
  longitude: number
}
  
  