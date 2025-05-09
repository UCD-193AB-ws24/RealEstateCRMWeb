"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { Lead } from "./types";
import ImportExportButton from "./InputExportButton";
import GoogleSheetPicker from "./GoogleSheetPicker";
import ImportPreviewDialog from "./ImportPreviewDialog";

interface ImportExportProps {
    leadsInit: Lead[]
}

export default function ImportExport({ leadsInit }: ImportExportProps) {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<Lead[]>(leadsInit);
    const [isImportSheetPickerOpen, setIsImportSheetPickerOpen] = useState(false);
    const [isExportSheetPickerOpen, setIsExportSheetPickerOpen] = useState(false);
    const [selectedSheet, setSelectedSheet] = useState<{ id: string; name: string } | null>(null);
    const [replaceConfirm, setReplaceConfirm] = useState<boolean | null>(null);
    const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
    const [previewLeads, setPreviewLeads] = useState<Lead[]>([]);

    // CSV → Lead[]
    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        console.log("Importing leads...");
        const file = e.target.files?.[0];
        console.log("File:", file);
        if (!file) return;
        Papa.parse<Lead>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (result) => {
                const newLeads = result.data as Lead[];
                setLeads((prevLeads) => [...prevLeads, ...newLeads]);
                console.log("new leads:", leads);

                // Update backend with each new lead
                for (const lead of newLeads) {
                    if(session?.user.id) 
                        lead.userId = session?.user.id;
                    console.log("Adding lead to backend:", lead);
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(lead),
                        });
                    } catch (err) {
                        console.error("Error adding lead to backend:", err);
                    }
                }
            },
            error: (err) => console.error("CSV parse error:", err),
        });
        window.location.reload();
    }

    // Import from Google Sheet
    async function handleImportFromSheet(sheetId: string) {
        try {
            const res = await fetch(`/api/import-google-sheet/${sheetId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const newLeads = await res.json();
            console.log("New leads from Google Sheet:", newLeads);
            if (newLeads.error) {
                console.error("Error importing from Google Sheet:", newLeads.error);
                return;
            }
            // open preview dialog
            setPreviewLeads(newLeads);
            setIsImportPreviewOpen(true);
        } catch (error) {
            console.error("Error importing from Google Sheet:", error);
        }
    }

    // Export to Google Sheets
    async function handleExport() {
        if (!session?.user.accessToken) return alert("Not signed in");
        
        if (!selectedSheet) {
            setIsExportSheetPickerOpen(true);
            return;
        }

        const mode = replaceConfirm === true ? "replace" : "append";
        const res = await fetch("/api/export-leads", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                leads, 
                sheetId: selectedSheet.id,
                mode: mode
            }),
        });
        const { sheetUrl } = await res.json();
        window.open(sheetUrl);
        // reset export state
        setSelectedSheet(null);
        setReplaceConfirm(null);
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <ImportExportButton
                handleImportAction={handleImport}
                handleImportSheetAction={() => setIsImportSheetPickerOpen(true)}
                handleExportAction={async () => {
                    if (!selectedSheet) { setIsExportSheetPickerOpen(true); return; }
                    // ask replace or append
                    const choice = window.confirm("Replace existing sheet? OK to Replace, Cancel to Append");
                    setReplaceConfirm(choice);
                    await handleExport();
                }} 
                leads={leads} 
            />
            
            {/* import picker */}
            <GoogleSheetPicker
                isOpen={isImportSheetPickerOpen}
                onCloseAction={() => setIsImportSheetPickerOpen(false)}
                onSelectAction={handleImportFromSheet}
                isExport={false}
                leads={leads}
            />
            
            {/* import preview */}
            <ImportPreviewDialog
                isOpen={isImportPreviewOpen}
                leads={previewLeads}
                onCancel={() => setIsImportPreviewOpen(false)}
                onConfirm={async () => {
                    setLeads(prev => [...prev, ...previewLeads]);
                    for (const lead of previewLeads) {
                        if (session?.user.id) lead.userId = session.user.id;
                        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead)
                        });
                    }
                    setIsImportPreviewOpen(false);
                }}
            />
            
            {/* export picker */}
            <GoogleSheetPicker
                isOpen={isExportSheetPickerOpen}
                onCloseAction={() => setIsExportSheetPickerOpen(false)}
                onSelectAction={(sheetId, sheetName) => {
                    setSelectedSheet({ id: sheetId, name: sheetName });
                    setIsExportSheetPickerOpen(false);
                }}
                isExport={true}
                leads={leads}
            />
        </div>
    );
}
