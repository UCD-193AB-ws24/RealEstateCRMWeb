"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Table, Map, Check } from "lucide-react"
import { useState } from "react"

interface LeadsViewToggleProps {
  currentView: "cards" | "spreadsheet" | "map"
}

const viewOptions = [
  { key: "cards", icon: LayoutGrid, label: "Grid View" },
  { key: "spreadsheet", icon: Table, label: "List View" },
  { key: "map", icon: Map, label: "Map View" },
]

export default function LeadsViewToggle({ currentView }: LeadsViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hovered, setHovered] = useState<string | null>(null)

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    params.set("page", "1")
    router.push(`/leads?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      {viewOptions.map(({ key, icon: Icon, label }, idx) => {
        const isActive = currentView === key
        return (
          <div key={key} className="relative flex items-center justify-center">
            <button
              onClick={() => handleViewChange(key)}
              className={`relative flex items-center justify-center h-8 w-12 transition-colors ${
                isActive ? "bg-[#7C3AED]" : "bg-transparent"
              } ${idx === 0 ? "rounded-l-full" : idx === viewOptions.length - 1 ? "rounded-r-full" : ""}`}
              aria-label={key}
              onMouseEnter={() => setHovered(key)}
              onMouseLeave={() => setHovered(null)}
            >
              {isActive && (
                <Check className="h-4 w-4 mr-1 text-white" />
              )}
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-800"}`} />
            </button>
            {hovered === key && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow z-10">
                {label}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
