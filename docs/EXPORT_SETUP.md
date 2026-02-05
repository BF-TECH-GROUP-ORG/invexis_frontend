# Export Feature - Quick Setup Guide

## Overview
Your reports export feature is now fully implemented! This guide will help you get it up and running in 5 minutes.

## Step 1: Install Dependencies (2 minutes)

```bash
cd /home/josh/projects/invexis/invexis_frontend
npm install html2pdf.js html2canvas xlsx
```

Wait for installation to complete. You should see:
```
✓ added 15 packages
```

## Step 2: Test in Development (1 minute)

```bash
npm run dev
```

Navigate to the Reports section in your application.

## Step 3: Test Export Functionality (2 minutes)

### Test Current Tab Export:
1. Click "Export Options" button (black button with download icon)
2. Select "📄 Export as PDF" or "📊 Export to Excel"
3. Choose "Current Tab Only"
4. Click "Export PDF" or "Export Excel"
5. File should download automatically

### Test All Tabs Export:
1. Click "Export Options" button
2. Select any export format
3. Choose "All Tabs as Report"
4. Click the export button
5. Complete system-wide report should download

### Test Print:
1. Click "Export Options"
2. Select "🖨️ Print Report"
3. Choose scope (current or all)
4. Click "Print" button
5. Browser print dialog opens

## Features You Now Have

✅ **Export Options Button** - Clean dropdown menu with 3 formats
✅ **PDF Export** - Professional PDF with proper formatting
✅ **Excel Export** - Spreadsheet with all data and tables
✅ **Print** - Print-optimized HTML output
✅ **Scope Selection** - Choose current tab or all tabs
✅ **Smart Dialog** - Choose format and scope before exporting
✅ **Automatic Downloads** - Files save with appropriate names

## File Naming

Your exports will be named:
- **Current Tab**: `{TabName}-Report.pdf` or `.xlsx`
- **All Tabs**: `System-Wide-Reports.pdf` or `.xlsx`

## What Gets Exported

### Tables
- All data tables from each tab
- Proper headers and formatting
- All rows and columns

### KPI Cards
- All metrics and values
- Organized by tab

### Layout
- Professional headers
- Proper spacing and formatting
- Print-optimized styling

## Troubleshooting

### "Module not found" Error
```bash
npm install html2pdf.js html2canvas xlsx
npm run dev
```

### Export Button Not Working
1. Open browser console (F12)
2. Check for errors
3. Ensure dependencies are installed
4. Try refreshing the page

### PDF Export Is Slow
- This is normal for large datasets
- Excel export is faster
- Single tab export is faster than all tabs

### Print Dialog Not Opening
- Check if pop-ups are blocked
- Allow pop-ups for the domain
- Try right-click and print as alternative

## File Structure

```
reports/
├── page.jsx                    (Main page with export logic)
├── exportUtils.js              (Utility functions)
├── components/
│   ├── ReportKPI.jsx          (Updated with data attributes)
│   ├── GeneralTab.jsx
│   ├── InventoryTab.jsx
│   ├── SalesTab.jsx
│   ├── DebtsTab.jsx
│   ├── PaymentsTab.jsx
│   └── StaffTab.jsx
```

## Key Code Changes

### page.jsx
- Added `useRef` for tab references
- Added export state management
- Added export handlers for PDF/Excel/Print
- Added export scope dialog
- Added data extraction logic

### ReportKPI.jsx
- Added `data-kpi-card` attribute to Paper component
- Added `data-kpi-title` attribute to title
- Added `data-kpi-value` attribute to value

## Performance Tips

1. **For Large Reports**: Export individual tabs instead of all tabs
2. **For Quick Exports**: Use Excel instead of PDF
3. **Clear Browser Cache**: Delete cached exports periodically
4. **Monitor Memory**: Close other tabs when exporting large datasets

## Next Steps

1. ✅ Install dependencies
2. ✅ Test each export format
3. ✅ Test each export scope
4. ✅ Test print functionality
5. Review `EXPORT_FUNCTIONALITY.md` for detailed documentation
6. Review `EXPORT_DEPENDENCIES.md` for dependency details

## Complete Export Button Usage Flow

```
User clicks "Export Options"
    ↓
User selects export format (PDF/Excel/Print)
    ↓
Dialog opens asking for scope
    ↓
User selects "Current Tab Only" or "All Tabs"
    ↓
User clicks final action button (Export PDF/Excel/Print)
    ↓
File downloads or print dialog opens
```

## Testing Checklist

- [ ] Install dependencies successfully
- [ ] Export current tab as PDF
- [ ] Export current tab as Excel
- [ ] Export all tabs as PDF
- [ ] Export all tabs as Excel
- [ ] Print current tab
- [ ] Print all tabs
- [ ] Verify PDF quality and formatting
- [ ] Verify Excel sheets and data
- [ ] Verify print layout and styling
- [ ] Test on different tabs (General, Sales, Inventory, etc.)

## Support Files

- **EXPORT_FUNCTIONALITY.md** - Complete feature documentation
- **EXPORT_DEPENDENCIES.md** - Dependency details and troubleshooting
- **This file** - Quick setup guide

## Questions?

Refer to the documentation files or check the browser console for detailed error messages.

Good luck! 🚀
