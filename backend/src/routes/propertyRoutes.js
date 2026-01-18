const express = require("express")
const router = express.Router()
const {protect, allow} = require("../middlewares/authMiddleware")
const property = require("../controllers/propertyController")


router.post( "/",protect,
    allow("builder","agent","admin"),
    property.createProperty
)

router.get("/",property.getVerifiedProperties)

module.exports = router