const { getLearningAssistantReply } = require('./learningAssistant');

async function handleChatRequest(req, res) {
  // Validate Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized. Please log in again." });
  }

  // Validate required fields
  const { message, topic, userId } = req.body;
  if (!message || !topic || !userId) {
    return res.status(400).json({ error: "Missing required fields: message, topic, userId" });
  }

  try {
    const reply = await getLearningAssistantReply(message, topic);
    return res.status(200).json({
      reply: reply,
      topic: topic
    });
  } catch (error) {
    if (error.message === 'OpenAI API failure') {
      return res.status(500).json({ error: "I'm having trouble connecting right now. Please try again in a moment." });
    }
    console.error("Unexpected error in chat controller:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

module.exports = {
  handleChatRequest
};
