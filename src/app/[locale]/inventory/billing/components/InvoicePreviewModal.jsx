"use client";
import React from "react";
import ReactDOM from "react-dom";
import { X, Download, Printer, FileText } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";
import toast from "react-hot-toast";

export default function InvoicePreviewModal({ invoice, open, onClose }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Prevent scrolling on body when modal is open
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!mounted || !open || !invoice) return null;

    const handleDownload = async () => {
        if (invoice.pdfUrl) {
            const toastId = toast.loading("Starting download...");
            try {
                const response = await fetch(invoice.pdfUrl);
                if (!response.ok) throw new Error("Download failed");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `Invoice-${invoice.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                link.remove();

                // Small delay to ensure download triggers
                setTimeout(() => window.URL.revokeObjectURL(url), 100);

                toast.success("Download complete!", { id: toastId });
            } catch (error) {
                console.error("Download error:", error);
                toast.error("Download failed, opening in new tab...", { id: toastId });
                window.open(invoice.pdfUrl, '_blank');
            }
        }
    };

    const handlePrint = () => {
        const iframe = document.getElementById("preview-frame");
        if (iframe) {
            iframe.contentWindow.print();
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[#323639] animate-in fade-in duration-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#323639] text-white shadow-md z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg">
                        <FileText size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-100">{invoice.customer?.name} - {invoice.id}</h2>
                        <p className="text-xs text-gray-400">
                            {new Date(invoice.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip title="Download">
                        <IconButton onClick={handleDownload} sx={{ color: '#e2e8f0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                            <Download size={20} />
                        </IconButton>
                    </Tooltip>

                    {/* Only show print if we have a PDF URL to display */}
                    {invoice.pdfUrl && (
                        <Tooltip title="Print">
                            <IconButton onClick={handlePrint} sx={{ color: '#e2e8f0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                                <Printer size={20} />
                            </IconButton>
                        </Tooltip>
                    )}

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <Tooltip title="Close">
                        <IconButton onClick={onClose} sx={{ color: '#e2e8f0', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                            <X size={24} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {invoice.pdfUrl ? (
                    <iframe
                        id="preview-frame"
                        src={invoice.pdfUrl}
                        className="w-full h-full bg-[#525659] border-none"
                        title={`Invoice ${invoice.id}`}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                        <FileText size={64} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">No PDF Available</h3>
                        <p className="text-gray-400">A preview cannot be generated for this invoice.</p>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
