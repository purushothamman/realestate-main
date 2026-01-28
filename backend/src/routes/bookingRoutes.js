const express = require("express")
const router = express.Router()
const {protect, allow } = require("../middlewares/authMiddleware")
const booking = require("../controllers/bookingController")

router.post("/:propertyId", protect, allow("user"), booking.createBooking)

router.get("/my-leads", protect, allow("builder","agent","admin"), booking.getMyLeads)

router.patch("/:bookingId/status", protect, allow("builder","agent","admin"), booking.updateBookingStatus)

module.exports = router