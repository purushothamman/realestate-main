const express = require("express");
const router = express.Router();
const { protect, allow } = require("../middlewares/authMiddleware");
const agent = require("../controllers/agentController");

// Agent: respond to builder hire requests
router.post(
    "/hire-requests/:id/accept",
    protect,
    allow("agent"),
    agent.acceptHireRequest
);

router.post(
    "/hire-requests/:id/reject",
    protect,
    allow("agent"),
    agent.rejectHireRequest
);

// GET /api/agent/hire-requests/:id — get full details of a hire request
router.get(
    "/hire-requests/:id",
    protect,
    allow("agent"),
    agent.getHireRequestById
);

// GET /api/agent/my-builders — builders who have hired the logged-in agent
router.get(
    "/my-builders",
    protect,
    allow("agent"),
    agent.getMyBuilders
);

// GET /api/agent/dashboard-stats
router.get(
    "/dashboard-stats",
    protect,
    allow("agent"),
    agent.getAgentDashboardStats
);

module.exports = router;

