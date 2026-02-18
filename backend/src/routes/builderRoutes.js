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

// For agents: list available builders
router.get(
    "/list",
    protect,
    allow("agent"),
    builder.getBuildersList
)

module.exports = router