"use client"

import React from "react"
import { useState, useRef,} from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { Lead } from "./types"

interface ImportExportButtonProps {
  handleImportAction: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleImportSheetAction?: () => void
  handleExportAction: () => void
  leads: Lead[]
}

export default function ImportExportButton({ handleImportAction, handleImportSheetAction, handleExportAction, leads = [] }: ImportExportButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showImportOptions, setShowImportOptions] = useState(false)
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

  return (
    <div className="relative flex flex-row items-center">
      <input type="file" accept=".csv" onChange={onFileChange} ref={fileInputRef} className="hidden" />
      <Button onClick={() => setShowImportOptions(!showImportOptions)} disabled={isImporting} variant="ghost" size="icon">
        {isImporting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
      </Button>
      {showImportOptions && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded shadow-lg z-10">
          <Button variant="ghost" className="w-full text-left" onClick={() => { triggerFileInput(); setShowImportOptions(false); }}>
            Import CSV
          </Button>
          <Button variant="ghost" className="w-full text-left" onClick={() => { handleImportSheetAction?.(); setShowImportOptions(false); }}>
            Import from Sheets
          </Button>
        </div>
      )}
      <Button onClick={onExport} disabled={!leads.length || isExporting} variant="ghost" size="icon">
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}
