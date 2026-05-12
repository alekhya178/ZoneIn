const axios = require("axios");

/**
 * YouTube Service to handle automated video discovery
 * Uses the YouTube Data API v3
 */
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos";

/**
 * Searches for the most relevant educational video for a topic
 * @param {string} topicTitle - The title of the learning topic
 * @returns {object|null} - Video metadata (id, title, duration) or null
 */
const findBestVideo = async (topicTitle) => {
  if (!YOUTUBE_API_KEY) {
    console.warn("[YouTube Service] No API Key found in environment variables.");
    return null;
  }

  try {
    // 1. Search for videos
    const searchResponse = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        part: "snippet",
        maxResults: 1,
        q: `${topicTitle} full tutorial`,
        type: "video",
        videoEmbeddable: "true",
        relevanceLanguage: "en",
        key: YOUTUBE_API_KEY,
      },
    });

    const searchResult = searchResponse.data.items[0];
    if (!searchResult) return null;

    const videoId = searchResult.id.videoId;
    const videoTitle = searchResult.snippet.title;

    // 2. Fetch video details to get duration (ISO 8601 format like PT15M33S)
    const detailResponse = await axios.get(YOUTUBE_VIDEO_URL, {
      params: {
        part: "contentDetails",
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    const durationISO = detailResponse.data.items[0]?.contentDetails?.duration;
    const totalSeconds = parseISODuration(durationISO);

    return {
      videoId,
      videoTitle,
      totalSeconds,
    };
  } catch (error) {
    console.error("[YouTube Service] API Error:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Helper to convert ISO 8601 duration (PT#M#S) to seconds
 */
function parseISODuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = { findBestVideo };
