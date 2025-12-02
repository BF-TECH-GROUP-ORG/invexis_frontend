# Fix for Internal Server Error

## Problem
The `.next` build folder was deleted while the dev server was running, causing "ENOENT" (file not found) errors for build manifests.

## Solution
**You MUST restart the development server:**

### Steps:
1. **Stop the current server**
   - Press `Ctrl + C` in the terminal running `npm run dev`
   - Wait for it to fully stop

2. **Start the server again**
   ```bash
   npm run dev
   ```

3. **Wait for compilation**
   - Next.js will rebuild the `.next` folder
   - Wait for "Ready" message before testing

## Why This Happened
- We deleted the `.next` folder to clear cached old code
- The dev server was still running and looking for those files
- Restarting will rebuild everything fresh

## After Restart
The login should work with the real backend API. If you still get errors, check:
- Browser console for actual error message
- Network tab to see which API is being called
- Verify `.env.local` file exists with backend URLs
