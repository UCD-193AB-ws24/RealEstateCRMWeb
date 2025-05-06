"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { Lead } from "./types";
import ImportExportButton from "./InputExportButton";

interface ImportExportProps {
    leadsInit: Lead[]
    showOnlyImport?: boolean;
    showOnlyExportAndCount?: boolean;
}

export default function ImportExport({ leadsInit, showOnlyImport, showOnlyExportAndCount }: ImportExportProps) {
    const { data: session } = useSession();
    const [leads, setLeads] = useState<Lead[]>(leadsInit);

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

    // Export to Google Sheets
    async function handleExport() {
        if (!session?.user.accessToken) return alert("Not signed in");
        try {
            const res = await fetch("/api/export-leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ leads }),
            });
            if (!res.ok) {
                throw new Error("Failed to export leads");
            }
            const { sheetUrl } = await res.json();
            window.open(sheetUrl, "_blank");
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export leads. Please try again.");
        }
    }

    return (
        <div className="flex flex-col items-end justify-center">
            <ImportExportButton 
                handleImportAction={handleImport} 
                handleExportAction={handleExport} 
                leads={leads} 
                showOnlyImport={showOnlyImport}
                showOnlyExportAndCount={showOnlyExportAndCount}
            />
        </div>
    );
}
