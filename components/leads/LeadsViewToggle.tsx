"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Table, Map } from "lucide-react"

interface LeadsViewToggleProps {
  currentView: "cards" | "spreadsheet" | "map"
}

export default function LeadsViewToggle({ currentView }: LeadsViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", view)
    router.push(`/leads?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      <Button
        variant={currentView === "cards" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("cards")}
        className="h-8 w-8 p-0"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "spreadsheet" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("spreadsheet")}
        className="h-8 w-8 p-0"
      >
        <Table className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "map" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("map")}
        className="h-8 w-8 p-0"
      >
        <Map className="h-4 w-4" />
      </Button>
    </div>
  )
}

