# Media Upload Configuration Update

## Summary
Updated image and video upload functionality to support more file formats, increased limits, and larger file sizes.

## New Configuration

### File Limits
- **Maximum Files**: 10 (increased from 5)
- **Maximum File Size**: 50MB per file (increased from 5MB)
- **Images**: Up to 10
- **Videos**: Up to 5 (new feature)

### Supported Formats
```javascript
allowedFormats: [
  'jpg',   // JPEG Image
  'jpeg',  // JPEG Image
  'png',   // PNG Image
  'gif',   // GIF Image
  'webp',  // WebP Image
  'mp4',   // MP4 Video
  'mov',   // MOV Video
  'avi',   // AVI Video
  'webm'   // WebM Video
]
```

## Updated Files

### 1. ImageUploader.jsx ✅
**Location:** `src/components/inventory/products/ProductFormComponents/ImageUploader.jsx`

**Changes:**
- Added constants for configuration:
  ```javascript
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'];
  ```
- Updated file input accept attribute to include all formats
- Changed label text to "Product Images & Videos"
- Added video preview support with `<video>` tag
- Updated max count from 5 to 10
- Added format list in UI: "Supported: JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM"

**Video Detection:**
```javascript
{image.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
  <video src={image.url} className="..." muted />
) : (
  <img src={image.url} alt="..." className="..." />
)}
```

### 2. SimpleProductForm.jsx ✅
**Location:** `src/components/inventory/products/SimpleProductForm.jsx`

**Changes:**
- Updated max file count from 5 to 10
- Added video format support to file input
- Added video preview rendering
- Updated accept attribute:
  ```jsx
  accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm,image/*,video/*"
  ```

## Features

### Video Support
- ✅ Upload MP4, MOV, AVI, WebM videos
- ✅ Video preview in grid
- ✅ Muted autoplay for previews
- ✅ Same controls as images (Set Primary, Remove)

### Enhanced Limits
- ✅ 10 files total (up from 5)
- ✅ 50MB per file (up from 5MB)
- ✅ Mix of images and videos allowed

### User Experience
- ✅ Clear format list displayed
- ✅ File counter shows current/max (e.g., "3/10 files uploaded")
- ✅ Automatic format detection for preview
- ✅ Hover controls for all media types

## File Input Configuration

### Accept Attribute
```html
accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm,image/*,video/*"
```

This allows:
- Specific extensions for better file picker filtering
- Generic `image/*` and `video/*` for broader compatibility
- Both approaches ensure maximum browser compatibility

## Preview Grid

### Layout
- Grid: 2 columns (mobile) → 3 columns (tablet) → 5 columns (desktop)
- Aspect ratio: Square (1:1)
- Height: 128px (h-32)
- Gap: 16px (gap-4)

### Media Rendering
```jsx
{img.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
  <video src={img.url} className="w-full h-full object-cover" muted />
) : (
  <img src={img.url} alt="Product" className="w-full h-full object-cover" />
)}
```

## Backend Considerations

### Validation Needed
The backend should validate:
1. **File Size**: Reject files > 50MB
2. **File Type**: Only allow specified formats
3. **File Count**: 
   - Maximum 10 images
   - Maximum 5 videos
4. **Total Count**: Maximum 10 files total

### Example Backend Validation (Node.js/Express)
```javascript
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format'));
    }
  }
});

router.post('/products', 
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  createProduct
);
```

## Testing Checklist

- [ ] Upload 10 images successfully
- [ ] Upload mix of images and videos
- [ ] Upload video files (MP4, MOV, AVI, WebM)
- [ ] Verify 50MB file size limit
- [ ] Test file format validation
- [ ] Verify video preview displays correctly
- [ ] Test "Set Primary" on both images and videos
- [ ] Test "Remove" functionality
- [ ] Verify file counter updates correctly
- [ ] Test on mobile, tablet, and desktop views

## Notes

- Videos are muted by default in previews to avoid autoplay issues
- The primary media (image or video) will be used as the main product display
- All media types support the same actions (Set Primary, Remove)
- The grid layout is responsive and adjusts based on screen size
