import { MapPin, User, FileText } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Lead } from "./types"
import StatusBadge from "./StatusBadge"
import ImageCarousel from "./ImageCarousel"
import LeadActions from "./LeadActions"

interface CardViewProps {
  leads: Lead[]
}

export default function CardView({ leads }: CardViewProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <Card key={lead.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
          <CardContent className="p-0">
            {/* Image Carousel - Positioned at the top */}
            {lead.images && lead.images.length > 0 && (
              <ImageCarousel images={lead.images} alt={`${lead.name} property`} />
            )}

            {/* Content Section */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 truncate flex-grow">{lead.name}</h2>
              </div>

              <div className="flex items-start mt-4 text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                <p className="text-sm">
                  {lead.address}, {lead.city}, {lead.state} {lead.zip}
                </p>
              </div>

              <div className="flex items-center mt-3 text-gray-600">
                <User className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                <p className="text-sm">{lead.owner}</p>
              </div>

              {lead.notes && (
                <div className="flex items-start mt-3 text-gray-600">
                  <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="text-sm line-clamp-2">{lead.notes}</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <StatusBadge status={lead.status} />
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

