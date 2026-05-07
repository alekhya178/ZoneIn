const axios = require("axios");

/**
 * Generate a structured learning roadmap for a given topic.
 * Uses OpenAI GPT. If you don't have an OpenAI key, the fallback
 * generateFallbackRoadmap() returns a static structure.
 */
const generateRoadmap = async (goal) => {
  // If no OpenAI key is set, use fallback
  if (!process.env.OPENAI_API_KEY) {
    console.log("[AI] No OpenAI key found, using fallback roadmap.");
    return generateFallbackRoadmap(goal);
  }

  const prompt = `
You are an expert learning coach. Create a detailed step-by-step learning roadmap for the topic: "${goal}".

Return ONLY a JSON object in this exact format (no extra text):
{
  "description": "One sentence overview of this learning path",
  "topics": [
    {
      "title": "Topic title",
      "description": "What this topic covers in 1-2 sentences",
      "order": 1,
      "estimatedHours": 3
    }
  ]
}

Rules:
- Include 8 to 12 topics, ordered from beginner to advanced
- Each topic should be a distinct, learnable unit
- estimatedHours should be realistic (1-10 hours per topic)
- topics array must be ordered (order field starts at 1)
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("[AI] Roadmap generation failed:", error.message);
    return generateFallbackRoadmap(goal);
  }
};

/**
 * Generate an AI summary of a YouTube video by its transcript/description.
 * Pass the video title + description or transcript text.
 */
const generateVideoSummary = async (videoTitle, videoContent) => {
  if (!process.env.OPENAI_API_KEY) {
    return `Summary for "${videoTitle}": AI summary is unavailable. Add your OpenAI API key to enable this feature.`;
  }

  const prompt = `
Summarize the following educational video content into 4-6 key bullet points.
Video Title: "${videoTitle}"
Content: ${videoContent}

Return ONLY a plain text bullet-point summary. Each point starts with "• ".
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("[AI] Summary generation failed:", error.message);
    return `Could not generate summary for "${videoTitle}".`;
  }
};

// ─── Fallback Roadmap (no API key needed) ────────────────────────────────────
const generateFallbackRoadmap = (goal) => {
  return {
    description: `A structured learning path to master ${goal} from beginner to advanced.`,
    topics: [
      { title: `Introduction to ${goal}`, description: `Overview, history, and why ${goal} matters.`, order: 1, estimatedHours: 2 },
      { title: "Setting Up Your Environment", description: "Install tools, editors, and dependencies.", order: 2, estimatedHours: 1 },
      { title: "Core Fundamentals", description: "Master the foundational concepts.", order: 3, estimatedHours: 4 },
      { title: "Data Structures & Logic", description: "Learn how data is organized and processed.", order: 4, estimatedHours: 5 },
      { title: "Functions & Modularity", description: "Break problems into reusable components.", order: 5, estimatedHours: 3 },
      { title: "Intermediate Concepts", description: "Deeper dive into key patterns and techniques.", order: 6, estimatedHours: 6 },
      { title: "Working with Libraries", description: "Use popular libraries and frameworks.", order: 7, estimatedHours: 4 },
      { title: "Building Real Projects", description: "Apply your knowledge with hands-on projects.", order: 8, estimatedHours: 8 },
      { title: "Testing & Debugging", description: "Write tests and debug effectively.", order: 9, estimatedHours: 3 },
      { title: "Advanced Topics", description: "Performance, optimization, and best practices.", order: 10, estimatedHours: 6 },
    ],
  };
};

module.exports = { generateRoadmap, generateVideoSummary };