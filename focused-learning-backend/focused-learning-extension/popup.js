// popup.js — ZoneIn Extension Popup
// Handles: Auth, Basic Stats, Focus Toggle

document.addEventListener("DOMContentLoaded", () => {
 
  const API_BASE = "http://localhost:5000/api";

  // ─── DOM References ─────────────────────────────────────────────────────────

  // Screens
  const authScreen = document.getElementById("authScreen");
  const appScreen  = document.getElementById("appScreen");

  // Auth
  const authTabs      = document.querySelectorAll(".auth-tab");
  const loginForm     = document.getElementById("loginForm");
  const registerForm  = document.getElementById("registerForm");
  const loginEmail    = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn      = document.getElementById("loginBtn");
  const loginError    = document.getElementById("loginError");
  const regName       = document.getElementById("regName");
  const regEmail      = document.getElementById("regEmail");
  const regPassword   = document.getElementById("regPassword");
  const registerBtn   = document.getElementById("registerBtn");
  const registerError = document.getElementById("registerError");

  // Stats & Dashboard
  const toggle          = document.getElementById("focusToggle");
  const blockedCountEl  = document.getElementById("blockedCount");
  const watchTimeEl     = document.getElementById("watchTime");
  const dashboardBtn    = document.getElementById("dashboardBtn");
  const focusWarning    = document.getElementById("focusWarning");
  const logoutBtn       = document.getElementById("logoutBtn");

  const DASHBOARD_URL = "http://localhost:5174";

  // ─── API Helper ─────────────────────────────────────────────────────────────

  const getToken = () =>
    new Promise((resolve) =>
      chrome.storage.local.get(["token"], (r) => resolve(r.token || null))
    );

  const apiFetch = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function formatWatchTime(seconds) {
    if (!seconds) return "0m";
    const totalMinutes = Math.floor(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function hideError(el) {
    el.textContent = "";
    el.classList.add("hidden");
  }

  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait…" : btn.dataset.label || btn.textContent;
  }

  // ─── Screen Management ───────────────────────────────────────────────────────

  function showAuth() {
    authScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }

  function showApp() {
    authScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
  }

  // ─── Boot: Check if logged in ────────────────────────────────────────────────

  chrome.storage.local.get(["token"], async (result) => {
    if (result.token) {
      showApp();
      loadLocalStats();
    } else {
      showAuth();
    }
  });

  // ─── Auth Tab Switch ─────────────────────────────────────────────────────────

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      if (tab.dataset.tab === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
      }
      hideError(loginError);
      hideError(registerError);
    });
  });

  // ─── Login ───────────────────────────────────────────────────────────────────

  loginBtn.dataset.label = "Login";
  loginBtn.addEventListener("click", async () => {
    hideError(loginError);
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) return showError(loginError, "Please fill all fields");

    setLoading(loginBtn, true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      chrome.storage.local.set({ token: data.token, authUser: data }, () => {
        showApp();
        loadLocalStats();
      });
    } catch (e) {
      showError(loginError, e.message);
    } finally {
      setLoading(loginBtn, false);
      loginBtn.textContent = "Login";
    }
  });

  // ─── Register ────────────────────────────────────────────────────────────────

  registerBtn.dataset.label = "Create Account";
  registerBtn.addEventListener("click", async () => {
    hideError(registerError);
    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    if (!name || !email || !password) return showError(registerError, "Please fill all fields");
    if (password.length < 6) return showError(registerError, "Password must be at least 6 characters");

    setLoading(registerBtn, true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      chrome.storage.local.set({ token: data.token, authUser: data }, () => {
        showApp();
        loadLocalStats();
      });
    } catch (e) {
      showError(registerError, e.message);
    } finally {
      setLoading(registerBtn, false);
      registerBtn.textContent = "Create Account";
    }
  });

  // Allow Enter key on auth forms
  [loginEmail, loginPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") loginBtn.click(); })
  );
  [regName, regEmail, regPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") registerBtn.click(); })
  );

  // ─── Logout ──────────────────────────────────────────────────────────────────

  logoutBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["token", "authUser", "cachedRoadmap", "activeSessionId"], () => {
      showAuth();
    });
  });

  // ─── Local Stats (from chrome.storage — instant) ─────────────────────────────

  function loadLocalStats() {
    chrome.storage.local.get(["isFocusMode", "blockedCount", "todayWatchTime"], (result) => {
      const isFocus = result.isFocusMode !== false;
      toggle.checked = isFocus;
      
      if (isFocus) {
        focusWarning.classList.add("hidden");
      } else {
        focusWarning.classList.remove("hidden");
      }

      blockedCountEl.textContent = result.blockedCount || 0;
      watchTimeEl.textContent = formatWatchTime(result.todayWatchTime);
    });
  }

  // ─── Focus Mode Toggle ───────────────────────────────────────────────────────

  toggle.addEventListener("change", (e) => {
    const isFocusMode = e.target.checked;
    
    if (isFocusMode) {
      focusWarning.classList.add("hidden");
    } else {
      focusWarning.classList.remove("hidden");
    }

    chrome.storage.local.set({ isFocusMode }, () => {
      chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "TOGGLE_FOCUS_MODE", isFocusMode },
            (response) => { if (chrome.runtime.lastError) {} }
          );
        });
      });
    });
  });

  dashboardBtn.addEventListener("click", () => {
    chrome.storage.local.get(["token"], (result) => {
      const token = result.token || "";
      chrome.tabs.create({ 
        url: `http://localhost:5174?token=${token}` 
      });
    });
  });

  // ─── Real-time Local Stats Listener ──────────────────────────────────────────

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockedCount) {
      blockedCountEl.textContent = changes.blockedCount.newValue || 0;
    }
    if (changes.todayWatchTime) {
      watchTimeEl.textContent = formatWatchTime(changes.todayWatchTime.newValue);
    }
  });

});