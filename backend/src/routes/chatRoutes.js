const express = require("express")
const router = express.Router()
const { protect } = require("../middlewares/authMiddleware")
const chat = require("../controllers/chatController")


//sending message
router.post("/:chatId", protect, chat.sendMessage)

//get messages
router.get("/:chatId", protect, chat.getMessages)
// for chat list
router.get("/", protect, chat.getAllChats);


module.exports = router
