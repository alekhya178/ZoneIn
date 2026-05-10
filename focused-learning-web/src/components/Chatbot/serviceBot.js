import { qaMap } from './serviceBotData';

// ─── KEYWORD MAP ─────────────────────────────────────────────
// Maps trigger words/phrases → exact qaMap keys
// The first keyword that matches the user input wins
// Add more keywords here as needed

const keywordMap = [

  // SESSIONS
  { keywords: ['start session', 'begin session', 'new session', 'how to start', 'start study'],
    key: 'How do I start a study session?' },
  { keywords: ['end session', 'stop session', 'finish session', 'how to end'],
    key: 'How do I end my session?' },
  { keywords: ['pause session', 'pause study', 'how to pause'],
    key: 'How do I pause my session?' },
  { keywords: ['what is session', 'what is a session', 'what is study session', 'explain session'],
    key: 'What is a study session?' },
  { keywords: ['after session', 'when session ends', 'session end what', 'what happens end'],
    key: 'What happens when I end a session?' },
  { keywords: ['delete session', 'remove session'],
    key: 'Can I delete a session?' },
  { keywords: ['subtopic', 'sub topic', 'add topic session'],
    key: 'How do I add subtopics to my session?' },
  { keywords: ['session goal', 'what is goal'],
    key: 'What is the session goal?' },

  // FOCUS SCORE
  { keywords: ['focus score', 'score calculated', 'how score works', 'how is score', 'explain score', 'score formula'],
    key: 'How is my focus score calculated?' },
  { keywords: ['score low', 'why low score', 'bad score', 'score dropped'],
    key: 'Why is my focus score low?' },
  { keywords: ['improve score', 'increase score', 'better score', 'boost score'],
    key: 'How do I improve my focus score?' },
  { keywords: ['good score', 'what is good score', 'score range'],
    key: 'What is a good focus score?' },
  { keywords: ['see score', 'view score', 'where score', 'find score'],
    key: 'Where can I see my focus score?' },

  // STREAKS
  { keywords: ['streak', 'focus streak', 'what is streak', 'explain streak', 'about streak'],
    key: 'What is a focus streak?' },
  { keywords: ['maintain streak', 'keep streak', 'streak going', 'not lose streak'],
    key: 'How do I maintain my streak?' },
  { keywords: ['see streak', 'where streak', 'view streak', 'find streak'],
    key: 'Where can I see my streak?' },
  { keywords: ['streak reset', 'streak broke', 'streak gone', 'why reset', 'streak lost', 'lost streak'],
    key: 'My streak reset, why?' },

  // ANALYTICS
  { keywords: ['analytics', 'dashboard', 'where analytics', 'open analytics', 'find analytics'],
    key: 'Where is the analytics dashboard?' },
  { keywords: ['weekly hours', 'weekly study', 'this week', 'week chart'],
    key: 'How do I view my weekly study hours?' },
  { keywords: ['monthly', 'monthly stats', 'monthly hours', 'month chart'],
    key: 'How do I view monthly stats?' },
  { keywords: ['distraction', 'distractions blocked', 'what is distraction', 'blocked mean'],
    key: 'What does distractions blocked mean?' },
  { keywords: ['topics completed', 'completed stat', 'completion stat'],
    key: 'What is the topics completed stat?' },
  { keywords: ['recent activity', 'activity log', 'what is activity'],
    key: 'What is recent activity?' },

  // ROADMAPS
  { keywords: ['what is roadmap', 'explain roadmap', 'about roadmap'],
    key: 'What is a roadmap?' },
  { keywords: ['create roadmap', 'make roadmap', 'generate roadmap', 'new roadmap', 'how roadmap'],
    key: 'How do I create a roadmap?' },
  { keywords: ['continue roadmap', 'resume roadmap', 'pick up roadmap'],
    key: 'How do I continue a roadmap?' },
  { keywords: ['delete roadmap', 'remove roadmap'],
    key: 'How do I delete a roadmap?' },
  { keywords: ['roadmap progress', 'progress roadmap', 'roadmap percentage'],
    key: 'What is roadmap progress?' },
  { keywords: ['multiple roadmap', 'many roadmaps', 'more than one roadmap'],
    key: 'Can I have multiple roadmaps?' },

  // NOTEBOOK
  { keywords: ['notebook', 'what is notebook', 'explain notebook', 'about notebook'],
    key: 'What is the notebook?' },
  { keywords: ['view notes', 'see notes', 'find notes', 'where notes'],
    key: 'How do I view my notes?' },
  { keywords: ['delete note', 'remove note'],
    key: 'How do I delete a note?' },
  { keywords: ['topic notes', 'what are topic notes'],
    key: 'What are topic notes?' },
  { keywords: ['manual notes', 'manual note', 'what are manual'],
    key: 'What are manual notes?' },

  // CHROME EXTENSION
  { keywords: ['extension not working', 'extension broken', 'extension problem', 'extension error',
                'extension issue', 'why extension', 'fix extension'],
    key: 'Why is the extension not working?' },
  { keywords: ['focus mode', 'enable focus mode', 'turn on focus', 'focus mode extension'],
    key: 'How do I enable focus mode in the extension?' },
  { keywords: ['other websites', 'other sites', 'extension other', 'works on other'],
    key: 'Does the extension work on other websites?' },
  { keywords: ['extension track', 'what does extension', 'extension data', 'extension monitor'],
    key: 'What does the extension track?' },
  { keywords: ['stats extension', 'extension stats', 'extension dashboard', 'see in extension'],
    key: 'How do I see stats in the extension?' },
  { keywords: ['not logged in extension', 'extension login', 'extension logged out'],
    key: 'Why does the extension say I am not logged in?' },

  // ACCOUNT & PROFILE
  { keywords: ['reset password', 'change password', 'forgot password'],
    key: 'How do I reset my password?' },
  { keywords: ['delete account', 'remove account', 'close account'],
    key: 'How do I delete my account?' },
  { keywords: ['edit profile', 'update profile', 'change profile', 'change name'],
    key: 'How do I edit my profile?' },
  { keywords: ['profile stats', 'where profile', 'see profile'],
    key: 'Where can I see my profile stats?' },
  { keywords: ['heatmap', 'activity heatmap', 'what is heatmap'],
    key: 'What is the activity heatmap?' },

  // VIDEO FILTERING
  { keywords: ['videos hidden', 'hidden video', 'why hidden', 'video not showing',
                'video missing', 'cant see video', 'video disappeared'],
    key: 'Why are some videos hidden on YouTube?' },
  { keywords: ['specific video', 'video not showing', 'my video missing'],
    key: 'Why is a specific video not showing?' },
  { keywords: ['video filtering', 'how filtering', 'ml model', 'filter work',
                'how does filter'],
    key: 'How does video filtering work?' },
];

// ─── NORMALIZER ──────────────────────────────────────────────
// Lowercase + strip punctuation + collapse spaces

const normalize = (str) =>
  str.toLowerCase()
     .replace(/[^a-z0-9 ]/g, ' ')
     .replace(/\s+/g, ' ')
     .trim();

// ─── MAIN FUNCTION ───────────────────────────────────────────

export function getServiceReply(userInput) {
  const input = normalize(userInput);

  // STEP 1: Keyword map check (fastest, most flexible)
  for (const entry of keywordMap) {
    for (const keyword of entry.keywords) {
      if (input.includes(normalize(keyword))) {
        return qaMap[entry.key];
      }
    }
  }

  // STEP 2: Fuzzy match against qaMap keys directly
  // Checks if any word from the user input appears in a qaMap key
  const inputWords = input.split(' ').filter(w => w.length > 3);

  let bestMatch = null;
  let bestScore = 0;

  for (const [question, answer] of Object.entries(qaMap)) {
    const normalizedQuestion = normalize(question);
    let score = 0;
    for (const word of inputWords) {
      if (normalizedQuestion.includes(word)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = answer;
    }
  }

  // Only use fuzzy match if at least 1 meaningful word matched
  if (bestScore >= 1 && bestMatch) {
    return bestMatch;
  }

  // STEP 3: Fallback
  return "I couldn't find a specific answer for that. Try asking about: sessions, focus score, streaks, roadmaps, analytics, notebook, or the Chrome extension.";
}
