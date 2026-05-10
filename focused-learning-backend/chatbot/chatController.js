const { getLearningAssistantReply } = require('./learningAssistant');

/**
 * Controller for handling chat requests from the frontend.
 * Accepts conversationHistory from the request body to maintain context.
 */
async function handleLearnChat(req, res) {
  try {
    const { message, topic, userId, conversationHistory = [] } = req.body;

    // Validation
    if (!message || !topic) {
      return res.status(400).json({ 
        success: false, 
        error: "message and topic are required" 
      });
    }

    // Pass message, topic, and the full history to the assistant
    const reply = await getLearningAssistantReply(message, topic, conversationHistory);

    return res.json({ 
      success: true, 
      reply, 
      topic 
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({ 
      success: false, 
      reply: "I'm having trouble connecting right now. Please try again." 
    });
  }
}

module.exports = {
  handleLearnChat
};
