const express = require("express");
const router = express.Router();

const { protect, allow } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

// Upload a single property image
router.post(
  "/property-image",
  protect,
  allow("agent", "builder"),
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        url: fileUrl,
      });
    } catch (error) {
      console.error("Property image upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  }
);

// Upload profile image (no auth required for registration)
router.post(
  "/profile-image",
  upload.single("profileImage"),
  (req, res) => {
    console.log("📸 Profile image upload request received");
    try {
      if (!req.file) {
        console.error("❌ No image file provided - upload.single('profileImage') failed to catch it");
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }
      console.log("✅ File received:", req.file.filename);

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        url: fileUrl,
        imageUrl: fileUrl, // Alias for compatibility
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  }
);

// Upload registration certificate (for builder registration, no auth required)
router.post(
  "/registration-certificate",
  upload.single("registrationCertificate"),
  (req, res) => {
    console.log("📄 Registration certificate upload request received");
    try {
      if (!req.file) {
        console.error("❌ No document file provided");
        return res.status(400).json({
          success: false,
          message: "No document file provided",
        });
      }
      console.log("✅ Document received:", req.file.filename);

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      return res.json({
        success: true,
        url: fileUrl,
        documentUrl: fileUrl,
      });
    } catch (error) {
      console.error("Registration certificate upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload document",
      });
    }
  }
);

module.exports = router;
