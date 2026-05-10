export const qaMap = {

  // ─── SESSIONS ───────────────────────────────────────────────

  "How do I start a study session?":
    "Go to Study Sessions from the sidebar → click 'Start New Study Session' → enter your study goal → your session timer begins immediately and tracks your focus in real time.",

  "How do I end my session?":
    "In Study Sessions, find your active session row at the top of the table → click the red Stop button (square icon). Your focus score and duration are saved automatically when you end it.",

  "How do I pause my session?":
    "In the active session row in Study Sessions, click the Pause button (two vertical bars). Click it again to resume. Paused time does not count toward your study duration.",

  "What is a study session?":
    "A study session is a timed learning block you start manually. ZoneIn tracks how long you study, how many distractions were blocked by the extension, and calculates your focus score when you end it.",

  "What happens when I end a session?":
    "When you end a session, ZoneIn calculates your focus score, saves your duration, updates your streak, and adds it to your session history. You can view it in Study Sessions and Analytics.",

  "Can I delete a session?":
    "Yes. Go to Study Sessions → find the session in the history table → click the trash icon on the right. You will be asked to confirm before it is deleted.",

  "How do I add subtopics to my session?":
    "When starting a new session via the modal, you can add subtopics. During an active session, each subtopic appears as a toggleable chip — click it to mark it complete and track your progress.",

  "What is the session goal?":
    "The session goal is the topic you type when starting a session (for example: 'Python' or 'React Hooks'). It is displayed in your session history and used to label your activity.",

  // ─── FOCUS SCORE ────────────────────────────────────────────

  "How is my focus score calculated?":
    "Focus Score = 100 − (distractions blocked × 2) + (watch time bonus). Every 5 minutes of watch time adds 1 point. More distractions = lower score. More time watching = higher score. Max is 100.",

  "Why is my focus score low?":
    "Your score drops when the Chrome extension blocks distracting content. Each distraction blocked deducts 2 points. To improve it, stay on topic and let the extension filter out irrelevant videos.",

  "How do I improve my focus score?":
    "Watch more relevant YouTube videos during your session (each 5 minutes adds +1 point) and avoid switching to off-topic content so fewer distractions get blocked.",

  "What is a good focus score?":
    "90–100 is excellent (green), 70–89 is good (yellow), below 70 means there were many distractions (red). Aim for 90+ by staying on topic throughout your session.",

  "Where can I see my focus score?":
    "Your latest focus score appears on the Analytics dashboard as a stat card. Individual session scores are shown in the Study Sessions history table as colored badges.",

  // ─── STREAKS ────────────────────────────────────────────────

  "What is a focus streak?":
    "A focus streak counts the number of consecutive days you have studied without missing a day. It is calculated from your sessions and activity history. Missing a day resets it to zero.",

  "How do I maintain my streak?":
    "Start at least one study session or complete any learning activity (watching a video, completing a topic) every day. ZoneIn checks if you were active today or yesterday to keep your streak alive.",

  "Where can I see my streak?":
    "Your streak appears on your Profile page and in the Chrome Extension dashboard under the flame icon. It also shows in the Analytics summary.",

  "My streak reset, why?":
    "Streaks reset if you miss a full calendar day with no sessions or activity. ZoneIn checks your history daily — if neither today nor yesterday has activity, the streak resets to 0.",

  // ─── ANALYTICS DASHBOARD ────────────────────────────────────

  "Where is the analytics dashboard?":
    "Click 'Analytics' in the left sidebar. You will see your total study hours, focus score, distractions blocked, topics completed, weekly/monthly charts, active roadmaps, and recent activity.",

  "How do I view my weekly study hours?":
    "Open Analytics → the 'Weekly Study Hours' bar chart shows your study time for each day of the current week.",

  "How do I view monthly stats?":
    "Open Analytics → find the 'Monthly Study Hours' chart → use the month dropdown to switch between months. Future months are locked.",

  "What does distractions blocked mean?":
    "This is the count of times the Chrome extension detected and blocked off-topic or distracting YouTube content during your sessions. Fewer blocks = better focus.",

  "What is the topics completed stat?":
    "This shows how many roadmap topics you have marked complete out of your total topics across all roadmaps. The progress bar fills as you complete more.",

  "What is recent activity?":
    "Recent activity logs every video you watched and every note saved. It appears on both the Analytics page and your Profile page with timestamps.",

  // ─── ROADMAPS ───────────────────────────────────────────────

  "What is a roadmap?":
    "A roadmap is an AI-generated structured learning path for a topic you choose (e.g. 'Modern Web Development with React'). It breaks your goal into ordered topics and subtopics.",

  "How do I create a roadmap?":
    "Go to Roadmaps in the sidebar → click 'Generate Roadmap' → type your learning goal → the AI builds a full structured plan for you automatically.",

  "How do I continue a roadmap?":
    "Open Analytics or Roadmaps → find your roadmap → click 'Continue'. You will be taken to the next incomplete topic. You can also click any topic directly from the Roadmap Detail page.",

  "How do I delete a roadmap?":
    "Go to Roadmaps → find the roadmap card → click the three-dot menu (⋮) in the top-right of the card → select Delete. You will see a confirmation before it is permanently removed.",

  "What is roadmap progress?":
    "Progress is shown as a percentage — it is calculated from how many topics you have marked complete out of the total topics in that roadmap. It updates in real time as you complete topics.",

  "Can I have multiple roadmaps?":
    "Yes. You can generate as many roadmaps as you want. Each one is shown as a separate card on the Roadmaps page with its own progress tracking.",

  // ─── NOTEBOOK ───────────────────────────────────────────────

  "What is the notebook?":
    "The Notebook stores all your saved notes — topic notes generated automatically when you complete a topic, and manual notes you write yourself. Find it in the left sidebar.",

  "How do I view my notes?":
    "Go to Notebook in the sidebar. You can filter by 'All Notes', 'Topic Notes' (auto-generated), or 'Manual Notes'. Each note shows its type, date, word count, and full content.",

  "How do I delete a note?":
    "Open the Notebook → find the note → click the trash icon in the bottom-right corner of the note card. You will be asked to confirm.",

  "What are topic notes?":
    "Topic notes are automatically generated summaries saved when you complete a roadmap topic. They appear with a purple badge labeled 'topic notes'.",

  "What are manual notes?":
    "Manual notes are notes you write yourself. They appear with a blue badge labeled 'manual note' in the Notebook.",

  // ─── CHROME EXTENSION ───────────────────────────────────────

  "Why is the extension not working?":
    "Try these steps: (1) Refresh YouTube, (2) Make sure you are logged in on the ZoneIn website, (3) Go to chrome://extensions and confirm the ZoneIn extension is enabled, (4) Click the extension icon and check if Focus Mode is turned on.",

  "How do I enable focus mode in the extension?":
    "Click the ZoneIn extension icon in Chrome → you will see a Focus Mode toggle. Make sure it is ON (purple). When active, the extension filters distracting YouTube content automatically.",

  "Does the extension work on other websites?":
    "Currently the extension only works on YouTube. It monitors your watch activity, blocks off-topic videos, and sends distraction data back to ZoneIn when you end a session.",

  "What does the extension track?":
    "The extension tracks: videos you watch, time spent watching, distracting content blocked, and your active roadmap. This data syncs with ZoneIn to calculate your focus score and update streaks.",

  "How do I see stats in the extension?":
    "Click the ZoneIn extension icon in Chrome. The dashboard shows your current streak (flame icon), distractions blocked (shield icon), watch time (clock icon), and your active roadmap.",

  "How do I delete my roadmap from the extension?":
    "In the extension dashboard, click the three-dot menu next to your active roadmap → select Delete. This removes the roadmap from your extension view.",

  "Why does the extension say I am not logged in?":
    "Open the ZoneIn website and log in first. The extension reads your login token from the site. If you logged out of the website, the extension loses access too.",

  // ─── ACCOUNT & PROFILE ──────────────────────────────────────

  "How do I reset my password?":
    "Go to Settings or Profile → find the Account section → click Change Password. You will need to enter your current password and a new one.",

  "How do I delete my account?":
    "Go to Profile → Settings tab → scroll to the Danger Zone section → click Delete Account. This is permanent and removes all your data including sessions, roadmaps, and notes.",

  "How do I edit my profile?":
    "Go to Profile from the sidebar → click the Edit button → you can update your name, bio, phone, and location. Click Save when done.",

  "Where can I see my profile stats?":
    "Go to Profile → the Overview tab shows your focus streak, completed topics, in-progress topics, and a topic completion pie chart. The Activity tab shows your recent history.",

  "What is the activity heatmap?":
    "The activity heatmap on your Profile page shows the last 14 days of study activity. Each day lights up if you had any session or learning activity that day.",

  // ─── VIDEO FILTERING ────────────────────────────────────────

  "Why are some videos hidden on YouTube?":
    "The ZoneIn Chrome extension uses an ML model to check each video's relevance to your current roadmap topic. Videos marked as not relevant are hidden to keep you focused.",

  "Why is a specific video not showing?":
    "The ML model classified that video as not relevant to your current study topic. If you think it should be visible, make sure your active roadmap topic matches the content.",

  "How does video filtering work?":
    "When you open YouTube with the extension enabled and Focus Mode on, the extension checks each video against your active roadmap topic. Off-topic videos are filtered out automatically.",

};
