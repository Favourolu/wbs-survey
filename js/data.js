// =====================================================================
// WBS Survey Game — content & configuration
// Edit this file to change questions, courses, dialogue or settings.
// =====================================================================

window.CONFIG = {
  // Paste the Google Apps Script web-app URL here (see SETUP.md).
  // While empty, answers are only logged in the browser console.
  SHEET_URL: "",

  // Voiceover: put vo_01.mp3 ... vo_16.mp3 in audio/vo/.
  // If a file is missing, the browser's built-in voice reads the line instead.
  VO_PATH: "audio/vo/",
  TTS_FALLBACK: true,

  GUIDE_NAME: "Max",
  TERM_LABEL: "Autumn Term 2026",
};

// Courses that get the Module Corridor (code -> specialism module)
window.MODULE_COURSES = {
  MBM: { module: "Marketing", icon: "📣" },
  MBOM: { module: "Supply Chain Management", icon: "🚚" },
  MINT: { module: "International Business", icon: "🌍" },
  MBC: { module: "Introduction to Consulting", icon: "💼" },
};

window.COURSE_GROUPS = [
  { group: "Accounting", courses: [
    ["MSc Accounting & Financial Management"],
    ["MSc Accounting & Sustainability"],
  ]},
  { group: "Business & Management", courses: [
    ["MSc Business with Art"],
    ["MSc Business with Artificial Intelligence"],
    ["MSc Business with Consulting", "MBC"],
    ["MSc Business with Finance"],
    ["MSc Business with Marketing", "MBM"],
    ["MSc Business with Operations Management", "MBOM"],
    ["MSc Business with Sustainability"],
    ["MSc International Business", "MINT"],
    ["MSc Management"],
  ]},
  { group: "Analytics, AI & Technology", courses: [
    ["MSc Business Analytics & Artificial Intelligence"],
    ["MSc Digital & AI Leadership"],
    ["MSc Financial Technology"],
  ]},
  { group: "Finance", courses: [
    ["MSc Finance"],
    ["MSc Finance & Economics"],
    ["MSc Finance & Management"],
    ["MSc Mathematical Finance"],
  ]},
  { group: "Marketing", courses: [
    ["MSc Marketing & Consumer Behaviour"],
    ["MSc Marketing & Strategy"],
  ]},
  { group: "Other", courses: [["Other / Prefer not to say"]] },
];

// Max's reaction once a course is picked (keyword match, first wins)
window.COURSE_QUIPS = [
  ["Accounting", "Accounting? Great, you can help me with my expenses. Kidding."],
  ["Mathematical", "Mathematical Finance? I can count to ten. On a good day."],
  ["Finance", "Ooh, a Finance student! Don't worry, I won't ask you to calculate anything."],
  ["Marketing", "Marketing? You'll love my pixel branding."],
  ["Artificial", "AI, huh? Be nice to me. I'm basically your cousin."],
  ["AI Leadership", "AI Leadership? Be nice to me. I'm basically your cousin."],
  ["Analytics", "Analytics! I bet you've already counted my pixels."],
  ["Technology", "FinTech! Do you accept payment in pixels?"],
  ["Consulting", "Consulting? So you'll tell me what I already know, but in a slide deck."],
  ["Operations", "Operations Management? Finally, someone to fix the lift queue."],
  ["Sustainability", "Sustainability! I'm 100% recycled pixels, you know."],
  ["Art", "Business with Art? Then you'll appreciate my pixels."],
  ["International", "International Business! Welcome, from all around the world."],
  ["Management", "Management? Excellent, you can manage me. I need it."],
  ["Other", "Mysterious. I like it."],
];

// ---------------------------------------------------------------------
// ROOMS & QUESTIONS
// type: yesno | choice | hearts | text
// showIf(answers, state) -> only shown when true
// Text questions are always optional (Skip button).
// ---------------------------------------------------------------------
const lowRating = (id, label) => ({
  id: id + "_why", type: "text",
  text: "Ouch. What would make " + label + " better?",
  showIf: (a) => a[id] != null && a[id] <= 4,
});

const inModuleCourse = (a, s) => !!(s.courseCode && MODULE_COURSES[s.courseCode]);

window.ROOMS = [
  {
    id: "lecture", name: "Lecture Theatre", icon: "🎓", bg: "assets/bg/lecture.png",
    npc: { name: "Professor", look: "professor" },
    greet: "Ah, a student! Pull up a chair, let's talk teaching. Don't worry, there's no exam on this.",
    questions: [
      { id: "assess_concern", type: "yesno",
        text: "Do you have any concerns about assignment instructions, exams, or assessment criteria?" },
      { id: "assess_problems", type: "text",
        text: "What problems do you have with assessments, exams and more?",
        showIf: (a) => a.assess_concern === "Yes" },
      { id: "online_offline", type: "choice",
        text: "Would you suggest online classes or in-person classes?",
        options: ["Online", "In-person", "Both work"] },
      { id: "online_pace", type: "yesno",
        text: "Is the pace of teaching appropriate for online learning?",
        showIf: (a) => a.online_offline === "Online" || a.online_offline === "Both work" },
      { id: "ffma_recording", type: "yesno",
        text: "Do you want workshop recordings of Foundations of Financial and Management Accounting?",
        showIf: inModuleCourse },
      { id: "raise_faculty", type: "text",
        text: "Do you have any concerns or suggestions you would like us to raise with the faculty?" },
    ],
  },
  {
    id: "corridor", name: "Module Corridor", icon: "🚪", bg: null, scene: "corridor",
    npc: { name: "Professor", look: "professor" },
    greet: "Hold on! You're on {course}, so I've got a few module questions for you. Quick ones, I promise.",
    maxQuip: "He says 'quick'. He also said the lecture would finish on time.",
    showIf: inModuleCourse,
    doors: [
      { title: "Foundations of Financial and Management Accounting", short: "FFMA", icon: "🧮", questions: [
        { id: "ffma_balance", type: "choice", options: ["Yes", "No", "Maybe"],
          text: "Do you feel the balance between theoretical explanations and numerical/practical examples is appropriate?" },
        { id: "ffma_sessions", type: "choice", options: ["Yes", "No", "Maybe"],
          text: "Would you find extra problem-solving or doubt-clearing sessions useful for this module?" },
        { id: "ffma_problems", type: "text", text: "What problems do you face in this module? (content, pace, etc.)" },
      ]},
      { title: "Quantitative Methods for Business", short: "QMB", icon: "📊", questions: [
        { id: "qmb_pace", type: "choice", options: ["Too fast", "Too slow", "Fine"],
          text: "Is the pace of teaching appropriate when explaining calculations and methods?" },
        { id: "qmb_problems", type: "text", text: "What problems do you face in this module? (content, pace, etc.)" },
      ]},
      { title: "Strategy Analysis and Practice", short: "SAP", icon: "♟️", questions: [
        { id: "sap_cases", type: "choice", options: ["Yes", "No", "Maybe"],
          text: "Do you find the case studies and practical examples useful for understanding the content?" },
        { id: "sap_support", type: "text", text: "What additional support or activities would improve your learning?" },
      ]},
      { title: "{specialism}", short: "SPEC", icon: "{specIcon}", questions: [
        { id: "spec_pace", type: "yesno", text: "Is the pace of teaching appropriate in {specialism}?" },
        { id: "spec_problems", type: "text", text: "What problems do you face in {specialism}? (content, pace, etc.)" },
      ]},
    ],
  },
  {
    id: "library", name: "Library", icon: "📚", bg: "assets/bg/library.png",
    npc: { name: "Librarian", look: "librarian" },
    greet: "Shhh... just kidding! Quick questions about where you study.",
    questions: [
      { id: "study_spaces", type: "hearts",
        text: "Thinking about Warwick's study spaces (Main Library, the Grid, departmental spaces), how would you rate them?" },
      lowRating("study_spaces", "study spaces"),
      { id: "group_sessions", type: "yesno",
        text: "Should we include group study sessions and doubt-clearing sessions in our timetable?" },
    ],
  },
  {
    id: "cafe", name: "Café", icon: "☕", bg: "assets/bg/cafe.png",
    npc: { name: "Barista", look: "barista" },
    greet: "Grab a coffee! So... how's your week looking? Be honest, I've seen the timetable.",
    questions: [
      { id: "timetable_concern", type: "yesno",
        text: "Are there any concerns about the timetable, room bookings, or scheduling?" },
      { id: "timetable_changes", type: "text",
        text: "What changes or improvements would you suggest for the timetable (e.g. buffer time, class structure)?",
        showIf: (a) => a.timetable_concern === "Yes" },
      { id: "commute_ok", type: "yesno",
        text: "Are you comfortable with the commuting time between the morning class and the workshop?" },
      { id: "commute_why", type: "text",
        text: "What's the problem: distance, time between sessions, or something else?",
        showIf: (a) => a.commute_ok === "No" },
      { id: "schedule_pref", type: "choice",
        text: "How would you prefer classes to be scheduled throughout the week?",
        options: [
          "Spread out across the week, with a balanced workload each day",
          "Concentrated into a few days, leaving other days free for study",
          "No preference, I'm comfortable with either",
        ] },
      { id: "su_rating", type: "hearts",
        text: "Rate your experience with Warwick SU societies, sports clubs, volunteering and the Warwick Award." },
      lowRating("su_rating", "SU activities"),
    ],
  },
  {
    id: "careers", name: "Careers Office", icon: "💼", bg: "assets/bg/careers.png", scene: "careers",
    npc: { name: "Careers Adviser", look: "adviser" },
    greet: "Let's talk about your future, superstar. No pressure. Okay, a little pressure.",
    questions: [
      { id: "careers_rating", type: "hearts",
        text: "How would you rate Warwick Careers Services? (1 = Very poor, 10 = Excellent)" },
      lowRating("careers_rating", "Careers Services"),
      { id: "pg_careers", type: "yesno",
        text: "Do we need more career services specific to PG students and job support?" },
    ],
  },
];

// Max's random, neutral reactions after any answer (never judges the answer)
window.ANSWER_QUIPS = [
  "Noted! In my very official pixel notebook.",
  "Ooh, interesting. Writing that down... in crayon.",
  "Got it! The SSLC is going to love this.",
  "Nice jump! 10/10 landing.",
  "Boing! Sorry, I just like saying that.",
  "Thank you! Your honesty has been logged.",
  "Smooth. Very smooth.",
];
window.PENCIL_QUIPS = ["Oops! Butterfingers.", "That was on purpose. Obviously.", "Pencils are heavy, okay?"];
window.IDLE_QUIPS = [
  "No rush... I'll just stand here. Being a pixel. Forever.",
  "Take your time. I've got nowhere to be. Literally.",
  "*checks tiny watch* ...*starts doing push-ups*",
];
window.LOADING_TIPS = [
  "Tip: lecturers can't see your answers. We checked. Twice.",
  "Tip: no avatars were harmed in the making of this survey.",
  "Tip: tap things. Some of them do stuff.",
  "Tip: there are no wrong answers. Except pineapple on pizza.",
];

// Voiceover lines (file vo_XX.mp3 matches the number)
window.VO = {
  1: "Looking good! Honestly, better than my student ID photo.",
  2: "Hey! Hi, hello, welcome to W.B.S.!",
  3: "I'm Max, your guide today. I've been here so long, I'm basically part of the building.",
  4: "Here's the deal: the Student Staff Liaison Committee wants to know what you really think about W.B.S.",
  5: "We'll walk through the building together. In each room, someone will ask you a few quick questions.",
  6: "Just tap your answer. No right or wrong answers, and it's totally anonymous. Not even I know who you are... and I'm very nosy.",
  7: "It takes about four minutes. That's shorter than the coffee queue at lunchtime! Finish the tour and you'll earn your W.B.S. Feedback Champion badge.",
  8: "Ready? Let's go!",
  9: "This is the main foyer. Mind the floor, it's freshly pixelated. Let's start with the lecture theatre. Tap the glowing door!",
  10: "Nice one! Next up, the library. Shhh... we have to whisper in there. Okay, not really.",
  11: "Halfway there! Let's grab a coffee. I run on caffeine and deadlines.",
  12: "One more room: the Careers Office. Time to pretend we all have a five-year plan.",
  13: "Last stop! This is the Suggestion Box. If you could change one thing about W.B.S., what would it be? Apart from making me taller.",
  14: "That's it, you did it! Thank you so much. You're officially more productive than me on a Monday.",
  15: "Your answers go straight to the S.S.L.C., and we'll use them to make W.B.S. better for everyone.",
  16: "Share your badge and get your coursemates to play too. See you around!",
};
