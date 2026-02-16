const express = require("express")
const router = express.Router()
const { protect, allow } = require("../middlewares/authMiddleware")
const builder = require("../controllers/builderController")

//builder dashboard 

router.get(
    "/dashboard",
    protect,
    allow("builder"),
    builder.getDashboard
)

module.exports = router