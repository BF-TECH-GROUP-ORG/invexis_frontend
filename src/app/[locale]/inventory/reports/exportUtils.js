import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

/**
 * Export report content to PDF
 */
export const exportToPDF = (content, filename = 'report.pdf') => {
    const element = document.createElement('div');
    element.innerHTML = content;

    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
};

/**
 * Print report content
 */
export const printReport = (content, windowTitle = 'Report') => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>' + windowTitle + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #333; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h2, h3 { color: #333; margin-top: 20px; }
        .kpi-container { margin-bottom: 20px; }
        .kpi-card { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; min-width: 150px; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #FF6D00; }
        .kpi-title { font-size: 12px; color: #666; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, filename = 'report.xlsx') => {
    const workbook = XLSX.utils.book_new();

    // If data is an array of sheets
    if (Array.isArray(data)) {
        data.forEach((sheet, index) => {
            const ws = XLSX.utils.json_to_sheet(sheet.rows);
            XLSX.utils.book_append_sheet(workbook, ws, sheet.name || `Sheet${index + 1}`);
        });
    } else {
        // Single sheet data
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, ws, 'Report');
    }

    XLSX.writeFile(workbook, filename);
};

/**
 * Generate HTML content for current tab
 */
export const generateTabHTML = (tabName, tabContent) => {
    const timestamp = new Date().toLocaleString();

    return `
        <div style="font-family: Arial, sans-serif; margin: 20px;">
            <h1 style="color: #333; border-bottom: 3px solid #FF6D00; padding-bottom: 10px;">
                ${tabName} Report
            </h1>
            <p style="color: #666; font-size: 12px;">Generated on: ${timestamp}</p>
            ${tabContent}
        </div>
    `;
};

/**
 * Generate HTML for all tabs combined
 */
export const generateFullReportHTML = (tabs) => {
    const timestamp = new Date().toLocaleString();

    let html = `
        <div style="font-family: Arial, sans-serif; margin: 20px;">
            <h1 style="color: #333; text-align: center; border-bottom: 3px solid #FF6D00; padding-bottom: 15px;">
                System-Wide Reports & Analytics
            </h1>
            <p style="color: #666; font-size: 12px; text-align: center;">Generated on: ${timestamp}</p>
    `;

    tabs.forEach((tab, index) => {
        html += `
            <div style="page-break-after: always; margin: 30px 0;">
                <h2 style="color: #333; border-left: 4px solid #FF6D00; padding-left: 10px; margin-top: 0;">
                    ${tab.name}
                </h2>
                ${tab.content}
            </div>
        `;
    });

    html += `</div>`;
    return html;
};

/**
 * Extract table data from DOM and convert to array format for Excel
 */
export const extractTableDataForExcel = (tableElement) => {
    const rows = [];
    const headers = [];

    // Get headers
    const headerCells = tableElement.querySelectorAll('thead th');
    headerCells.forEach(cell => {
        headers.push(cell.textContent.trim());
    });
    rows.push(headers);

    // Get body rows
    const bodyCells = tableElement.querySelectorAll('tbody tr');
    bodyCells.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        if (rowData.length > 0) {
            rows.push(rowData);
        }
    });

    return rows;
};

/**
 * Convert table DOM to array of arrays
 */
export const tableToArray = (tableElement) => {
    const result = [];
    tableElement.querySelectorAll('tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('th, td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        if (rowData.length > 0) {
            result.push(rowData);
        }
    });
    return result;
};

/**
 * Generate KPI data for Excel
 */
export const generateKPIDataForExcel = (kpiElements) => {
    const kpiData = [];

    kpiElements.forEach(el => {
        const titleEl = el.querySelector('[data-kpi-title]');
        const valueEl = el.querySelector('[data-kpi-value]');

        if (titleEl && valueEl) {
            kpiData.push({
                'KPI Name': titleEl.textContent.trim(),
                'Value': valueEl.textContent.trim()
            });
        }
    });

    return kpiData;
};

/**
 * Prepare complete Excel workbook with multiple sheets
 */
export const prepareExcelWorkbook = (tabsData) => {
    const sheets = [];

    tabsData.forEach(tab => {
        // KPI Sheet
        if (tab.kpis && tab.kpis.length > 0) {
            sheets.push({
                name: `${tab.name} - KPIs`,
                rows: tab.kpis
            });
        }

        // Table Sheets
        if (tab.tables && tab.tables.length > 0) {
            tab.tables.forEach((table, idx) => {
                sheets.push({
                    name: `${tab.name} - Table${idx + 1}`.substring(0, 31), // Sheet name limit is 31 chars
                    rows: table
                });
            });
        }
    });

    return sheets;
};
