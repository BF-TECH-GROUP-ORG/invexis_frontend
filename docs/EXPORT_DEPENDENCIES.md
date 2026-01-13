# Export Functionality - Required Dependencies

To use the export functionality, you need to install the following packages:

## Installation

```bash
npm install html2pdf.js html2canvas xlsx
```

Or if you prefer yarn:

```bash
yarn add html2pdf.js html2canvas xlsx
```

## Package Details

### 1. **html2pdf.js** (PDF Export)
- **Purpose**: Converts HTML content to PDF documents
- **Version**: Latest stable
- **Size**: ~40KB minified

**Installation:**
```bash
npm install html2pdf.js
```

**Usage in code:**
```javascript
const { jsPDF } = await import('jspdf');
const html2pdf = (await import('html2pdf.js')).default;
```

### 2. **html2canvas** (PDF Rendering)
- **Purpose**: Takes screenshots of web pages
- **Version**: Latest stable
- **Size**: ~70KB minified

**Installation:**
```bash
npm install html2canvas
```

**Usage in code:**
```javascript
const html2canvas = (await import('html2canvas')).default;
```

### 3. **xlsx** (Excel Export)
- **Purpose**: Reads, writes, and manipulates Excel files
- **Version**: Latest stable
- **Size**: ~180KB minified

**Installation:**
```bash
npm install xlsx
```

**Usage in code:**
```javascript
import * as XLSX from 'xlsx';
// Already imported in page.jsx
```

## Complete Installation Script

Run all three installations at once:

```bash
npm install html2pdf.js html2canvas xlsx
```

## Verification

After installation, verify the packages are installed:

```bash
npm list html2pdf.js html2canvas xlsx
```

You should see output like:
```
├── html2pdf.js@0.10.1
├── html2canvas@1.4.1
└── xlsx@0.18.5
```

## Compatibility

| Package | Node | Browser | React |
|---------|------|---------|-------|
| html2pdf.js | ✅ | ✅ | ✅ |
| html2canvas | ✅ | ✅ | ✅ |
| xlsx | ✅ | ✅ | ✅ |

## Development Mode

All packages work in both development and production modes:

```bash
npm run dev    # Development with exports enabled
npm run build  # Production build with exports enabled
npm run start  # Production mode
```

## CDN Alternative (Not Recommended)

If you prefer to use CDN links instead of npm, you can add to `next.config.mjs` or `next.config.js`:

```javascript
// next.config.mjs
export default {
  // ... other config
  compress: true,
  // Add external scripts if needed
};
```

However, **npm installation is recommended** for better performance and bundle optimization.

## Troubleshooting

### Missing Dependencies Error
If you see "Cannot find module 'html2canvas'" etc:
```bash
npm install
npm run build
```

### Build Errors
If build fails after installation:
```bash
rm -rf node_modules
npm install
npm run dev
```

### Memory Issues During Export
If you encounter memory issues with large exports:
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
- Consider exporting individual tabs instead of all tabs
- Export to Excel instead of PDF for faster performance

## Optional Performance Optimization

For better performance with PDFs, you can also install:

```bash
npm install jspdf
```

This is already used dynamically in the code but having it pre-installed can improve performance.

## Size Impact on Bundle

After installing all three packages:
- **Development bundle increase**: ~300KB
- **Production bundle increase**: ~90KB (after minification/gzip)
- **Runtime memory usage**: ~2-5MB per export operation

## Uninstall

If you need to remove these packages:

```bash
npm uninstall html2pdf.js html2canvas xlsx
```

## Next Steps

1. **Install dependencies**: `npm install html2pdf.js html2canvas xlsx`
2. **Test exports**: Navigate to Reports page and try export functionality
3. **Verify functionality**: Test PDF, Excel, and Print exports
4. **Review documentation**: See `EXPORT_FUNCTIONALITY.md` for detailed usage

## Support

For issues with dependencies:
1. Check npm registry: `npm view {package-name}`
2. Check version compatibility: `npm info {package-name} versions`
3. Clear cache: `npm cache clean --force`
4. Reinstall: `rm -rf node_modules && npm install`
