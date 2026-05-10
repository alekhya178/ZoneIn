const express = require('express');
const { handleLearnChat } = require('./chatController');

const router = express.Router();

// POST /api/chat/learn
router.post('/chat/learn', handleLearnChat);

module.exports = router;
