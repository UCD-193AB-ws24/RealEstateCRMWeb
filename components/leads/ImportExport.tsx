"use client";

import { useState, useRef } from "react";
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
    const confirmImportRef = useRef<(() => Promise<void>) | null>(null);

    // CSV → Lead[]
    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        console.log("Importing leads...");
        const file = e.target.files?.[0];
        console.log("File:", file);
        if (!file) return;
        
        try {
            const result = await new Promise<Lead[]>((resolve, reject) => {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    preview: 5,
                    complete: (results) => resolve(results.data as Lead[]),
                    error: reject
                });
            });

            // Show preview
            setPreviewLeads(result);
            setIsImportPreviewOpen(true);

            // Handle confirm
            const handleConfirm = async () => {
                // Update state
                setLeads((prevLeads) => [...prevLeads, ...result]);
                
                // Update backend
                for (const lead of result) {
                    if(session?.user.id) 
                        lead.userId = session?.user.id;
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

                // Reset preview state
                setIsImportPreviewOpen(false);
                setPreviewLeads([]);
            };

            // Store the confirm handler in a ref
            confirmImportRef.current = handleConfirm;
        } catch (err) {
            console.error("Error parsing CSV:", err);
        }
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

            // Show preview
            setPreviewLeads(newLeads);
            setIsImportPreviewOpen(true);

            // Handle confirm
            // const handleConfirm = async () => {
            //     // Update state
            //     setLeads((prevLeads) => [...prevLeads, ...newLeads]);
                
            //     // Update backend
            //     for (const lead of newLeads) {
            //         if(session?.user.id) 
            //             lead.userId = session?.user.id;
            //         try {
            //             await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/`, {
            //                 method: "POST",
            //                 headers: {
            //                   "Content-Type": "application/json",
            //                 },
            //                 body: JSON.stringify(lead),
            //             });
            //         } catch (err) {
            //             console.error("Error adding lead to backend:", err);
            //         }
            //     }

            //     // Reset preview state
            //     setIsImportPreviewOpen(false);
            //     setPreviewLeads([]);
            // };

            // // Store the confirm handler in a ref
            // confirmImportRef.current = handleConfirm;
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
                    setIsImportPreviewOpen(false);
                    setLeads(prev => [...prev, ...previewLeads]);
                    for (const lead of previewLeads) {
                        if (session?.user.id) lead.userId = session.user.id;
                        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead)
                        });
                    }
                    window.location.reload();
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
