// api.js — ZoneIn Extension Backend API Helper
// Shared by background.js, popup.js, content.js

const API_BASE = "http://localhost:5000/api"; // Change to your deployed URL

// ─── Token helpers (chrome.storage.local) ─────────────────────────────────────

const getToken = () =>
  new Promise((resolve) => {
    chrome.storage.local.get(["token"], (r) => resolve(r.token || null));
  });

const setToken = (token) =>
  new Promise((resolve) => chrome.storage.local.set({ token }, resolve));

const clearAuth = () =>
  new Promise((resolve) =>
    chrome.storage.local.remove(["token", "authUser", "activeSessionId"], resolve)
  );

// ─── Base fetch ────────────────────────────────────────────────────────────────

const apiFetch = async (endpoint, options = {}) => {
  const token = await getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? options.body : undefined,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "API error");
  return data;
};

// ─── Auth ──────────────────────────────────────────────────────────────────────

const login = async (email, password) => {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  await new Promise((resolve) =>
    chrome.storage.local.set({ authUser: data }, resolve)
  );
  return data;
};

const register = async (name, email, password) => {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  await setToken(data.token);
  await new Promise((resolve) =>
    chrome.storage.local.set({ authUser: data }, resolve)
  );
  return data;
};

const logout = async () => {
  await clearAuth();
};

// ─── Roadmap ───────────────────────────────────────────────────────────────────

const getActiveRoadmap = () => apiFetch("/roadmap/active");

// ─── Sessions ──────────────────────────────────────────────────────────────────

const startBackendSession = async (roadmapId, goal) => {
  const session = await apiFetch("/session/start", {
    method: "POST",
    body: JSON.stringify({ roadmapId, goal }),
  });
  await new Promise((resolve) =>
    chrome.storage.local.set({ activeSessionId: session._id }, resolve)
  );
  return session;
};

const endBackendSession = async (distractionsBlocked, videosWatched) => {
  const { activeSessionId } = await new Promise((resolve) =>
    chrome.storage.local.get(["activeSessionId"], resolve)
  );
  if (!activeSessionId) return null;

  const result = await apiFetch(`/session/${activeSessionId}/end`, {
    method: "PATCH",
    body: JSON.stringify({ distractionsBlocked, videosWatched }),
  });
  await new Promise((resolve) =>
    chrome.storage.local.remove(["activeSessionId"], resolve)
  );
  return result;
};

// ─── Analytics ─────────────────────────────────────────────────────────────────

const getDashboard = () => apiFetch("/analytics/dashboard");
const getWeeklyData = () => apiFetch("/analytics/weekly");

// ─── Progress ──────────────────────────────────────────────────────────────────

const toggleTopic = (roadmapId, topicId) =>
  apiFetch(`/progress/${roadmapId}/topic/${topicId}`, { method: "PATCH" });

const getProgress = (roadmapId) => apiFetch(`/progress/${roadmapId}`);