"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import classesApi from "@/api/classesApi";
import { toast } from "sonner";
import { ClassEntity } from "@/types/classes";

interface RoadmapImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newClass: ClassEntity) => void;
}

export function RoadmapImportDialog({ isOpen, onClose, onSuccess }: RoadmapImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (selected.type !== 'application/pdf') {
                setError('Only PDF files are supported.');
                setFile(null);
                return;
            }
            setFile(selected);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const res = await classesApi.createFromRoadmapPdf(file);
            if (res.isSuccess) {
                toast.success("Class imported successfully!");
                onSuccess(res.data);
                handleClose();
            } else {
                setError(res.message || "Import failed");
            }
        } catch (err: any) {
            // Axios error normalization handled by interceptor but we might catch UI-level errors
            setError(err?.normalized?.message || err?.message || "Failed to import roadmap.");
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setUploading(false);
        onClose();
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !uploading && handleClose()}>
            <DialogContent className="bg-[#1a1410] border-[#f5c16c]/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Import Roadmap PDF</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Upload a PDF exported from roadmap.sh to automatically create a new class specialization.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-[#f5c16c]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#f5c16c]/5 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="h-12 w-12 rounded-full bg-[#f5c16c]/10 flex items-center justify-center mb-3 text-[#f5c16c]">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-white font-medium mb-1">Click to upload PDF</p>
                            <p className="text-xs text-white/40">Supported format: .pdf</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="bg-[#0a0506] border border-[#f5c16c]/20 rounded-lg p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-[#f5c16c]/10 flex items-center justify-center text-[#f5c16c]">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            {!uploading && (
                                <button onClick={clearFile} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#f5c16c] text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing roadmap with AI...</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-[#f5c16c] w-full animate-progress-indeterminate origin-left" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading} className="border-[#f5c16c]/30 text-white/70 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || uploading} className="bg-[#f5c16c] hover:bg-[#f5c16c]/90 text-black font-semibold">
                        {uploading ? "Importing..." : "Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}