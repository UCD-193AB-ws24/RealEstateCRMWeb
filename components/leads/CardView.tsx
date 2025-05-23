"use client"

import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"
import type { Lead } from "./types"
import LeadActions from "./LeadActions"
import ImageCarousel from "./ImageCarousel"
import StatusBadge from "./StatusBadge"

interface CardViewProps {
  leads: Lead[]
}

export default function CardView({ leads }: CardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {leads.map((lead) => (
        <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              <StatusBadge status={lead.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Image Carousel - Positioned at the top */}
            {lead.images && lead.images.length > 0 && (
              <ImageCarousel images={lead.images} alt={`${lead.name} property`} />
            )}
            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={20} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-800">{lead.address} </p>
                  <p className="text-slate-600">{lead.city}, {lead.state} {lead.zip}</p>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <div className="text-sm text-gray-600">
                <span className="text-sm text-slate-500">Owner:</span> {lead.owner}
              </div>
            </div>
            {lead.notes && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {lead.notes}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address + ', ' + lead.city + ', ' + lead.state + ' ' + lead.zip)}`, '_blank')}
              >
                <MapPin className="h-4 w-4 mr-1" />
                View on Map
              </Button>
              <LeadActions lead={lead} variant="card" />
            </div>
          </CardFooter>
        </div>
      ))}
    </div>
  )
}
