"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { Lead } from "./types";
import ImportExportButton from "./InputExportButton";
import GoogleSheetPicker from "./GoogleSheetPicker";
import ImportPreviewDialog from "./ImportPreviewDialog";
import { toast } from "sonner";

interface ImportExportProps {
    leadsInit: Lead[]
}

export default function ImportExport({ leadsInit }: ImportExportProps) {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<Lead[]>(leadsInit);
    const [isImportSheetPickerOpen, setIsImportSheetPickerOpen] = useState(false);
    const [isExportSheetPickerOpen, setIsExportSheetPickerOpen] = useState(false);
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

            if (result.length === 0) {
                toast.error("No data found in CSV file");
                return;
            }

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
            toast.error("Error parsing CSV file");
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
            const data = await res.json();
            
            if (data.error) {
                toast.error(data.error);
                return;
            }

            if (!data || data.length === 0) {
                toast.error("No data found in sheet");
                return;
            }

            // Validate that the data has required fields
            const validLeads = data.filter((lead: Lead) => {
                return lead.name && lead.address && lead.city && lead.state && lead.zip;
            });

            if (validLeads.length === 0) {
                toast.error("No valid leads found in sheet. Each lead must have name, address, city, state, and zip.");
                return;
            }

            // Show preview
            setPreviewLeads(validLeads);
            setIsImportPreviewOpen(true);
            
        } catch (error) {
            console.error("Error importing from Google Sheet:", error);
            toast.error("Failed to import from Google Sheet");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <ImportExportButton
                handleImportAction={handleImport}
                handleImportSheetAction={() => setIsImportSheetPickerOpen(true)}
                handleExportAction={() => setIsExportSheetPickerOpen(true)} 
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
                onSelectAction={() => setIsExportSheetPickerOpen(false)}
                isExport={true}
                leads={leads}
            />
        </div>
    );
}
