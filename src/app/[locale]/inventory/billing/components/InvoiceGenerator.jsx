"use client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function InvoiceGenerator({ invoice }) {

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- Header ---
        doc.setFillColor(249, 115, 22); // Orange Brand Color
        doc.rect(0, 0, 210, 8, "F"); // Top strip

        doc.setFontSize(24);
        doc.setTextColor(249, 115, 22);
        doc.setFont("helvetica", "bold");
        doc.text("INVEXIS", 14, 25);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text("Kigali, Rwanda", 14, 32);
        doc.text("support@invexis.rw", 14, 37);

        // --- Invoice Info ---
        doc.setFontSize(30);
        doc.setTextColor(200); // Light Gray
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
                fillColor: [249, 115, 22], // Orange
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
        doc.line(14, sigY, 80, sigY); // Line
        doc.text("Authorized Signature", 14, sigY + 5);

        if (invoice.signature) {
            doc.setFont("courier", "italic");
            doc.setFontSize(14);
            doc.setTextColor(249, 115, 22); // Orange signature
            doc.text("Invexis Admin", 20, sigY - 5);
        }

        // --- Footer ---
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Thank you for your business!", 105, 280, { align: "center" });

        doc.save(`${invoice.id}_${invoice.customer.name}.pdf`);
        toast.success("Invoice downloaded successfully!");
    };

    return (
        <div
            onDoubleClick={generatePDF}
            className="group bg-white rounded-3xl border border-gray-200 p-6 flex items-center gap-6 hover:border-orange-500 transition-colors cursor-pointer select-none"
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
                    <span>{new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-lg font-bold text-gray-800">
                    {Number(invoice.totalAmount).toLocaleString()} FRW
                </p>
            </div>
        </div>
    );
}
