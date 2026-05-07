// Content Script for ZoneIn Extension — Runs on YouTube pages
// Now uses active roadmap goal from backend for smarter filtering

let isFocusMode = true;
let hasLoadedFilters = false;
let focusMessageEl = null;
let activeGoalKeywords = []; // Populated from backend roadmap
const hiddenElements = new Set();

const API_BASE = "http://localhost:5000/api";

// ─── Fetch active roadmap goal from backend ───────────────────────────────────

async function fetchActiveGoal() {
  try {
    const { token } = await new Promise((resolve) =>
      chrome.storage.local.get(["token"], resolve)
    );
    if (!token) return;

    const response = await fetch(`${API_BASE}/roadmap/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;

    const roadmap = await response.json();

    // Cache the roadmap for background.js to use too
    chrome.storage.local.set({ cachedRoadmap: roadmap });

    // Extract keywords from the goal + topic titles
    const goalWords = roadmap.goal.toLowerCase().split(" ");
    const topicWords = (roadmap.topics || [])
      .slice(0, 5) // Use first 5 topics as additional keywords
      .map((t) => t.title.toLowerCase().split(" "))
      .flat();

    const stopWords = ["a", "an", "the", "and", "or", "how", "to", "in", "of", "for", "is", "learn"];
    const allWords = [...new Set([...goalWords, ...topicWords])];
    activeGoalKeywords = allWords.filter((w) => w.length > 2 && !stopWords.includes(w));

  } catch (e) {
    // Backend offline — fall back to URL keyword filtering (existing behavior)
  }
}

// ─── Initialize state from storage ───────────────────────────────────────────

chrome.storage.local.get(["isFocusMode"], async (result) => {
  if (result.isFocusMode !== undefined) {
    isFocusMode = result.isFocusMode;
  }
  await fetchActiveGoal(); // Load goal from backend on page load
  hasLoadedFilters = true;
  if (isFocusMode) applyFilters();
});

// ─── Message Listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_FOCUS_MODE") {
    isFocusMode = message.isFocusMode;
    if (isFocusMode) {
      fetchActiveGoal().then(() => applyFilters());
    } else {
      removeFilters();
    }
    sendResponse({ success: true });
  } else if (message.type === "CHECK_PLAY_STATE") {
    const video = document.querySelector("video");
    sendResponse({ isPlaying: video ? !video.paused && !video.ended : false });
  } else if (message.type === "ROADMAP_UPDATED") {
    // Called from popup when user generates a new roadmap
    fetchActiveGoal().then(() => {
      if (isFocusMode) applyFilters();
    });
    sendResponse({ success: true });
  }
  return true;
});

// ─── MutationObserver with debounce ──────────────────────────────────────────

let debounceTimer;
const observer = new MutationObserver(() => {
  if (!hasLoadedFilters) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    attachVideoListeners();
    if (isFocusMode) applyFilters();
  }, 150);
});

observer.observe(document.documentElement, { childList: true, subtree: true });

// ─── Video Event Listeners ────────────────────────────────────────────────────

function attachVideoListeners() {
  document.querySelectorAll("video").forEach((video) => {
    if (!video.dataset.zoneinTracked) {
      video.dataset.zoneinTracked = "true";

      video.addEventListener("play", () => {
        try {
          chrome.runtime.sendMessage({ type: "VIDEO_PLAYING" }, (response) => {
            if (chrome.runtime.lastError) {}
          });
        } catch (e) {}
      });

      video.addEventListener("pause", () => {
        try {
          chrome.runtime.sendMessage({ type: "VIDEO_PAUSED" }, (response) => {
            if (chrome.runtime.lastError) {}
          });
        } catch (e) {}
      });

      video.addEventListener("ended", () => {
        try {
          chrome.runtime.sendMessage({ type: "VIDEO_PAUSED" }, (response) => {
            if (chrome.runtime.lastError) {}
          });
        } catch (e) {}
      });
    }
  });
}

// ─── Blocked Count Helper ─────────────────────────────────────────────────────

function incrementBlockedCount(count) {
  if (count <= 0) return;
  chrome.storage.local.get(["blockedCount"], (result) => {
    if (chrome.runtime.lastError) return;
    chrome.storage.local.set({ blockedCount: (result.blockedCount || 0) + count });
  });
}

// ─── Core Filter Logic ────────────────────────────────────────────────────────

function applyFilters() {
  let newlyBlocked = 0;
  const currentUrl = window.location.href;

  // 1. Ads & Sponsored Content
  const adSelectors = [
    "ytd-display-ad-renderer",
    "ytd-promoted-video-renderer",
    "ytd-ad-slot-renderer",
    "ytd-in-feed-ad-layout-renderer",
  ];
  adSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.style.display !== "none") {
        el.style.display = "none";
        hiddenElements.add(el);
        newlyBlocked++;
      }
    });
  });

  document.querySelectorAll("ytd-video-renderer, ytd-rich-item-renderer").forEach((video) => {
    const badge = video.querySelector(".badge-shape-wiz__text, .ytd-badge-supported-renderer");
    if (badge) {
      const badgeText = badge.textContent.trim().toLowerCase();
      if (badgeText === "sponsored" || badgeText === "ad") {
        if (video.style.display !== "none") {
          video.style.display = "none";
          hiddenElements.add(video);
          newlyBlocked++;
        }
      }
    }
  });

  // 2. Sidebar Distractions & Shorts
  const sidebarSelectors = [
    "#related",
    "ytd-watch-next-secondary-results-renderer",
    ".html5-endscreen",
    "ytd-reel-shelf-renderer",
    'ytd-rich-shelf-renderer[is-shorts]',
    'a[title="Shorts"]',
    'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
  ];
  sidebarSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.style.display !== "none") {
        el.style.display = "none";
        hiddenElements.add(el);
        newlyBlocked++;
      }
    });
  });

  // 3. Home Page
  const isHomePage =
    currentUrl === "https://www.youtube.com/" ||
    currentUrl.startsWith("https://www.youtube.com/?");

  if (isHomePage) {
    ["ytd-rich-grid-renderer", 'ytd-browse[page-subtype="home"]'].forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.style.display !== "none") {
          el.style.display = "none";
          hiddenElements.add(el);
          newlyBlocked++;
        }
      });
    });
    showFocusMessage();
  } else {
    hideFocusMessage();
  }

  // 4. Search Page — now uses backend roadmap keywords when available
  if (currentUrl.includes("/results?search_query=")) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("search_query");

    // Build keyword list: prefer backend roadmap keywords, fall back to URL query
    let checkKeywords = activeGoalKeywords;

    if (checkKeywords.length === 0 && query) {
      const queryStr = decodeURIComponent(query).toLowerCase();
      const stopWords = ["a", "an", "the", "and", "or", "how", "to", "in", "of", "for", "is"];
      const allKeywords = queryStr.split(" ").map((k) => k.trim()).filter((k) => k.length > 0);
      const filtered = allKeywords.filter((k) => !stopWords.includes(k));
      checkKeywords = filtered.length > 0 ? filtered : allKeywords;
    }

    const trustedChannels = [
      "freecodecamp", "mit opencourseware", "cs dojo", "traversy media",
      "the coding train", "sentdex", "corey schafer", "tech with tim",
      "khan academy", "fireship",
    ];

    Array.from(document.querySelectorAll("ytd-video-renderer")).forEach((video, index) => {
      const titleEl = video.querySelector("#video-title");
      const channelEl = video.querySelector("#channel-name");
      if (!titleEl) return;

      const titleText = titleEl.textContent.toLowerCase();
      const channelText = channelEl ? channelEl.textContent.trim().toLowerCase() : "";

      const isTrustedChannel = trustedChannels.some((ch) => channelText.includes(ch));
      const isRelevantTitle = checkKeywords.some((keyword) => titleText.includes(keyword));
      const isTopResult = index < 10;
      const isRelevant = isTrustedChannel || isRelevantTitle || isTopResult;

      if (!isRelevant && video.style.display !== "none") {
        video.style.display = "none";
        hiddenElements.add(video);
        newlyBlocked++;
      } else if (isRelevant && video.style.display === "none") {
        video.style.display = "";
        hiddenElements.delete(video);
      }

      if (isRelevant && isFocusMode && !video.querySelector(".zonein-badge")) {
        const badge = document.createElement("span");
        badge.className = "zonein-badge";
        badge.textContent = "🎓";
        badge.title = "Educational video";
        badge.style.cssText =
          "position:absolute;top:10px;right:10px;font-size:20px;z-index:10;pointer-events:none;";
        const thumbnail = video.querySelector("#thumbnail");
        if (thumbnail) {
          thumbnail.style.position = "relative";
          thumbnail.appendChild(badge);
        }
      }
    });
  }

  incrementBlockedCount(newlyBlocked);
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function showFocusMessage() {
  if (!focusMessageEl) {
    focusMessageEl = document.createElement("div");
    focusMessageEl.id = "zonein-focus-message";
    focusMessageEl.innerHTML = `
      <h2 style="margin:0 0 10px;font-size:32px;">🎯 Focus Mode is ON</h2>
      <p style="margin:0;font-size:20px;color:#cccccc;">Search for a topic to start learning.</p>
    `;
    focusMessageEl.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      color:#ffffff;z-index:9999;background:#181818;padding:40px 60px;
      border-radius:16px;border:2px solid #4facfe;
      box-shadow:0 10px 30px rgba(0,0,0,0.8);text-align:center;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      pointer-events:none;
    `;
    document.body.appendChild(focusMessageEl);
  }
  focusMessageEl.style.display = "block";
}

function hideFocusMessage() {
  if (focusMessageEl) focusMessageEl.style.display = "none";
}

function removeFilters() {
  hiddenElements.forEach((el) => {
    if (el && el.style) el.style.display = "";
  });
  hiddenElements.clear();
  document.querySelectorAll("ytd-video-renderer, ytd-rich-item-renderer").forEach((el) => {
    el.style.display = "";
  });
  hideFocusMessage();
}