const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use same absolute path as app.js express.static so uploaded files are served correctly.
// From backend/src/config -> go up to realestate-main and use uploads/ there.
const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.warn('Could not create uploads dir:', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
    // Use 'profile-' prefix for profile images, 'property-' for property images
    const prefix = file.fieldname === 'profileImage' ? 'profile-' : 'property-';
    cb(null, prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
