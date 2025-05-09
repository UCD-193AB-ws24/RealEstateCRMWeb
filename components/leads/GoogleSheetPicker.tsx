"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Lead } from "./types"

interface GoogleSheetPickerProps {
  isOpen: boolean
  onCloseAction: () => void
  onSelectAction?: (sheetId: string, sheetName: string) => void
  isExport: boolean
  leads?: Lead[]
}

export default function GoogleSheetPicker({
  isOpen,
  onCloseAction,
  onSelectAction,
  isExport,
  leads = []
}: GoogleSheetPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sheets, setSheets] = useState<{ id: string; name: string }[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null)
  const [sheetData, setSheetData] = useState<any[]>([])
  const [step, setStep] = useState<'menu' | 'list' | 'preview'>("menu")

  useEffect(() => {
    if (isOpen) {
      setStep("menu")
      setSelectedSheet(null)
      setSheetData([])
    }
  }, [isOpen])

  const handleSelect = async () => {
    if (!selectedSheet) return
    const sheetName = sheets.find(s => s.id === selectedSheet)?.name || ''
    if (isExport) {
      const replace = window.confirm("Replace existing sheet? OK=Replace, Cancel=Append")
      try {
        const res = await fetch('/api/export-leads', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ leads, sheetId: selectedSheet, mode: replace ? 'replace' : 'append' })
        })
        const { sheetUrl } = await res.json()
        window.open(sheetUrl)
      } catch (e) {
        console.error('Export error', e)
      }
    } else if (onSelectAction) {
      onSelectAction(selectedSheet, sheetName)
    }
    onCloseAction()
  }

  const handleCreateNew = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/create-google-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExport }),
      })
      const { sheetId, sheetName } = await res.json()
      // prepend new sheet and select it
      setSheets(prev => [{ id: sheetId, name: sheetName }, ...prev])
      setSelectedSheet(sheetId)
      // immediately export/import
      await handleSelect()
    } catch (error) {
      console.error("Error creating new sheet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // fetch sheets via google-picker backend
      fetch('/api/google-picker', { headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json())
        .then(data => setSheets(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error fetching sheets:', err))
        .finally(() => setIsLoading(false))
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedSheet && !isExport) {
      setIsLoading(true)
      fetch(`/api/import-google-sheet/${selectedSheet}`)
        .then(res => res.json())
        .then(data => setSheetData(data))
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setSheetData([])
    }
  }, [selectedSheet, isExport])

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isExport ? "Export to Google Sheet" : "Import from Google Sheet"}</DialogTitle>
        </DialogHeader>
        {/* Step: menu */}
        {step === "menu" && (
          <div className="py-4 space-y-2">
            {isExport && (
              <Button onClick={handleCreateNew} disabled={isLoading} className="w-full">
                Create New Sheet
              </Button>
            )}
            <Button onClick={() => setStep("list")} className="w-full">
              {isExport ? "Use Existing Sheet" : "Select Sheet to Import"}
            </Button>
          </div>
        )}
        {/* Step: list */}
        {step === "list" && (
          <>
            <div className="py-2">
              <Button variant="ghost" onClick={() => setStep("menu")} className="mb-2">
                ← Back
              </Button>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <div className="space-y-2 max-h-60 overflow-auto">
                  {sheets.map(sheet => (
                    <label key={sheet.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                      <input
                        type="radio" name="sheet" value={sheet.id}
                        checked={selectedSheet === sheet.id}
                        onChange={() => setSelectedSheet(sheet.id)}
                        className="mr-2"
                      />
                      <span>{sheet.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCloseAction}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (isExport) await handleSelect()
                  else {
                    setStep("preview")
                    // fetch preview data
                    selectedSheet && setIsLoading(true)
                    selectedSheet && fetch(`/api/import-google-sheet/${selectedSheet}`)
                      .then(res => res.json())
                      .then(data => setSheetData(data))
                      .catch(console.error)
                      .finally(() => setIsLoading(false))
                  }
                }}
                disabled={!selectedSheet}
              >
                {isExport ? "Export" : "Next"}
              </Button>
            </div>
          </>
        )}
        {/* Step: preview (import only) */}
        {step === "preview" && !isExport && (
          <div className="py-4">
            <div className="overflow-auto max-h-80 mb-4 border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {sheetData[0] && Object.keys(sheetData[0]).map(col => (
                      <th key={col} className="p-1 border">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 ? 'bg-gray-50' : ''}>
                      {Object.values(row).map((cell, i) => (
                        <td key={i} className="p-1 border">{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setStep("list")}>← Back</Button>
              <Button onClick={handleSelect} disabled={!selectedSheet}>Import</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
