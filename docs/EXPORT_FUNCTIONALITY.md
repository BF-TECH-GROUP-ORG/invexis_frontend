# Export Functionality Documentation

## Overview

The Reports page now includes comprehensive export functionality that allows users to export data in multiple formats:

1. **PDF Export** - Professional PDF documents
2. **Excel Export** - Spreadsheet format with all tables and KPIs
3. **Print** - Print-optimized HTML format

## Features

### Export Scope Selection

Users can choose between two export scopes:

#### 1. Current Tab Only
- Exports only the currently selected tab
- Includes all tables, KPIs, and visualizations from that tab
- Best for focused reporting on specific areas

#### 2. All Tabs as Report
- Exports all 6 tabs in a single document
- Creates a comprehensive system-wide report
- Perfect for complete business analysis

### Export Formats

#### PDF Export
- Professional layout with proper formatting
- Multi-page support for large datasets
- High-quality images and tables
- Printer-friendly
- Filename: `{TabName}-Report.pdf` or `System-Wide-Reports.pdf`

#### Excel Export
- Separates KPIs and tables into different sheets
- Named sheets for easy navigation:
  - `{TabName}-KPIs` for KPI metrics
  - `{TabName}-Table1`, `{TabName}-Table2`, etc. for data tables
- All data is properly formatted and editable
- Filename: `{TabName}-Report.xlsx` or `System-Wide-Reports.xlsx`

#### Print
- Browser's native print dialog
- Print to PDF, physical printer, or file
- Optimized styling for print media
- Multi-page support with proper page breaks
- Header styling for professional appearance

## How to Use

### Step 1: Navigate to Reports
Go to the Reports & Analytics section of the application.

### Step 2: Click "Export Options"
Click the "Export Options" button in the header (black button with download icon).

### Step 3: Select Format from Dropdown
Choose one of the three options:
- 📄 Export as PDF
- 🖨️ Print Report
- 📊 Export to Excel

### Step 4: Choose Export Scope
A dialog will appear with two radio button options:
- **Current Tab Only** - Export just the active tab
- **All Tabs as Report** - Export all 6 tabs together

### Step 5: Complete Export
Click the appropriate button to finalize:
- **Export PDF** - Generates PDF file
- **Export Excel** - Generates Excel workbook
- **Print** - Opens print dialog

## Technical Details

### Data Extraction

The export system automatically extracts:

#### Tables
- All HTML tables in the tab
- Headers from `<thead>`
- Body rows from `<tbody>`
- Proper cell data extraction

#### KPI Cards
- All elements with `data-kpi-card` attribute
- Title from element with `data-kpi-title`
- Value from element with `data-kpi-value`

### Excel Sheet Naming
- Sheet names are limited to 31 characters (Excel limitation)
- Tabs are abbreviated when needed
- Format: `{TabName}-KPIs` or `{TabName}-T{Number}`

### PDF Generation
- Uses html2canvas for rendering
- Automatic page breaks for large content
- Maintains styling and formatting
- High DPI rendering for quality

### Print Optimization
- CSS media queries for print styles
- Page break handling
- Professional header and footer
- Optimized color scheme for printing

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PDF Export | ✅ | ✅ | ✅ | ✅ |
| Excel Export | ✅ | ✅ | ✅ | ✅ |
| Print | ✅ | ✅ | ✅ | ✅ |

## File Naming Convention

### Current Tab Export
- PDF: `{TabName}-Report.pdf`
- Excel: `{TabName}-Report.xlsx`

Example for Sales Performance tab:
- `Sales-Performance-Report.pdf`
- `Sales-Performance-Report.xlsx`

### All Tabs Export
- PDF: `System-Wide-Reports.pdf`
- Excel: `System-Wide-Reports.xlsx`

## Troubleshooting

### PDF Export Not Working
- Check browser console for errors
- Ensure pop-ups are allowed
- Try a different browser
- Check system resources

### Excel Export Issues
- Verify data is populated in the tab
- Check for special characters in sheet names
- Ensure Excel is installed (for some browsers)

### Print Not Opening
- Check if print dialog is blocked
- Try allowing pop-ups for the domain
- Try Ctrl+P as alternative

## Future Enhancements

Potential improvements for future versions:
1. Custom template selection for PDF/Excel
2. Watermarking and branding options
3. Scheduled automated exports
4. Email delivery of exports
5. Cloud storage integration
6. Password protection for PDFs
7. Custom column selection
8. Data filtering before export
9. Signature/approval workflows
10. Multi-language support in exports

## Dependencies

The export functionality uses these libraries:
- `html2pdf.js` - PDF generation
- `html2canvas` - Canvas rendering
- `xlsx` - Excel file generation
- Material-UI components - UI elements

## Code Structure

### Main Component: `page.jsx`
- Contains export dialog logic
- Handles export scope selection
- Manages export format handlers

### Utility Functions: `exportUtils.js`
- `exportToPDF()` - PDF generation helper
- `printReport()` - Print handler
- `exportToExcel()` - Excel generation
- `extractTableDataForExcel()` - Data extraction
- `generateTabHTML()` - HTML generation
- `generateFullReportHTML()` - Full report HTML

### Data Attributes

#### KPI Cards
```jsx
<Paper data-kpi-card>
    <Typography data-kpi-title>{title}</Typography>
    <Typography data-kpi-value>{value}</Typography>
</Paper>
```

#### Tables
```jsx
<Table>
    <TableHead>
        <TableRow>
            <TableCell>{header}</TableCell>
        </TableRow>
    </TableHead>
    <TableBody>
        <TableRow>
            <TableCell>{data}</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

## Performance Considerations

1. **Large Datasets**: PDF export with all tabs may take a few seconds for large datasets
2. **Memory Usage**: Browser memory usage increases during export (more noticeable with all tabs)
3. **File Size**: Excel files are generally smaller than PDF files
4. **Print Preview**: Print dialog may take time to render for large content

## Security & Privacy

- All export processing happens in the browser (client-side)
- No data is sent to external servers
- Users have full control over file storage
- Sensitive data should be handled according to company policy

## Support

For issues or questions about export functionality:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure all required libraries are properly installed
4. Contact system administrator if problems persist
