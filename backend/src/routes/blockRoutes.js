const express = require("express")
const router = express.Router()
const {protect, allow} = require("../middlewares/authMiddleware")
const block = require("../controllers/blockController")


//block entity
router.post("/",protect,allow("admin"),block.blockEntity)

//unblock entity 

router.patch("/unblock",protect,allow("admin"),block.unblockEntity)

module.exports = router