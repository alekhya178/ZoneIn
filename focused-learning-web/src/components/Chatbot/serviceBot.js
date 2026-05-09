import { QA_DATA } from './serviceBotData.js';

export function getServiceBotReply(userMessage) {
  if (!userMessage) return getFallbackMessage();

  // Normalize: convert to lowercase, strip punctuation
  const normalizedInput = userMessage.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  for (const entry of QA_DATA) {
    for (const keyword of entry.keywords) {
      if (normalizedInput.includes(keyword.toLowerCase())) {
        return entry.answer;
      }
    }
  }

  return getFallbackMessage();
}

function getFallbackMessage() {
  return "I couldn't find an answer for that. You can ask me about: sessions, the 40-minute timer, focus score, video filtering, the Chrome extension, or your account settings.";
}
