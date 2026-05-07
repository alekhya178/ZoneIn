const express = require("express");

const router = express.Router();

// Generate roadmap
router.post("/generate", async (req, res) => {
  try {
    const { goal } = req.body;

    const roadmap = {
      goal,
      topics: [
        "Introduction",
        "Basics",
        "Intermediate Concepts",
        "Projects",
        "Advanced Concepts",
      ],
    };

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get active roadmap
router.get("/active", (req, res) => {
  res.json({
    success: true,
    roadmap: {
      goal: "Machine Learning",
      progress: 40,
      topics: [
        {
          title: "Python Basics",
          completed: true,
        },
        {
          title: "NumPy",
          completed: true,
        },
        {
          title: "Pandas",
          completed: false,
        },
      ],
    },
  });
});

module.exports = router;