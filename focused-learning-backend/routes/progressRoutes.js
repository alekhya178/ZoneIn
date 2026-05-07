const express = require("express");
const router = express.Router();
const { toggleTopicCompletion, getProgress } = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

router.patch("/:roadmapId/topic/:topicId", protect, toggleTopicCompletion);
router.get("/:roadmapId", protect, getProgress);

module.exports = router;