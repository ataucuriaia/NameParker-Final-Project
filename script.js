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
  isFlipped: false,
  mediaRecorder: null,
  recordedChunks: [],
  recordedAudio: null
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
  recordBtn: document.getElementById('record-btn'),
  stopRecordBtn: document.getElementById('stop-record-btn'),
  playRecordedBtn: document.getElementById('play-recorded-btn'),
  deleteRecordedBtn: document.getElementById('delete-recorded-btn'),
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
  reviewMissedBtn: document.getElementById('review-missed-btn'),
  backToHomeBtn: document.getElementById('back-to-home-btn')
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

// ============================================
// ANALYTICS PERSISTENCE
// ============================================
function saveSessionToHistory(sessionData) {
  const history = getSessionHistory();
  history.push(sessionData);
  // Keep only last 100 sessions to avoid localStorage limits
  const recentHistory = history.slice(-100);
  localStorage.setItem('nameRecall_sessionHistory', JSON.stringify(recentHistory));
}

function getSessionHistory() {
  const stored = localStorage.getItem('nameRecall_sessionHistory');
  return stored ? JSON.parse(stored) : [];
}

function getSessionsThisWeek() {
  const history = getSessionHistory();
  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
  return history.filter(session => session.timestamp >= oneWeekAgo);
}

function getSessionsThisMonth() {
  const history = getSessionHistory();
  const now = Date.now();
  const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
  return history.filter(session => session.timestamp >= oneMonthAgo);
}

function calculateAccuracyTrend() {
  const history = getSessionHistory();
  if (history.length < 2) return null;
  
  // Get last 10 sessions for trend
  const recentSessions = history.slice(-10);
  const firstHalf = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
  const secondHalf = recentSessions.slice(Math.floor(recentSessions.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, s) => sum + s.accuracy, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.accuracy, 0) / secondHalf.length;
  
  return {
    trend: secondAvg - firstAvg,
    recentAverage: secondAvg,
    previousAverage: firstAvg
  };
}

function getSessionFrequency() {
  const thisWeek = getSessionsThisWeek();
  const thisMonth = getSessionsThisMonth();
  
  return {
    thisWeek: thisWeek.length,
    thisMonth: thisMonth.length,
    averagePerWeek: thisMonth.length / 4.33 // Approximate weeks in a month
  };
}

function updateStartScreenAnalytics() {
  const history = getSessionHistory();
  const frequency = getSessionFrequency();
  const trend = calculateAccuracyTrend();
  
  // Update session count display
  const sessionCountEl = document.getElementById('session-count');
  if (sessionCountEl) {
    sessionCountEl.textContent = history.length;
  }
  
  // Update weekly frequency
  const weeklyFreqEl = document.getElementById('weekly-frequency');
  if (weeklyFreqEl) {
    weeklyFreqEl.textContent = frequency.thisWeek;
  }
  
  // Update accuracy trend
  const trendEl = document.getElementById('accuracy-trend');
  if (trendEl && trend) {
    const trendIcon = trend.trend > 0 ? '📈' : trend.trend < 0 ? '📉' : '➡️';
    const trendText = trend.trend > 0 ? `+${Math.round(trend.trend)}%` : 
                     trend.trend < 0 ? `${Math.round(trend.trend)}%` : 'No change';
    trendEl.innerHTML = `${trendIcon} ${trendText} (Recent: ${Math.round(trend.recentAverage)}%)`;
  }
  
  // Update last session info
  const lastSessionEl = document.getElementById('last-session');
  if (lastSessionEl && history.length > 0) {
    const lastSession = history[history.length - 1];
    const daysAgo = Math.floor((Date.now() - lastSession.timestamp) / (24 * 60 * 60 * 1000));
    const daysText = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
    lastSessionEl.textContent = `Last review: ${daysText} (${Math.round(lastSession.accuracy)}% accuracy)`;
  }
}

function showScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenName].classList.add('active');
  
  // Update analytics when showing start screen
  if (screenName === 'start') {
    updateStartScreenAnalytics();
  }
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
    isFlipped: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordedAudio: null
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
  
  // Reset recording button states
  elements.stopRecordBtn.classList.add('hidden');
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }

  // Update card content
  elements.cardPhotoFront.src = state.currentCard.photoUrl;
  elements.cardPhotoBack.src = state.currentCard.photoUrl;
  elements.studentName.textContent = state.currentCard.preferredName;

  // Update progress
  const reviewed = state.completed.length + 1;
  elements.currentNum.textContent = reviewed;
  const progress = (state.completed.length / state.totalStudents) * 100;
  elements.progressFill.style.width = `${progress}%`;
  
  // Stop any playing audio
  if (state.recordedAudio) {
    state.recordedAudio.pause();
    state.recordedAudio = null;
  }
}

function flipCard() {
  if (state.isFlipped) return;
  
  state.isFlipped = true;
  elements.flashcard.classList.add('flipped');
  
  // Update recording buttons when card is flipped
  updateRecordingButtons();
  
  // Show eval buttons after flip animation
  setTimeout(() => {
    elements.evalButtons.classList.remove('hidden');
  }, 400);
}

function getRecordedAudio(studentId) {
  const recorded = localStorage.getItem(`pronunciation_${studentId}`);
  return recorded ? recorded : null;
}

function saveRecordedAudio(studentId, audioBlob) {
  const reader = new FileReader();
  reader.onloadend = () => {
    localStorage.setItem(`pronunciation_${studentId}`, reader.result);
  };
  reader.readAsDataURL(audioBlob);
}

function deleteRecordedAudio(studentId) {
  localStorage.removeItem(`pronunciation_${studentId}`);
  updateRecordingButtons();
}

function playPronunciation() {
  const student = state.currentCard;
  
  // Always play the original text-to-speech pronunciation
  if ('speechSynthesis' in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Stop any playing recorded audio
    if (state.recordedAudio) {
      state.recordedAudio.pause();
      state.recordedAudio.currentTime = 0;
      elements.playRecordedBtn.textContent = '▶️ Play recorded';
    }
    
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

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder = new MediaRecorder(stream);
    state.recordedChunks = [];
    
    state.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.recordedChunks.push(event.data);
      }
    };
    
    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.recordedChunks, { type: 'audio/webm' });
      
      // Save the recording
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem(`pronunciation_${state.currentCard.id}`, reader.result);
        // Update buttons after saving
        updateRecordingButtons();
        // Auto-play the recording after it's saved
        setTimeout(() => {
          playRecorded();
        }, 100);
      };
      reader.readAsDataURL(blob);
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    state.mediaRecorder.start();
    elements.recordBtn.classList.add('hidden');
    elements.stopRecordBtn.classList.remove('hidden');
    elements.audioBtn.disabled = true;
    
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Could not access microphone. Please check your permissions.');
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
    elements.stopRecordBtn.classList.add('hidden');
    elements.recordBtn.classList.remove('hidden');
    elements.audioBtn.disabled = false;
  }
}

function playRecorded() {
  const student = state.currentCard;
  const recordedAudioData = getRecordedAudio(student.id);
  
  if (recordedAudioData) {
    // Stop any ongoing text-to-speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // If audio is already playing, pause it
    if (state.recordedAudio && !state.recordedAudio.paused) {
      state.recordedAudio.pause();
      state.recordedAudio.currentTime = 0;
      elements.playRecordedBtn.textContent = '▶️ Play recorded';
      return;
    }
    
    // Create new audio instance if needed
    if (!state.recordedAudio || state.recordedAudio.src !== recordedAudioData) {
      state.recordedAudio = new Audio(recordedAudioData);
    }
    
    // Reset audio to beginning
    state.recordedAudio.currentTime = 0;
    elements.playRecordedBtn.textContent = '⏸️ Pause';
    
    state.recordedAudio.onended = () => {
      elements.playRecordedBtn.textContent = '▶️ Play recorded';
    };
    
    state.recordedAudio.onpause = () => {
      elements.playRecordedBtn.textContent = '▶️ Play recorded';
    };
    
    state.recordedAudio.onplay = () => {
      elements.playRecordedBtn.textContent = '⏸️ Pause';
    };
    
    state.recordedAudio.onerror = () => {
      elements.playRecordedBtn.textContent = '▶️ Play recorded';
      alert('Error playing recording. Please try recording again.');
    };
    
    state.recordedAudio.play();
  }
}

function deleteRecording() {
  if (confirm('Are you sure you want to delete this recording?')) {
    deleteRecordedAudio(state.currentCard.id);
    if (state.recordedAudio) {
      state.recordedAudio.pause();
      state.recordedAudio = null;
    }
    // Update buttons to show record button again
    updateRecordingButtons();
  }
}

function updateRecordingButtons() {
  if (!state.currentCard) return;
  
  const hasRecording = getRecordedAudio(state.currentCard.id) !== null;
  
  // Only update if card is flipped (buttons are on the back)
  if (!state.isFlipped) return;
  
  if (hasRecording) {
    elements.recordBtn.classList.add('hidden');
    elements.playRecordedBtn.classList.remove('hidden');
    elements.deleteRecordedBtn.classList.remove('hidden');
  } else {
    elements.recordBtn.classList.remove('hidden');
    elements.playRecordedBtn.classList.add('hidden');
    elements.deleteRecordedBtn.classList.add('hidden');
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
  
  // Check if this student was already attempted (spaced repetition)
  const existingResult = state.results.find(r => r.studentId === state.currentCard.id);
  
  if (existingResult) {
    // This is a second+ attempt
    existingResult.attempts++;
    existingResult.gotCorrect = gotCorrect;
    existingResult.responseTimeMs = responseTime;
    // Keep the original firstAttemptCorrect value (don't change it)
  } else {
    // This is the first attempt
    const result = {
      studentId: state.currentCard.id,
      studentName: state.currentCard.preferredName,
      gotCorrect: gotCorrect,
      firstAttemptCorrect: gotCorrect, // Track first attempt separately
      responseTimeMs: responseTime,
      attempts: 1
    };
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
  
  // Calculate FIRST-ATTEMPT accuracy (MVP requirement)
  const firstAttemptCorrect = state.results.filter(r => r.firstAttemptCorrect === true).length;
  const totalUniqueStudents = state.results.length;
  const percentage = totalUniqueStudents > 0 
    ? Math.round((firstAttemptCorrect / totalUniqueStudents) * 100) 
    : 0;
  
  // Also track mastery (eventually got it right) for display
  const masteryCount = state.results.filter(r => r.gotCorrect === true).length;
  const improvedCount = state.results.filter(r => !r.firstAttemptCorrect && r.gotCorrect).length;
  
  // Calculate average response time (only for first attempts)
  const firstAttemptResults = state.results.filter(r => r.attempts === 1);
  const avgResponseTime = firstAttemptResults.length > 0
    ? firstAttemptResults.reduce((sum, r) => sum + r.responseTimeMs, 0) / firstAttemptResults.length
    : 0;

  // Update UI
  elements.scorePercent.textContent = percentage;
  elements.scoreCorrect.textContent = firstAttemptCorrect;
  elements.scoreTotal.textContent = totalUniqueStudents;
  elements.sessionTime.textContent = formatTime(sessionDuration);
  elements.avgResponse.textContent = `${(avgResponseTime / 1000).toFixed(1)}s`;
  
  // Update results message to show improvement if applicable
  let resultsMessageText = '';
  if (percentage >= 90) {
    resultsMessageText = "Outstanding! 🌟";
  } else if (percentage >= 70) {
    resultsMessageText = "Great Job! 👏";
  } else if (percentage >= 50) {
    resultsMessageText = "Good Progress! 💪";
  } else {
    resultsMessageText = "Keep Practicing! 📚";
  }
  
  // Add improvement note if students improved on second attempt
  if (improvedCount > 0) {
    resultsMessageText += ` (${improvedCount} improved with practice)`;
  }

  // Animate score ring
  const circumference = 283; // 2 * PI * 45
  const offset = circumference - (percentage / 100) * circumference;
  setTimeout(() => {
    elements.scoreRing.style.strokeDashoffset = offset;
  }, 100);

  // Set message based on score (already set above with improvement note)
  elements.resultsMessage.textContent = resultsMessageText;

  // Show "Practice Missed" button if there were mistakes on first attempt
  const missedOnFirstAttempt = state.results.filter(r => !r.firstAttemptCorrect);
  if (missedOnFirstAttempt.length > 0) {
    elements.reviewMissedBtn.classList.remove('hidden');
  } else {
    elements.reviewMissedBtn.classList.add('hidden');
  }

  // Save session to history (using first-attempt accuracy)
  const sessionData = {
    timestamp: state.sessionStartTime,
    accuracy: percentage, // First-attempt accuracy
    firstAttemptCorrect: firstAttemptCorrect,
    masteryCount: masteryCount, // Eventually got it right
    improvedCount: improvedCount, // Improved on second+ attempt
    totalCount: totalUniqueStudents,
    sessionDuration: sessionDuration,
    avgResponseTime: avgResponseTime,
    deckSize: state.totalStudents,
    completionRate: Math.round((totalUniqueStudents / state.totalStudents) * 100),
    results: state.results
  };
  saveSessionToHistory(sessionData);
  
  // Update historical analytics on results screen
  const frequency = getSessionFrequency();
  const trend = calculateAccuracyTrend();
  const history = getSessionHistory();
  
  const weeklyFreqEl = document.getElementById('results-weekly-freq');
  if (weeklyFreqEl) {
    weeklyFreqEl.textContent = frequency.thisWeek;
  }
  
  const trendEl = document.getElementById('results-accuracy-trend');
  if (trendEl) {
    if (trend) {
      const trendIcon = trend.trend > 0 ? '📈' : trend.trend < 0 ? '📉' : '➡️';
      const trendText = trend.trend > 0 ? `+${Math.round(trend.trend)}%` : 
                       trend.trend < 0 ? `${Math.round(trend.trend)}%` : 'No change';
      trendEl.innerHTML = `${trendIcon} ${trendText}`;
    } else {
      trendEl.textContent = '--';
    }
  }
  
  const totalSessionsEl = document.getElementById('results-total-sessions');
  if (totalSessionsEl) {
    totalSessionsEl.textContent = history.length;
  }
  
  // Log analytics data
  console.log('=== SESSION COMPLETE ===');
  console.log('Accuracy Rate:', percentage + '%');
  console.log('Session Duration:', formatTime(sessionDuration));
  console.log('Avg Response Time:', (avgResponseTime / 1000).toFixed(2) + 's');
  console.log('Detailed Results:', state.results);
  console.log('Session saved to history');
  console.log('Sessions this week:', frequency.thisWeek);
  console.log('Accuracy trend:', trend);
}

function startSession() {
  initSession();
  showScreen('card');
  showNextCard();
}

function reviewMissedOnly() {
  // Review students who missed on first attempt (even if they got it right later)
  const missedIds = state.results.filter(r => !r.firstAttemptCorrect).map(r => r.studentId);
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
elements.recordBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  startRecording();
});
elements.stopRecordBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  stopRecording();
});
elements.playRecordedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (state.recordedAudio && !state.recordedAudio.paused) {
    state.recordedAudio.pause();
  } else {
    playRecorded();
  }
});
elements.deleteRecordedBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  deleteRecording();
});
elements.btnCorrect.addEventListener('click', () => recordResult(true));
elements.btnMissed.addEventListener('click', () => recordResult(false));
elements.reviewAgainBtn.addEventListener('click', () => {
  updateStartScreenAnalytics(); // Refresh analytics before starting new session
  startSession();
});
elements.reviewMissedBtn.addEventListener('click', reviewMissedOnly);
if (elements.backToHomeBtn) {
  elements.backToHomeBtn.addEventListener('click', () => {
    showScreen('start');
  });
}

// ============================================
// INITIALIZE
// ============================================
initSession();
updateStartScreenAnalytics();
console.log('Name Recall App Initialized');
console.log('Students loaded:', students.length);