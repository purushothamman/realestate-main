const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});
