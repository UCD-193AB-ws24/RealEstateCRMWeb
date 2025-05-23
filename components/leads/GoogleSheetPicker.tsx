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
  const [step, setStep] = useState<'menu' | 'list' | 'preview'>("menu")
  const [mode, setMode] = useState<'replace' | 'append'>('append')
  const [newSheetTitle, setNewSheetTitle] = useState("")
  const [isSelectingTitle, setIsSelectingTitle] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep("menu")
      setSelectedSheet(null)
    }
  }, [isOpen])

  const handleSelect = async () => {
    if (!selectedSheet) return
    const sheetName = sheets.find(s => s.id === selectedSheet)?.name || ''
    try {
      if (isExport) {
        const res = await fetch('/api/export-leads', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ leads, sheetId: selectedSheet, mode })
        })
        const { sheetUrl } = await res.json()
        window.open(sheetUrl)
      } else if (onSelectAction) {
        onSelectAction(selectedSheet, sheetName)
      }
    } catch (e) {
      console.error('Export error', e)
    } finally {
      onCloseAction()
    }
  }

  const handleCreateNew = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/create-google-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newSheetTitle }),
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
              <Button onClick={() => setIsSelectingTitle(true)} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Create New Sheet
              </Button>
            )}
            {isSelectingTitle && (
              <div className="mt-2 mx-[10%]">
                <label htmlFor="new-sheet-title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                    name="new-sheet-title"
                    id="new-sheet-title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter title for new sheet"
                    onChange={e => setNewSheetTitle(e.target.value)}
                  />
                  <Button onClick={() => {
                    setIsSelectingTitle(false)
                    handleCreateNew()
                  }} className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white">
                    Create
                  </Button>
                </div>
              )}
            <Button onClick={() => setStep("list")} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
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
                        onChange={() => {
                          setSelectedSheet(sheet.id);
                        }}
                        className="mr-2"
                      />
                      <span>{sheet.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {isExport && (
              <div className="flex justify-end space-x-2 mb-4">
                <Button
                  variant={mode === 'replace' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('replace')
                    handleSelect()
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Replace
                </Button>
                <Button
                  variant={mode === 'append' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('append')
                    handleSelect()
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Append
                </Button>
              </div>
            )}
            {!isExport && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCloseAction}>Cancel</Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedSheet}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
