import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Premium Executive PDF Export
 * Mimics the "Aquot" design with Header, KPI Cards, and Structured Tables
 */
export const exportExecutivePDF = ({
    title = "GENERAL EXECUTIVE REPORT",
    subtitle = "",
    period = "",
    companyName = "Aquot",
    companyEmail = "info@invexix.com",
    kpis = [],
    tables = [],
    filename = "executive-report.pdf"
}) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 20;

    // --- 1. Header Section ---
    doc.setTextColor(249, 115, 22); // Orange #f97316
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, margin, currentY);

    doc.setTextColor(31, 41, 55); // Dark Gray #1f2937
    doc.setFontSize(14);
    doc.text(title.toUpperCase(), pageWidth - margin, currentY, { align: 'right' });

    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128); // Gray #6b7280
    doc.text(`Email: ${companyEmail}`, margin, currentY);
    doc.text(`Period: ${period}`, pageWidth - margin, currentY, { align: 'right' });

    currentY += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, currentY, { align: 'right' });

    currentY += 15;

    // --- 2. KPI Cards Section ---
    if (kpis && kpis.length > 0) {
        const cardWidth = (pageWidth - (2 * margin) - (kpis.length - 1) * 5) / kpis.length;
        const cardHeight = 25;

        kpis.forEach((kpi, index) => {
            const x = margin + (index * (cardWidth + 5));
            
            // Card background
            doc.setFillColor(249, 250, 251); // #f9fafb
            doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');
            doc.setDrawColor(229, 231, 235); // #e5e7eb
            doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'S');

            // KPI Icon Circle (mimic the screenshot letters S, C, P, D)
            const circleSize = 8;
            const circleX = x + cardWidth - circleSize - 4;
            const circleY = currentY + 4;
            
            // Choose color based on KPI type or index
            const colors = [
                { bg: [239, 246, 255], text: [59, 130, 246] }, // Blue
                { bg: [254, 243, 199], text: [245, 158, 11] }, // Yellow
                { bg: [236, 253, 245], text: [16, 185, 129] }, // Green
                { bg: [254, 226, 226], text: [239, 68, 68] },  // Red
            ];
            const color = colors[index % colors.length];
            
            doc.setFillColor(...color.bg);
            doc.circle(circleX + circleSize/2, circleY + circleSize/2, circleSize/2, 'F');
            doc.setTextColor(...color.text);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            const letter = kpi.title.charAt(0).toUpperCase();
            doc.text(letter, circleX + circleSize/2, circleY + circleSize/2 + 1, { align: 'center', baseline: 'middle' });

            // KPI Text
            doc.setTextColor(107, 114, 128);
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.text(kpi.title.toUpperCase(), x + 6, currentY + 8);

            doc.setTextColor(17, 24, 39);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(kpi.value.toString(), x + 6, currentY + 18);
        });

        currentY += cardHeight + 15;
    }

    // --- 3. Tables Section ---
    tables.forEach((table, tIdx) => {
        doc.autoTable({
            startY: currentY,
            head: table.head,
            body: table.body,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 7,
                cellPadding: 2,
                font: "helvetica",
                lineColor: [229, 231, 235],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [17, 24, 39], // #111827
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251], // #f9fafb
            },
            columnStyles: {
                0: { fontStyle: 'bold' },
            },
            didParseCell: (data) => {
                const row = data.row.raw;
                if (row.isSubtotal) {
                    data.cell.styles.fillColor = [255, 247, 237]; // Orange-50 #fff7ed
                    data.cell.styles.textColor = [154, 52, 18];  // Orange-900 #9a3412
                    data.cell.styles.fontStyle = 'bold';
                }

                if (row.isTotal) {
                    data.cell.styles.fillColor = [17, 24, 39]; // #111827
                    data.cell.styles.textColor = [255, 255, 255];
                    data.cell.styles.fontStyle = 'bold';
                    
                    if (data.column.index === data.row.cells.length - 2) {
                        data.cell.styles.fillColor = [16, 185, 129]; // Emerald #10b981
                    }
                }
            },
            didDrawPage: (data) => {
                // Footer on each page
                const str = `© ${new Date().getFullYear()} Invexis Global. Intelligence Node. Confidential Report.`;
                doc.setFontSize(8);
                doc.setTextColor(156, 163, 175);
                doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
            }
        });
        currentY = doc.lastAutoTable.finalY + 15;
    });

    doc.save(filename);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'report.xlsx') => {
    const workbook = XLSX.utils.book_new();

    if (Array.isArray(data)) {
        data.forEach((sheet, index) => {
            const ws = XLSX.utils.json_to_sheet(sheet.rows);
            XLSX.utils.book_append_sheet(workbook, ws, sheet.name || `Sheet${index + 1}`);
        });
    } else {
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, 'Report');
    }

    XLSX.writeFile(workbook, filename);
};

/**
 * Prepare complete Excel workbook with multiple sheets
 */
export const prepareExcelWorkbook = (tabsData) => {
    const sheets = [];

    tabsData.forEach(tab => {
        if (tab.kpis && tab.kpis.length > 0) {
            sheets.push({
                name: `${tab.name} - KPIs`,
                rows: tab.kpis
            });
        }

        if (tab.tables && tab.tables.length > 0) {
            tab.tables.forEach((table, idx) => {
                sheets.push({
                    name: `${tab.name} - Table${idx + 1}`.substring(0, 31),
                    rows: table
                });
            });
        }
    });

    return sheets;
};
