"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import type { Lead } from "./types"
import LeadActions from "./LeadActions"
import StatusBadge from "./StatusBadge"
import ImageCarousel from "./ImageCarousel"

interface CardViewProps {
  leads: Lead[]
}

export default function CardView({ leads }: CardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{lead.name}</h3>
              <StatusBadge status={lead.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Image Carousel - Positioned at the top */}
            {lead.images && lead.images.length > 0 && (
              <ImageCarousel images={lead.images} alt={`${lead.name} property`} />
            )}
            <div className="flex items-start gap-2 text-sm text-gray-600 pt-6">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{lead.address}</p>
                <p>{lead.city}, {lead.state} {lead.zip}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Owner:</span> {lead.owner}
            </div>
            {lead.notes && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {lead.notes}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/80 hover:underline"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`)}`, "_blank")}
            >
              View in Maps
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <LeadActions
              lead={lead}
              variant="card"
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}


