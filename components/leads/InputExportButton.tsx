"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"

interface ImportExportButtonProps {
  handleImportAction: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleExportAction: () => Promise<void>
  leads: any[]
}

export default function ImportExportButton({ handleImportAction, handleExportAction, leads = [] }: ImportExportButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true)
      try {
        await handleImportAction(e)
      } finally {
        setIsImporting(false)
      }
    }
  }

  const onExport = async () => {
    setIsExporting(true)
    try {
      await handleExportAction()
    } finally {
      setIsExporting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="file" accept=".csv" onChange={onFileChange} ref={fileInputRef} className="hidden" />

          <Button onClick={triggerFileInput} className="w-full sm:w-auto" disabled={isImporting} variant="outline">
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>

          <Button onClick={onExport} disabled={!leads.length || isExporting} className="w-full sm:w-auto" variant="outline">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Google Sheets
              </>
            )}
          </Button>
        </div>

        {leads.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} ready to export
          </p>
        )}
      </CardContent>
    </Card>
  )
}
