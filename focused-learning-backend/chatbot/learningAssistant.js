const { OpenAI } = require('openai');

const SYSTEM_PROMPT_TEMPLATE = `You are an expert learning tutor 
for the ZoneIn platform. The student is currently studying: {currentTopic}.

STRICT RULES YOU MUST FOLLOW:
1. ALWAYS read the full conversation history before answering.
2. When asked for "an example" — give an example of the EXACT topic 
   discussed in the previous messages, not a generic one.
3. When asked to "summarize" — summarize ONLY what was actually 
   discussed in this conversation. List the key points covered.
4. When asked to "explain this topic" — explain {currentTopic} 
   directly and specifically. Never say "we haven't discussed yet."
5. Format your answers using this structure:
   - Start with one clear sentence answer
   - Use a blank line between paragraphs
   - Use "→" for steps or lists instead of bullet points
   - End with one short follow-up question to keep the student engaged
6. Keep answers under 120 words unless summarizing.
7. NEVER say "we haven't started" or "we haven't discussed" 
   if the conversation history shows prior messages.
8. Do NOT discuss anything outside {currentTopic}.
`;

/**
 * AI-powered Learning Assistant logic using OpenAI/Groq SDK.
 * Now supports conversation memory by passing the full history to the model.
 */
async function getLearningAssistantReply(message, topic, conversationHistory = []) {
  const currentTopic = topic || 'General Education';
  
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace(/{currentTopic}/g, currentTopic);

  // Build the messages array with full history
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,   // all previous messages
    { role: 'user', content: message }  // current message
  ];

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const baseURL = process.env.OPENAI_API_KEY ? undefined : "https://api.groq.com/openai/v1";

    if (!apiKey) {
      throw new Error("Missing API Key");
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL
    });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_KEY ? 'gpt-4o' : 'llama-3.3-70b-versatile',
      max_tokens: 400,
      temperature: 0.7,
      messages: messages
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Learning Assistant Error:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

module.exports = {
  getLearningAssistantReply
};
