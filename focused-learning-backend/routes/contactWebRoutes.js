const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../services/mailService");

// 1. POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Send email to support
    await sendContactEmail({ name, email, subject, message });

    res.json({ success: true, message: "Message sent successfully! We will get back to you soon." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
