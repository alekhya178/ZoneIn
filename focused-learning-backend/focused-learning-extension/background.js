// Background service worker for ZoneIn Extension
// Now syncs sessions to backend when user is logged in

let watchTimeInterval = null;
let activeYoutubeTabId = null;

// Session Tracking Variables
let currentSession = null;
let sessionIdleTimeout = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ─── API helpers (inline — service workers can't import scripts) ──────────────

const API_BASE = "http://localhost:5000/api"; // Change to your deployed URL

const getToken = () =>
  new Promise((resolve) =>
    chrome.storage.local.get(["token"], (r) => resolve(r.token || null))
  );

const apiFetch = async (endpoint, options = {}) => {
  try {
    const token = await getToken();
    if (!token) return null; // Not logged in — skip backend sync silently

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    // Backend offline or network error — local tracking continues unaffected
    return null;
  }
};

// ─── Initialize defaults and alarms on extension install ─────────────────────

chrome.runtime.onInstalled.addListener(() => {
  initializeStorage();
  setupDailyResetAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  checkDailyReset();
  setupDailyResetAlarm();
});

function getTodayString() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initializeStorage() {
  chrome.storage.local.get(
    ["isFocusMode", "blockedCount", "watchTime", "todayWatchTime", "lastResetDate", "sessions", "dailyHistory"],
    (result) => {
      const today = getTodayString();
      const updates = {
        isFocusMode: result.isFocusMode !== undefined ? result.isFocusMode : true,
        blockedCount: result.blockedCount || 0,
        watchTime: result.watchTime || 0,
        todayWatchTime: result.todayWatchTime || 0,
        lastResetDate: result.lastResetDate || today,
        sessions: result.sessions || [],
        dailyHistory: result.dailyHistory || [],
      };
      chrome.storage.local.set(updates, () => {
        checkDailyReset();
      });
    }
  );
}

function setupDailyResetAlarm() {
  chrome.alarms.get("dailyReset", (alarm) => {
    if (!alarm) {
      chrome.alarms.create("dailyReset", { periodInMinutes: 60 });
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "dailyReset") {
    checkDailyReset();
  }
});

function calculateFocusScore(watchTimeSeconds, blockedCount) {
  const timeBonus = Math.floor(watchTimeSeconds / 300);
  const distractionPenalty = blockedCount * 2;
  return Math.min(100, Math.max(0, 100 - distractionPenalty + timeBonus));
}

function checkDailyReset() {
  chrome.storage.local.get(
    ["lastResetDate", "todayWatchTime", "blockedCount", "dailyHistory"],
    (result) => {
      const today = getTodayString();
      const lastReset = result.lastResetDate;

      if (lastReset && lastReset !== today) {
        const score = calculateFocusScore(result.todayWatchTime || 0, result.blockedCount || 0);

        const newHistoryEntry = {
          date: lastReset,
          watchTimeSeconds: result.todayWatchTime || 0,
          blockedCount: result.blockedCount || 0,
          focusScore: score,
        };

        let history = result.dailyHistory || [];
        history.push(newHistoryEntry);
        if (history.length > 30) history = history.slice(history.length - 30);

        chrome.storage.local.set({
          dailyHistory: history,
          todayWatchTime: 0,
          blockedCount: 0,
          lastResetDate: today,
        });

        endSession();
      }
    }
  );
}

// ─── Session Management ───────────────────────────────────────────────────────

async function startSession() {
  if (currentSession) return;

  currentSession = {
    sessionId: `session-${Date.now()}`,
    date: getTodayString(),
    startTime: new Date().toISOString(),
    watchTimeSeconds: 0,
    distractionsBlocked: 0,
  };
  chrome.storage.local.set({ currentSession });

  // ── Sync to backend ──────────────────────────────────────────────────────
  try {
    // Get active roadmap ID + goal if available (cached from popup)
    const { cachedRoadmap } = await new Promise((resolve) =>
      chrome.storage.local.get(["cachedRoadmap"], resolve)
    );

    const roadmapId = cachedRoadmap?._id || null;
    const goal = cachedRoadmap?.goal || "";

    const backendSession = await apiFetch("/session/start", {
      method: "POST",
      body: JSON.stringify({ roadmapId, goal }),
    });

    if (backendSession) {
      await new Promise((resolve) =>
        chrome.storage.local.set({ activeSessionId: backendSession._id }, resolve)
      );
    }
  } catch (e) {
    // Backend sync failed — local tracking still works
  }
}

async function endSession() {
  if (!currentSession) return;

  // Finalize local session
  chrome.storage.local.get(["sessions"], (result) => {
    currentSession.focusScore = calculateFocusScore(
      currentSession.watchTimeSeconds,
      currentSession.distractionsBlocked
    );

    const sessions = result.sessions || [];
    sessions.push(currentSession);

    chrome.storage.local.set({ sessions, currentSession: null });
    currentSession = null;
  });

  // ── Sync end to backend ──────────────────────────────────────────────────
  try {
    const { activeSessionId } = await new Promise((resolve) =>
      chrome.storage.local.get(["activeSessionId"], resolve)
    );

    if (activeSessionId) {
      const { blockedCount } = await new Promise((resolve) =>
        chrome.storage.local.get(["blockedCount"], resolve)
      );

      await apiFetch(`/session/${activeSessionId}/end`, {
        method: "PATCH",
        body: JSON.stringify({
          distractionsBlocked: currentSession?.distractionsBlocked || blockedCount || 0,
          videosWatched: 0,
        }),
      });

      await new Promise((resolve) =>
        chrome.storage.local.remove(["activeSessionId"], resolve)
      );
    }
  } catch (e) {
    // Backend sync failed silently
  }
}

function resetIdleTimeout() {
  if (sessionIdleTimeout) clearTimeout(sessionIdleTimeout);
  sessionIdleTimeout = setTimeout(() => {
    endSession();
  }, IDLE_TIMEOUT_MS);
}

// ─── Storage Change Listener ──────────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isFocusMode) {
    if (changes.isFocusMode.newValue) {
      startSession();
    } else {
      endSession();
    }
  }
  if (changes.blockedCount && currentSession) {
    const oldVal = changes.blockedCount.oldValue || 0;
    const newVal = changes.blockedCount.newValue || 0;
    const diff = newVal - oldVal;
    if (diff > 0) {
      currentSession.distractionsBlocked += diff;
      chrome.storage.local.set({ currentSession });
    }
  }
});

// ─── Message Listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VIDEO_PLAYING") {
    startSession();
    resetIdleTimeout();
    if (sender.tab && sender.tab.id) startTracking(sender.tab.id);
  } else if (message.type === "VIDEO_PAUSED") {
    stopTracking();
    resetIdleTimeout();
  }
  sendResponse({ received: true });
  return true;
});

// ─── Tab / Window Listeners ───────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeYoutubeTabId === tabId) stopTracking();
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || tabs.length === 0) return;
      const tab = tabs[0];
      if (tab.url && tab.url.includes("youtube.com/watch")) {
        chrome.tabs.sendMessage(tab.id, { type: "CHECK_PLAY_STATE" }, (response) => {
          if (chrome.runtime.lastError) return;
          if (response && response.isPlaying) startTracking(tab.id);
        });
      }
    });
  }
});

// ─── Watch Time Tracking ──────────────────────────────────────────────────────

function startTracking(tabId) {
  if (activeYoutubeTabId === tabId && watchTimeInterval) return;
  stopTracking();
  activeYoutubeTabId = tabId;

  watchTimeInterval = setInterval(() => {
    chrome.storage.local.get(["watchTime", "todayWatchTime", "isFocusMode"], (result) => {
      if (chrome.runtime.lastError) return;
      if (result.isFocusMode !== false) {
        chrome.storage.local.set({
          watchTime: (result.watchTime || 0) + 1,
          todayWatchTime: (result.todayWatchTime || 0) + 1,
        });
        if (currentSession) {
          currentSession.watchTimeSeconds += 1;
          chrome.storage.local.set({ currentSession });
        }
      }
    });
  }, 1000);
}

function stopTracking() {
  if (watchTimeInterval) {
    clearInterval(watchTimeInterval);
    watchTimeInterval = null;
    activeYoutubeTabId = null;
  }
}

// ─── Tab Update Listener ──────────────────────────────────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    if (tab.url && tab.url.includes("youtube.com")) {
      checkDailyReset();
    }
  }
});