const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/authMiddleware")
const chat = require("../controllers/chatController")


//sending message
router.post("/:bookingId",protect,chat.sendMessage)

//get messages
router.get("/:bookingId",protect,chat.getMessages)

module.exports = router
