// roguelearn-web/src/components/admin/subjects/ImportProgressWidget.tsx
import { Loader2, AlertCircle, CheckCircle2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportProgressWidgetProps {
    isVisible: boolean;
    percent: number;
    message: string;
    isComplete: boolean;
    hasError: boolean;
    onMaximize: () => void;
}

export function ImportProgressWidget({
    isVisible,
    percent,
    message,
    isComplete,
    hasError,
    onMaximize
}: ImportProgressWidgetProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="rounded-xl border border-[#f5c16c]/20 bg-[#1a0b08] p-4 shadow-2xl shadow-black/50">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${hasError ? "border-red-500/30 bg-red-500/10 text-red-400" :
                                isComplete ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                                    "border-[#f5c16c]/30 bg-[#f5c16c]/10 text-[#f5c16c]"
                            }`}>
                            {hasError ? <AlertCircle className="h-5 w-5" /> :
                                isComplete ? <CheckCircle2 className="h-5 w-5" /> :
                                    <Loader2 className="h-5 w-5 animate-spin" />}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white">
                                {hasError ? "Import Failed" : isComplete ? "Import Complete" : "Importing..."}
                            </h4>
                            <p className="text-xs text-white/50 line-clamp-1 max-w-[140px]">{message}</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMaximize}
                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
                        title="Maximize"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>

                {!hasError && !isComplete && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div
                            className="h-full bg-[#f5c16c] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}