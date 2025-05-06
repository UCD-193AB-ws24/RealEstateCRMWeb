"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"

interface ImportExportButtonProps {
  handleImportAction?: (event: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>
  handleExportAction?: () => void | Promise<void>
  leads: any[]
  showOnlyImport?: boolean
  showOnlyExportAndCount?: boolean
}

export default function ImportExportButton({ handleImportAction, handleExportAction, leads = [], showOnlyImport, showOnlyExportAndCount }: ImportExportButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true)
      try {
        if (handleImportAction) await handleImportAction(e)
      } finally {
        setIsImporting(false)
      }
    }
  }

  const onExport = async () => {
    setIsExporting(true)
    try {
      if (handleExportAction) await handleExportAction()
    } finally {
      setIsExporting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Only Import CSV
  if (showOnlyImport) {
    return (
      <Button
        onClick={triggerFileInput}
        className="w-full sm:w-auto bg-transparent border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
        disabled={isImporting}
        variant="ghost"
      >
        <input type="file" accept=".csv" onChange={onFileChange} ref={fileInputRef} className="hidden" />
        {isImporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import via CSV
          </>
        )}
      </Button>
    )
  }

  // Only Export to Google Sheets and count
  if (showOnlyExportAndCount) {
    return (
      <div className="flex flex-col items-start">
        <Button
          onClick={onExport}
          disabled={!leads.length || isExporting}
          className="w-full sm:w-auto bg-transparent border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors mb-1"
          variant="ghost"
        >
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
        {leads.length > 0 && (
          <p className="text-sm text-muted-foreground text-left mr-2">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} ready to export
          </p>
        )}
      </div>
    )
  }

  // Default: both
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="file" accept=".csv" onChange={onFileChange} ref={fileInputRef} className="hidden" />
        <Button
          onClick={triggerFileInput}
          className="w-full sm:w-auto bg-transparent border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          disabled={isImporting}
          variant="ghost"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import via CSV
            </>
          )}
        </Button>
        <Button
          onClick={onExport}
          disabled={!leads.length || isExporting}
          className="w-full sm:w-auto bg-transparent border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          variant="ghost"
        >
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
        <p className="text-sm text-muted-foreground text-center mr-2">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} ready to export
        </p>
      )}
    </>
  )
}
