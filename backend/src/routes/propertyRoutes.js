const express = require("express")
const router = express.Router()
const { protect, allow } = require("../middlewares/authMiddleware")
const property = require("../controllers/propertyController")

console.log("✅ Property routes file loaded");
console.log("✅ property.addProperty:", typeof property.addProperty);

// Debug route to test if routes are loading
router.get("/test", (req, res) => {
    console.log("📍 Test route hit");
    res.json({ message: "Property routes are working!" });
});

// New route for adding properties with images, features, and documents
console.log("📍 Registering POST /add route");
router.post("/add",
    (req, res, next) => {
        console.log("📍 /add route HIT - Method:", req.method, "URL:", req.url);
        next();
    },
    allow("builder", "agent"),
    property.addProperty
);

router.post("/", protect,
    allow("builder", "agent", "admin"),
    property.createProperty
);

router.get("/", property.getVerifiedProperties)

console.log("✅ All property routes registered");

module.exports = router
