"use client"

import { useEffect, useState, useRef } from "react"
import { GoogleMap, Marker, InfoWindow, useLoadScript, Libraries } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, MapPin, Navigation, Search, X, ZoomIn } from "lucide-react"
import type { Lead } from "./types"
import EditLeadModal from "./EditLeadModal"

interface MapViewProps {
  leads: Lead[]
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
}

const libraries: Libraries = ["places"]

export default function MapView({ leads }: MapViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [leadsState, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
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
      setIsLoading(true)
      const updatedLeads = await Promise.all(
        leads.map(async (lead) => {
          if (lead.latitude === undefined || lead.longitude === undefined) {
            const location = await geocodeAddress(`${lead.address}, ${lead.city}, ${lead.state} ${lead.zip}`)
            return { ...lead, latitude: location.lat, longitude: location.lng }
          }
          return lead
        }),
      )
      setLeads(updatedLeads)
      setIsLoading(false)
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
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          setUserLocation(defaultCenter)
        },
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
        lng: lead.longitude,
      })
      mapRef.current.setZoom(14)
    }
  }

  const handleListClick = (lead: Lead) => {
    // setSelectedLead(lead)
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: lead.latitude,
        lng: lead.longitude,
      })
      mapRef.current.setZoom(14)
    }
  }

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation)
      mapRef.current.setZoom(14)
    }
  }

  if (!isLoaded) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-200px)] bg-background rounded-lg overflow-hidden border">
      <div className="absolute inset-0 z-10">
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </div>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={12}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            zoomControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
          onLoad={(map) => {
            mapRef.current = map
            setMapLoaded(true)
          }}
          onUnmount={() => {
            if (mapRef.current) {
              google.maps.event.clearInstanceListeners(mapRef.current)
              mapRef.current = null
            }
          }}
        >
          {leadsState.map(
            (lead) =>
              lead.latitude !== -1 &&
              lead.longitude !== -1 &&
              lead.latitude &&
              lead.longitude && (
                <Marker
                  key={lead.id}
                  position={{ lat: lead.latitude, lng: lead.longitude }}
                  onClick={() => handleMarkerClick(lead)}
                  title={lead.name}
                  animation={selectedLead?.id === lead.id ? google.maps.Animation.BOUNCE : undefined}
                  icon={{
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${selectedLead?.id === lead.id ? '#7C3AED' : '#4b5563'}" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="${selectedLead?.id === lead.id ? '#926bf4' : '#d1d5db'}"></path>
                        <circle cx="12" cy="10" r="3" fill="${selectedLead?.id === lead.id ? '#7C3AED' : '#4b5563'}"></circle>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(36, 36),
                    anchor: new google.maps.Point(18, 36),
                  }}
                />
              ),
          )}

          {selectedLead && (
            <InfoWindow
              position={{ lat: selectedLead.latitude, lng: selectedLead.longitude }}
              onCloseClick={() => setSelectedLead(null)}
              options={{
                pixelOffset: new google.maps.Size(0, -36),
              }}
            >
              <div className="p-2 max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{selectedLead.name}</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedLead(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5 inline-block mr-1" />
                  {selectedLead.address}, {selectedLead.city}, {selectedLead.state} {selectedLead.zip}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedLead.address}, ${selectedLead.city}, ${selectedLead.state} ${selectedLead.zip}`)}`,
                        "_blank",
                      )
                    }
                  >
                    View in Maps
                  </Button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setZoom((mapRef.current.getZoom() || 12) + 1)
                  }
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setZoom((mapRef.current.getZoom() || 12) - 1)
                  }
                }}
              >
                <ZoomIn className="h-4 w-4 rotate-180" />
              </Button>
              <Button variant="outline" size="icon" onClick={centerOnUserLocation}>
                <Navigation className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full bg-background border-l shadow-lg transition-transform duration-300 ease-in-out z-20 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "320px" }}
      >
        <Card className="h-full border-none rounded-none gap-0">
          <CardHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Properties</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(false)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(100%-60px)]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : leadsState.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No properties found</p>
              </div>
            ) : (
              leadsState.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleListClick(lead)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {lead.address}, {lead.city}, {lead.state} {lead.zip}
                        </span>
                      </div>
                    </div>
                    {selectedLead?.id === lead.id && (
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-4 top-4 z-20 shadow-md"
          onClick={() => setIsSidebarOpen(true)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Show List
        </Button>
      )}

      {/* Edit Modal */}
      {selectedLead && (
        <EditLeadModal isOpen={!!selectedLead} onCloseAction={() => setSelectedLead(null)} lead={selectedLead} />
      )}
    </div>
  )
}

