"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lead } from "./types";

interface ImportPreviewDialogProps {
  isOpen: boolean;
  leads: Lead[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ImportPreviewDialog({ isOpen, leads, onConfirm, onCancel }: ImportPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-80 mb-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {leads[0] && Object.keys(leads[0]).map(col => (
                  <th key={col} className="p-1 border">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((row, idx) => (
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
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
