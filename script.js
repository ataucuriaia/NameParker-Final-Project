// ============================================
// MOCK STUDENT DATA
// ============================================
const students = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Chen",
    preferredName: "Sarah Chen",
    photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    pronunciation: "SAIR-uh CHEN"
  },
  {
    id: 2,
    firstName: "Marcus",
    lastName: "Johnson",
    preferredName: "Marcus Johnson",
    photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    pronunciation: "MAR-kus JOHN-son"
  },
  {
    id: 3,
    firstName: "Priya",
    lastName: "Patel",
    preferredName: "Priya Patel",
    photoUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    pronunciation: "PREE-yah puh-TEL"
  },
  {
    id: 4,
    firstName: "James",
    lastName: "O'Brien",
    preferredName: "Jamie O'Brien",
    photoUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    pronunciation: "JAY-mee oh-BRY-en"
  },
  {
    id: 5,
    firstName: "Yuki",
    lastName: "Tanaka",
    preferredName: "Yuki Tanaka",
    photoUrl: "https://randomuser.me/api/portraits/women/52.jpg",
    pronunciation: "YOO-kee tah-NAH-kah"
  },
  {
    id: 6,
    firstName: "Ahmed",
    lastName: "Hassan",
    preferredName: "Ahmed Hassan",
    photoUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    pronunciation: "AH-med hah-SAHN"
  },
  {
    id: 7,
    firstName: "Emily",
    lastName: "Rodriguez",
    preferredName: "Emily Rodriguez",
    photoUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    pronunciation: "EM-uh-lee rod-REE-gez"
  },
  {
    id: 8,
    firstName: "Wei",
    lastName: "Zhang",
    preferredName: "Wei Zhang",
    photoUrl: "https://randomuser.me/api/portraits/men/55.jpg",
    pronunciation: "WAY JAHNG"
  },
  {
    id: 9,
    firstName: "Oluwaseun",
    lastName: "Adeyemi",
    preferredName: "Seun Adeyemi",
    photoUrl: "https://randomuser.me/api/portraits/men/18.jpg",
    pronunciation: "SHAY-oon ah-DEH-yeh-mee"
  },
  {
    id: 10,
    firstName: "Maria",
    lastName: "Gonzalez",
    preferredName: "Maria Gonzalez",
    photoUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    pronunciation: "mah-REE-ah gon-ZAH-lez"
  }
];

// ============================================
// APP STATE
// ============================================
let state = {
  queue: [],
  completed: [],
  results: [],
  currentCard: null,
  cardShownTime: null,
  sessionStartTime: null,
  totalStudents: students.length,
  isFlipped: false
};

// ============================================
// DOM ELEMENTS
// ============================================
const screens = {
  start: document.getElementById('start-screen'),
  card: document.getElementById('card-screen'),
  results: document.getElementById('results-screen')
};

const elements = {
  deckCount: document.getElementById('deck-count'),
  startBtn: document.getElementById('start-btn'),
  flashcard: document.getElementById('flashcard'),
  cardPhotoFront: document.getElementById('card-photo-front'),
  cardPhotoBack: document.getElementById('card-photo-back'),
  studentName: document.getElementById('student-name'),
  audioBtn: document.getElementById('audio-btn'),
  evalButtons: document.getElementById('eval-buttons'),
  btnCorrect: document.getElementById('btn-correct'),
  btnMissed: document.getElementById('btn-missed'),
  currentNum: document.getElementById('current-num'),
  totalNum: document.getElementById('total-num'),
  progressFill: document.getElementById('progress-fill'),
  scorePercent: document.getElementById('score-percent'),
  scoreCorrect: document.getElementById('score-correct'),
  scoreTotal: document.getElementById('score-total'),
  scoreRing: document.getElementById('score-ring'),
  sessionTime: document.getElementById('session-time'),
  avgResponse: document.getElementById('avg-response'),
  resultsMessage: document.getElementById('results-message'),
  reviewAgainBtn: document.getElementById('review-again-btn'),
  reviewMissedBtn: document.getElementById('review-missed-btn')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// GAME LOGIC
// ============================================
function initSession(studentList = students) {
  state = {
    queue: shuffle([...studentList]),
    completed: [],
    results: [],
    currentCard: null,
    cardShownTime: null,
    sessionStartTime: Date.now(),
    totalStudents: studentList.length,
    isFlipped: false
  };
  
  elements.totalNum.textContent = state.totalStudents;
  elements.deckCount.textContent = students.length;
}

function showNextCard() {
  if (state.queue.length === 0) {
    showResults();
    return;
  }

  state.currentCard = state.queue.shift();
  state.cardShownTime = Date.now();
  state.isFlipped = false;

  // Reset card state
  elements.flashcard.classList.remove('flipped');
  elements.evalButtons.classList.add('hidden');

  // Update card content
  elements.cardPhotoFront.src = state.currentCard.photoUrl;
  elements.cardPhotoBack.src = state.currentCard.photoUrl;
  elements.studentName.textContent = state.currentCard.preferredName;

  // Update progress
  const reviewed = state.completed.length + 1;
  elements.currentNum.textContent = reviewed;
  const progress = (state.completed.length / state.totalStudents) * 100;
  elements.progressFill.style.width = `${progress}%`;
}

function flipCard() {
  if (state.isFlipped) return;
  
  state.isFlipped = true;
  elements.flashcard.classList.add('flipped');
  
  // Show eval buttons after flip animation
  setTimeout(() => {
    elements.evalButtons.classList.remove('hidden');
  }, 400);
}

function playPronunciation() {
  const student = state.currentCard;
  
  // Check if browser supports speech synthesis
  if ('speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Add visual feedback - show playing state
    elements.audioBtn.textContent = '🔊 Playing...';
    elements.audioBtn.disabled = true;
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(student.preferredName);
    
    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
    ) || voices.find(voice => voice.lang.includes('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Reset button when speech ends
    utterance.onend = () => {
      elements.audioBtn.textContent = '🔊 Hear pronunciation';
      elements.audioBtn.disabled = false;
    };
    
    utterance.onerror = () => {
      elements.audioBtn.textContent = '🔊 Hear pronunciation';
      elements.audioBtn.disabled = false;
    };
    
    // Speak the name
    window.speechSynthesis.speak(utterance);
    
    console.log(`Playing pronunciation for: ${student.preferredName}`);
  } else {
    // Fallback if speech synthesis is not supported
    alert(`Pronunciation: ${student.pronunciation}`);
  }
}

// Ensure voices are loaded (some browsers need this)
if ('speechSynthesis' in window) {
  // Load voices when available
  window.speechSynthesis.onvoiceschanged = () => {
    console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
  };
  
  // Also try to get voices immediately
  setTimeout(() => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log('Voices available:', voices.length);
    }
  }, 100);
}

function recordResult(gotCorrect) {
  const responseTime = Date.now() - state.cardShownTime;
  
  const result = {
    studentId: state.currentCard.id,
    studentName: state.currentCard.preferredName,
    gotCorrect: gotCorrect,
    responseTimeMs: responseTime,
    attempts: 1
  };

  // Check if this student was already attempted (spaced repetition)
  const existingResult = state.results.find(r => r.studentId === state.currentCard.id);
  if (existingResult) {
    existingResult.attempts++;
    existingResult.gotCorrect = gotCorrect;
    existingResult.responseTimeMs = responseTime;
  } else {
    state.results.push(result);
  }

  if (gotCorrect) {
    state.completed.push(state.currentCard);
  } else {
    // Spaced repetition: missed cards go back to queue
    state.queue.push(state.currentCard);
  }

  console.log('Results so far:', state.results);
  showNextCard();
}

function showResults() {
  showScreen('results');
  
  const sessionDuration = Date.now() - state.sessionStartTime;
  const correctCount = state.results.filter(r => r.gotCorrect).length;
  const totalCount = state.results.length;
  const percentage = Math.round((correctCount / totalCount) * 100);
  
  // Calculate average response time
  const avgResponseTime = state.results.reduce((sum, r) => sum + r.responseTimeMs, 0) / state.results.length;

  // Update UI
  elements.scorePercent.textContent = percentage;
  elements.scoreCorrect.textContent = correctCount;
  elements.scoreTotal.textContent = totalCount;
  elements.sessionTime.textContent = formatTime(sessionDuration);
  elements.avgResponse.textContent = `${(avgResponseTime / 1000).toFixed(1)}s`;

  // Animate score ring
  const circumference = 283; // 2 * PI * 45
  const offset = circumference - (percentage / 100) * circumference;
  setTimeout(() => {
    elements.scoreRing.style.strokeDashoffset = offset;
  }, 100);

  // Set message based on score
  if (percentage >= 90) {
    elements.resultsMessage.textContent = "Outstanding! 🌟";
  } else if (percentage >= 70) {
    elements.resultsMessage.textContent = "Great Job! 👏";
  } else if (percentage >= 50) {
    elements.resultsMessage.textContent = "Good Progress! 💪";
  } else {
    elements.resultsMessage.textContent = "Keep Practicing! 📚";
  }

  // Show "Practice Missed" button if there were mistakes
  const missedStudents = state.results.filter(r => !r.gotCorrect);
  if (missedStudents.length > 0) {
    elements.reviewMissedBtn.classList.remove('hidden');
  } else {
    elements.reviewMissedBtn.classList.add('hidden');
  }

  // Log analytics data
  console.log('=== SESSION COMPLETE ===');
  console.log('Accuracy Rate:', percentage + '%');
  console.log('Session Duration:', formatTime(sessionDuration));
  console.log('Avg Response Time:', (avgResponseTime / 1000).toFixed(2) + 's');
  console.log('Detailed Results:', state.results);
}

function startSession() {
  initSession();
  showScreen('card');
  showNextCard();
}

function reviewMissedOnly() {
  const missedIds = state.results.filter(r => !r.gotCorrect).map(r => r.studentId);
  const missedStudents = students.filter(s => missedIds.includes(s.id));
  initSession(missedStudents);
  showScreen('card');
  showNextCard();
}

// ============================================
// EVENT LISTENERS
// ============================================
elements.startBtn.addEventListener('click', startSession);
elements.flashcard.addEventListener('click', flipCard);
elements.audioBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playPronunciation();
});
elements.btnCorrect.addEventListener('click', () => recordResult(true));
elements.btnMissed.addEventListener('click', () => recordResult(false));
elements.reviewAgainBtn.addEventListener('click', startSession);
elements.reviewMissedBtn.addEventListener('click', reviewMissedOnly);

// ============================================
// INITIALIZE
// ============================================
initSession();
console.log('Name Recall App Initialized');
console.log('Students loaded:', students.length);