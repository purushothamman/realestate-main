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

// Assign Agent / Hire Agent
router.get("/assign-agent/properties", protect, allow("builder"), builder.getPropertiesForAssign)
router.get("/assign-agent/agents", protect, allow("builder"), builder.getHiredAgents)
router.get("/assign-agent/agents/available", protect, allow("builder"), builder.getAvailableAgents)
router.post("/assign-agent/agents/:agentId/hire", protect, allow("builder"), builder.hireAgent)
router.get("/assign-agent/assignments", protect, allow("builder"), builder.getAssignments)
router.post("/assign-agent/properties/:propertyId/assign", protect, allow("builder"), builder.assignAgentToProperty)
router.delete("/assign-agent/properties/:propertyId/assign", protect, allow("builder"), builder.unassignAgentFromProperty)

// GET /api/builder/hire-requests/:id — get full details of a hire request for builder
router.get(
    "/hire-requests/:id",
    protect,
    allow("builder"),
    builder.getHireRequestById
);

module.exports = router