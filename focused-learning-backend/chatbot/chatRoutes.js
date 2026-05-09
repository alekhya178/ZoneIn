const express = require('express');
const { handleChatRequest } = require('./chatController');

const router = express.Router();

router.post('/chat/learn', handleChatRequest);

module.exports = router;
