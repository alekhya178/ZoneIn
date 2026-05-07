const express = require("express");
const router = express.Router();
const { createRoadmap, getActiveRoadmap, getRoadmaps, deleteRoadmap } = require("../controllers/roadmapController");
const { protect } = require("../middleware/auth");

router.post("/generate", protect, createRoadmap);
router.get("/active", protect, getActiveRoadmap);
router.get("/", protect, getRoadmaps);
router.delete("/:id", protect, deleteRoadmap);

module.exports = router;