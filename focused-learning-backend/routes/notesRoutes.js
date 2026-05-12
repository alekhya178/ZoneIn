const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { generateAINotes, createNote, getNotes, deleteNote } = require("../controllers/notesController");

router.use(protect);

router.post("/generate", generateAINotes);
router.post("/", createNote);
router.get("/", getNotes);
router.get("/:roadmapId", getNotes);
router.delete("/:id", deleteNote);

module.exports = router;