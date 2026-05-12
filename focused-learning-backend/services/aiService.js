const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { YoutubeTranscript } = require("youtube-transcript");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const FormData = require("form-data");

ffmpeg.setFfmpegPath(ffmpegStatic);

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

/**
 * Helper to extract Video ID from URL
 */
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Generate a structured learning roadmap for a given topic.
 */
const generateRoadmap = async (goal) => {
  if (!process.env.GROQ_API_KEY) {
    console.log("[AI] No Groq API key found, using fallback roadmap.");
    return generateFallbackRoadmap(goal);
  }

  const prompt = `
You are an expert learning coach. Create a comprehensive, step-by-step learning roadmap for the goal: "${goal}".

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
- Include as many topics as necessary to cover the goal thoroughly (usually between 5 to 20 topics depending on complexity)
- Topics must be ordered from beginner to advanced
- Each topic should be a distinct, learnable unit
- estimatedHours should be realistic (1-12 hours per topic)
- topics array must be ordered (order field starts at 1)
- Do not add any conversational text, only the JSON.
`;

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let text = response.data.choices[0].message.content.trim();
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/\n?```/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/, "").replace(/\n?```/, "");
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("[AI] Roadmap generation failed:", error.response?.data || error.message);
    return generateFallbackRoadmap(goal);
  }
};

/**
 * The Master Pipeline for YouTube AI Notes
 */
const generateAINotesFromVideo = async (videoUrl, statusCallback) => {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  let transcript = "";
  let videoTitle = "";

  const tempAudioPath = path.join(__dirname, `../temp_${videoId}.mp3`);
  try {
    // 1. Get Basic Video Info
    statusCallback("Fetching video info...");
    const info = await ytdl.getBasicInfo(videoUrl);
    videoTitle = info.videoDetails.title;

    // 2. Try Transcript First
    statusCallback("Attempting to fetch direct transcript...");
    try {
      const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = transcriptArr.map((t) => t.text).join(" ");
      console.log("[AI] Direct transcript fetched successfully.");
    } catch (err) {
      console.log("[AI] Direct transcript unavailable, falling back to Whisper.");
      
      // 3. Whisper Fallback
      statusCallback("Transcribing audio with Whisper AI (this may take a minute)...");
      
      const fullInfo = await ytdl.getInfo(videoUrl); // Get full info for formats
      
      await new Promise((resolve, reject) => {
        const stream = ytdl.downloadFromInfo(fullInfo, { 
          quality: "lowestaudio", 
          filter: (format) => format.container === 'mp4' && format.hasAudio && !format.hasVideo 
        });
        
        ffmpeg(stream)
          .audioBitrate(128)
          .toFormat("mp3")
          .save(tempAudioPath)
          .on("end", resolve)
          .on("error", (err) => {
            console.error("FFMPEG Error:", err);
            reject(new Error("FFmpeg conversion failed: " + err.message));
          });
      });

      // Send to Whisper (Groq)
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempAudioPath));
      formData.append("model", "whisper-large-v3");
      formData.append("response_format", "text");

      const whisperResponse = await axios.post(WHISPER_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      });

      transcript = whisperResponse.data;
    }

    if (!transcript) throw new Error("Could not obtain transcript");

    // 4. Generate Summary with Groq
    statusCallback("Generating clean AI study notes...");
    // ... (rest of prompt and generation)
    const prompt = `
Generate comprehensive educational study notes from the following transcript of the video titled "${videoTitle}".

Transcript Snippet: ${transcript.substring(0, 10000)}

Structure the notes as follows:
1. # [Topic Title] - clear bold title
2. ## Quick Overview - 2-3 sentence summary
3. ## Key Concepts - bullet points with bold terms
4. ## Detailed Breakdown - sub-sections with ### headings
5. ## Important Formulas/Definitions - critical rules
6. ## Final Takeaway - pro-tip or summary

Return ONLY the Markdown content. Keep the tone professional and encouraging.
`;

    const summaryResponse = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = summaryResponse.data.choices[0].message.content.trim();
    statusCallback("Saving note...");

    return {
      videoTitle,
      videoUrl,
      transcript: transcript.substring(0, 2000), // Store partial transcript for context
      summary,
    };

  } catch (error) {
    console.error("[AI] Generate AI Notes failed:", error.message);
    throw error;
  } finally {
    if (fs.existsSync(tempAudioPath)) {
      try { fs.unlinkSync(tempAudioPath); } catch (e) { console.error("Temp cleanup failed", e); }
    }
  }
};

/**
 * Generate an AI summary (legacy support)
 */
const generateVideoSummary = async (videoTitle, videoContent) => {
  if (!process.env.GROQ_API_KEY) {
    return `Summary for "${videoTitle}": AI summary is unavailable. Add your Groq API key to enable this feature.`;
  }

  const prompt = `
Summarize the following educational video content into 4-6 key bullet points.
Video Title: "${videoTitle}"
Content: ${videoContent}

Return ONLY a plain text bullet-point summary. Each point starts with "• ".
`;

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("[AI] Summary generation failed:", error.response?.data || error.message);
    return `Could not generate summary for "${videoTitle}".`;
  }
};

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

module.exports = { generateRoadmap, generateVideoSummary, generateAINotesFromVideo };