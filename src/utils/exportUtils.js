import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Common export utility for Invexix
 */
export const exportData = async ({
  data,
  columns,
  fileName,
  title,
  description,
  format = "pdf"
}) => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  if (format === "pdf") {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header: invexix.com
    doc.setFontSize(24);
    doc.setTextColor(249, 115, 22); // orange-500
    doc.text("invexix.com", 14, 20);

    // Title
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text(title, 14, 32);

    // Description Paragraph
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // gray-500
    const splitDescription = doc.splitTextToSize(description, pageWidth - 28);
    doc.text(splitDescription, 14, 42);

    // Metadata
    const metaY = 42 + (splitDescription.length * 5) + 5;
    doc.setFontSize(9);
    doc.text(`Generated on: ${date} at ${time}`, 14, metaY);

    // Table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(item => columns.map(col => {
        const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        return val !== undefined && val !== null ? String(val) : "";
      })),
      startY: metaY + 10,
      theme: "grid",
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // gray-50
      },
      margin: { bottom: 20 },
      didDrawPage: (data) => {
        // Footer: invexix.com
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175); // gray-400
        doc.text("invexix.com - Smart Inventory Management", 14, pageHeight - 10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 25, pageHeight - 10);
      }
    });

    doc.save(`${fileName}-${new Date().toISOString().slice(0, 10)}.pdf`);
  } else if (format === "excel") {
    // Prepare data for Excel
    const excelData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        row[col.header] = val;
      });
      return row;
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Add branding info (optional, but good for "well designed" feel)
    // Note: xlsx basic doesn't support much styling without xlsx-js-style,
    // but we can at least ensure the data is clean.

    XLSX.writeFile(workbook, `${fileName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
};
