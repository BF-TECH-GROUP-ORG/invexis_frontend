"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, Eye, Download } from "lucide-react";
import toast from "react-hot-toast";
import { IconButton, Tooltip } from "@mui/material";

export default function InvoiceGenerator({ invoice, onPreview }) {

    const handleDownload = async (e) => {
        e.stopPropagation(); // Prevent card click

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

                // Small delay to ensure the download triggers before revoking
                setTimeout(() => window.URL.revokeObjectURL(url), 100);

                toast.success("Download complete!", { id: toastId });
            } catch (error) {
                console.error("Download error:", error);
                toast.error("Download failed, opening in new tab...", { id: toastId });
                // Fallback: Open in new tab if fetch fails (e.g. CORS)
                window.open(invoice.pdfUrl, '_blank');
            }
            return;
        }

        // Fallback: Client-side Generation
        try {
            const doc = new jsPDF();
            // ... (keeping existing generation logic structure if needed, but for brevity in this specific replacement, I will assume the intention is to keep the logic. 
            // However, since replace_file_content replaces the whole block, I must include the FULL generation logic for client-side fallback if I replace that section.
            // The prompt says "Refactor generatePDF to handleDownload". I should keep the client side logic.)

            // --- Header ---
            doc.setFillColor(249, 115, 22);
            doc.rect(0, 0, 210, 8, "F");

            doc.setFontSize(24);
            doc.setTextColor(249, 115, 22);
            doc.setFont("helvetica", "bold");
            doc.text("INVEXIS", 14, 25);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.setFont("helvetica", "normal");
            doc.text("Kigali, Rwanda", 14, 32);
            doc.text("support@invexix.com", 14, 37);

            // --- Invoice Info ---
            doc.setFontSize(30);
            doc.setTextColor(200);
            doc.text("INVOICE", 150, 30, { align: "left" });

            doc.setFontSize(10);
            doc.setTextColor(50);
            doc.text(`Invoice #: ${invoice.id}`, 150, 40);
            doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 150, 45);
            doc.text(`Status: ${invoice.status}`, 150, 50);

            // --- Customer Details ---
            doc.setDrawColor(200);
            doc.line(14, 55, 196, 55);

            doc.setFontSize(11);
            doc.setTextColor(249, 115, 22);
            doc.text("Bill To:", 14, 65);

            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.text(invoice.customer.name, 14, 72);
            doc.text(invoice.customer.phone, 14, 77);
            doc.text(invoice.customer.address, 14, 82);

            // --- Items Table ---
            const tableColumn = ["Item Description", "Qty", "Unit Price", "Total"];
            const tableRows = invoice.items.map(item => [
                item.name,
                item.qty,
                `${item.price.toLocaleString()} FRW`,
                `${(item.price * item.qty).toLocaleString()} FRW`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 90,
                headStyles: {
                    fillColor: [249, 115, 22],
                    textColor: 255,
                    fontStyle: "bold"
                },
                styles: { fontSize: 10, cellPadding: 4 },
                alternateRowStyles: { fillColor: [245, 245, 245] },
            });

            // --- Totals ---
            const finalY = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`Total Amount: ${invoice.totalAmount.toLocaleString()} FRW`, 140, finalY, { align: "right" });

            // --- Payment Info ---
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Payment Method: ${invoice.paymentMethod}`, 14, finalY);

            // --- Signature Section ---
            const sigY = finalY + 40;
            doc.setDrawColor(0);
            doc.line(14, sigY, 80, sigY);
            doc.text("Authorized Signature", 14, sigY + 5);

            if (invoice.signature) {
                doc.setFont("courier", "italic");
                doc.setFontSize(14);
                doc.setTextColor(249, 115, 22);
                doc.text("Invexis Admin", 20, sigY - 5);
            }

            // --- Footer ---
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Thank you for your business!", 105, 280, { align: "center" });

            doc.save(`${invoice.id}_${invoice.customer.name}.pdf`);
            toast.success("Invoice generated and downloaded!");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    const handlePreviewClick = (e) => {
        // e.stopPropagation() is NOT needed here if this is the main card click, 
        // but if we call it from the eye button we need to stop propagation if that button is inside the card.
        // However, the card *itself* has onClick={onPreview}.
        // The Eye button is inside the card.
        // So clicking Eye button -> handlePreviewClick -> onPreview.
        // But clicking Eye button ALSO bubbles to Card -> onPreview.
        // So we should stop bubbling on the Eye button to avoid double triggering, 
        // OR just let the card handle the click?
        // User asked for "Icons" specifically.
        // If I click the Eye icon, it should just preview.
        // If I click the card, it should also preview (per previous logic).
        // So I will just attach stopPropagation to the eye button click to be safe and explicit.
        if (onPreview) {
            e.stopPropagation();
            onPreview();
        }
    };

    return (
        <div
            onClick={onPreview}
            className="group bg-white rounded-3xl border border-gray-200 p-6 flex items-center gap-6 hover:border-orange-500 transition-colors cursor-pointer select-none relative"
        >
            <div className="p-5 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-100 transition-colors">
                <FileText size={48} strokeWidth={1.5} />
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                    {invoice.customer.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                    <span>{invoice.id}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${invoice.type === 'Expense' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {invoice.type || 'Income'}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-lg font-bold text-gray-800">
                    {Number(invoice.totalAmount).toLocaleString()} FRW
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <Tooltip title="Preview Invoice">
                    <IconButton
                        onClick={handlePreviewClick}
                        className="transition-opacity"
                        sx={{ color: '#f97316', '&:hover': { bgcolor: '#fff7ed' } }}
                    >
                        <Eye size={20} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Download PDF">
                    <IconButton
                        onClick={handleDownload}
                        className="transition-opacity"
                        sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                        <Download size={20} />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
}
