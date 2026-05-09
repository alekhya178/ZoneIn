const { OpenAI } = require('openai');

// Note: Ensure OPENAI_API_KEY is set in your environment variables (.env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getLearningAssistantReply(message, topic) {
  const systemPrompt = `You are a focused learning tutor for the FocusLearn platform.
The student is currently studying: ${topic}.
Explain concepts clearly and simply like a patient teacher.
Use analogies and short examples.
Keep answers concise — maximum 150 words.
Do NOT answer questions outside the topic of ${topic}.
If the student asks something off-topic, gently redirect them back to ${topic}.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI API failure');
  }
}

module.exports = {
  getLearningAssistantReply
};
