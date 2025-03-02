"use client"

import { Grid, Table } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeadsViewToggle({ currentView }: { currentView: string }) {
  const router = useRouter()

  const handleViewChange = (value: string) => {
    router.push(`/leads?view=${value}`)
  }

  return (
    <Tabs value={currentView} onValueChange={handleViewChange}>
      <TabsList>
        <TabsTrigger value="cards" className="flex items-center gap-1.5">
          <Grid className="h-4 w-4" />
          <span>Cards</span>
        </TabsTrigger>
        <TabsTrigger value="spreadsheet" className="flex items-center gap-1.5">
          <Table className="h-4 w-4" />
          <span>Spreadsheet</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

