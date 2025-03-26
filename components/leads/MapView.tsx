"use client"

import { useEffect, useState, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript, Libraries } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import type { Lead } from "./types"
import EditLeadModal from "./EditLeadModal"

interface MapViewProps {
  leads: Lead[]
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)"
}

const libraries: Libraries = ["places"]

export default function MapView({ leads }: MapViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [leadsState, setLeads] = useState<Lead[]>([])
  const mapRef = useRef<google.maps.Map | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  })

  useEffect(() => {
    if (!isLoaded) return

    const geocodeAddress = async (address: string): Promise<google.maps.LatLngLiteral> => {
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder()
      }

      return new Promise((resolve) => {
        geocoderRef.current!.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location
            resolve({ lat: location.lat(), lng: location.lng() })
          } else {
            console.error(`Geocoding failed for address "${address}":`, status)
            resolve({ lat: -1, lng: -1 })
          }
        })
      })
    }

    const updateLeadCoordinates = async () => {
      const updatedLeads = await Promise.all(
        leads.map(async (lead) => {
          if (lead.latitude === undefined || lead.longitude === undefined) {
            const location = await geocodeAddress(
              `${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`
            )
            return { ...lead, latitude: location.lat, longitude: location.lng }
          }
          return lead
        })
      )
      setLeads(updatedLeads)
    }

    updateLeadCoordinates()

    return () => {
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current)
      }
      if (geocoderRef.current) {
        geocoderRef.current = null
      }
    }
  }, [isLoaded, leads])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setUserLocation(defaultCenter)
        }
      )
    } else {
      setUserLocation(defaultCenter)
    }
  }, [])

  const handleMarkerClick = (lead: Lead) => {
    setSelectedLead(lead)
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: lead.latitude,
        lng: lead.longitude
      })
    }
  }

  const handleListClick = (lead: Lead) => {
    setSelectedLead(lead)
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: lead.latitude,
        lng: lead.longitude
      })
    }
  }

  if (!isLoaded || !userLocation) {
    return <div className="h-[calc(100vh-200px)] flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="relative h-[calc(100vh-200px)]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation}
        zoom={12}
        onLoad={(map) => {
          mapRef.current = map
        }}
        onUnmount={() => {
          if (mapRef.current) {
            google.maps.event.clearInstanceListeners(mapRef.current)
            mapRef.current = null
          }
        }}
      >
        {leadsState.map((lead) => (
          lead.latitude !== -1 && lead.longitude !== -1 && lead.latitude && lead.longitude &&
          <Marker
            key={lead.id}
            position={{ lat: lead.latitude, lng: lead.longitude }}
            onClick={() => handleMarkerClick(lead)}
            title={lead.name}
          />
        ))}

        {selectedLead && (
          <InfoWindow
            position={{ lat: selectedLead.latitude, lng: selectedLead.longitude }}
            onCloseClick={() => setSelectedLead(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold">{selectedLead.name}</h3>
              <p className="text-sm text-gray-600">{selectedLead.address}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLead(null)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedLead.address}, ${selectedLead.city}, ${selectedLead.state} ${selectedLead.zip}`)}`, "_blank")}
                >
                  View in Maps
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "300px" }}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Properties</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {leadsState.map((lead) => (
            <div
              key={lead.id}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleListClick(lead)}
            >
              <div className="font-medium">{lead.name}</div>
              <div className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {lead.address}, {lead.city}, {lead.state} {lead.zip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-4 top-4"
          onClick={() => setIsSidebarOpen(true)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Show List
        </Button>
      )}

      {/* Edit Modal */}
      {selectedLead && (
        <EditLeadModal
          isOpen={!!selectedLead}
          onCloseAction={() => setSelectedLead(null)}
          lead={selectedLead}
        />
      )}
    </div>
  )
} 