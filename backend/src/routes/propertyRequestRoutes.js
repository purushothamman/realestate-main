const express = require("express");
const router = express.Router();

const { protect, allow } = require("../middlewares/authMiddleware");
const propertyRequests = require("../controllers/propertyRequestController");

// Builder request management
router.get(
  "/builder",
  protect,
  allow("builder"),
  propertyRequests.listBuilderRequests
);

router.get(
  "/:id",
  protect,
  allow("builder"),
  propertyRequests.getBuilderRequestById
);

router.put(
  "/:id/approve",
  protect,
  allow("builder"),
  propertyRequests.approveRequest
);

router.put(
  "/:id/reject",
  protect,
  allow("builder"),
  propertyRequests.rejectRequest
);

module.exports = router;

