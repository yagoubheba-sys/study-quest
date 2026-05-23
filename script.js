// Game State
const gameState = {
    level: 1,
    xp: 0,
    maxXP: 100,
    sessionsCompleted: 0,
    totalStudyTime: 0, // in seconds
    streak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    achievements: {
        firstStep: false,
        studier: false,
        marathon: false,
        sevenDayStreak: false,
        thirtyDayStreak: false,
        level5: false,
        level10: false
    }
};

// Timer State
let timerInterval = null;
let isRunning = false;
let isPaused = false;
let timeRemaining = 2 * 60 * 60; // 2 hours in seconds
let isStudyPhase = true; // true for study, false for break
let sessionCount = 1;

// Achievement Definitions
const achievementsList = [
    { id: 'firstStep', name: 'First Step', emoji: '👣', description: 'Complete your first study session' },
    { id: 'studier', name: 'Studier', emoji: '📚', description: 'Complete 10 sessions' },
    { id: 'marathon', name: 'Marathon', emoji: '🏃', description: 'Study for 10 hours total' },
    { id: 'sevenDayStreak', name: '7-Day Warrior', emoji: '⚔️', description: 'Maintain a 7-day streak' },
    { id: 'thirtyDayStreak', name: '30-Day Legend', emoji: '👑', description: 'Maintain a 30-day streak' },
    { id: 'level5', name: 'Rising Star', emoji: '⭐', description: 'Reach Level 5' },
    { id: 'level10', name: 'Master Scholar', emoji: '🧙', description: 'Reach Level 10' }
];

// DOM Elements
const levelDisplay = document.getElementById('levelDisplay');
const xpDisplay = document.getElementById('xpDisplay');
const streakDisplay = document.getElementById('streakDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const timerTime = timerDisplay.querySelector('.timer-time');
const timerLabel = timerDisplay.querySelector('.timer-label');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const levelProgress = document.getElementById('levelProgress');
const sessionsCompletedEl = document.getElementById('sessionsCompleted');
const totalTimeEl = document.getElementById('totalTime');
const bestStreakEl = document.getElementById('bestStreak');
const todayStatus = document.getElementById('todayStatus');
const checkInBtn = document.getElementById('checkInBtn');
const achievementsGrid = document.getElementById('achievementsGrid');
const sessionModal = document.getElementById('sessionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const xpGainedEl = document.getElementById('xpGained');
const levelUpMessageEl = document.getElementById('levelUpMessage');
const nextLevel = document.getElementById('nextLevel');
const sessionInfo = document.getElementById('sessionInfo');

// Initialize
function init() {
    loadGameState();
    renderAchievements();
    updateUI();
    checkStreak();
    updateTodayStatus();
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
closeModalBtn.addEventListener('click', () => sessionModal.classList.remove('active'));
checkInBtn.addEventListener('click', checkInToday);

// Timer Functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                completePhase();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        isPaused = true;
        clearInterval(timerInterval);
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    isRunning = false;
    isPaused = false;
    clearInterval(timerInterval);
    isStudyPhase = true;
    timeRemaining = 2 * 60 * 60;
    sessionCount = 1;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateTimerDisplay();
}

function completePhase() {
    clearInterval(timerInterval);
    isRunning = false;
    
    if (isStudyPhase) {
        // Study phase completed
        gameState.sessionsCompleted++;
        gameState.totalStudyTime += 2 * 60 * 60;
        gameState.xp += 100;
        
        checkLevelUp();
        checkAchievements();
        
        // Show modal
        xpGainedEl.textContent = 'You earned 100 XP!';
        if (levelUpMessageEl.textContent) {
            sessionModal.classList.add('active');
        } else {
            sessionModal.classList.add('active');
        }
        
        // Switch to break
        isStudyPhase = false;
        timeRemaining = 30 * 60; // 30 minutes
        timerLabel.textContent = 'Break Time';
        updateTimerDisplay();
        
        // Update today's status
        gameState.lastStudyDate = new Date().toDateString();
        updateTodayStatus();
    } else {
        // Break phase completed
        isStudyPhase = true;
        sessionCount++;
        timeRemaining = 2 * 60 * 60;
        timerLabel.textContent = 'Study Time';
        updateTimerDisplay();
    }
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    saveGameState();
}

function updateTimerDisplay() {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    timerTime.textContent = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
    
    sessionInfo.textContent = `Session ${sessionCount} of ∞`;
}

// XP and Leveling
function checkLevelUp() {
    while (gameState.xp >= gameState.maxXP) {
        gameState.xp -= gameState.maxXP;
        gameState.level++;
        gameState.maxXP = Math.ceil(gameState.maxXP * 1.2);
        
        levelUpMessageEl.textContent = `🎊 Level Up! You are now Level ${gameState.level}!`;
        
        checkAchievements();
    }
}

// Streak System
function checkStreak() {
    const today = new Date().toDateString();
    const lastDate = gameState.lastStudyDate;
    
    if (lastDate === today) {
        // Already studied today
        return;
    }
    
    const lastDateObj = lastDate ? new Date(lastDate) : null;
    const todayObj = new Date();
    
    if (lastDateObj) {
        const dayDifference = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));
        
        if (dayDifference === 1) {
            // Streak continues
            gameState.streak++;
        } else if (dayDifference > 1) {
            // Streak broken
            gameState.streak = 0;
        }
    }
    
    if (gameState.streak > gameState.bestStreak) {
        gameState.bestStreak = gameState.streak;
    }
}

function checkInToday() {
    const today = new Date().toDateString();
    
    if (gameState.lastStudyDate !== today) {
        gameState.lastStudyDate = today;
        checkStreak();
        gameState.streak++;
        
        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }
        
        checkAchievements();
        updateTodayStatus();
        saveGameState();
        
        alert(`✅ Checked in for today! Streak: ${gameState.streak}`);
    } else {
        alert('You already checked in today!');
    }
}

function updateTodayStatus() {
    const today = new Date().toDateString();
    const status = gameState.lastStudyDate === today 
        ? `✅ Studied today! Streak: ${gameState.streak} days`
        : `❌ Not studied today`;
    
    todayStatus.innerHTML = `<p>${status}</p>`;
}

// Achievements
function checkAchievements() {
    if (gameState.sessionsCompleted >= 1) gameState.achievements.firstStep = true;
    if (gameState.sessionsCompleted >= 10) gameState.achievements.studier = true;
    if (gameState.totalStudyTime >= 10 * 60 * 60) gameState.achievements.marathon = true;
    if (gameState.streak >= 7) gameState.achievements.sevenDayStreak = true;
    if (gameState.streak >= 30) gameState.achievements.thirtyDayStreak = true;
    if (gameState.level >= 5) gameState.achievements.level5 = true;
    if (gameState.level >= 10) gameState.achievements.level10 = true;
}

function renderAchievements() {
    achievementsGrid.innerHTML = '';
    
    achievementsList.forEach(achievement => {
        const isUnlocked = gameState.achievements[achievement.id];
        const div = document.createElement('div');
        div.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="achievement-icon">${achievement.emoji}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        `;
        achievementsGrid.appendChild(div);
    });
}

// UI Updates
function updateUI() {
    levelDisplay.textContent = gameState.level;
    xpDisplay.textContent = `${gameState.xp}/${gameState.maxXP}`;
    streakDisplay.textContent = gameState.streak;
    sessionsCompletedEl.textContent = gameState.sessionsCompleted;
    bestStreakEl.textContent = gameState.bestStreak;
    
    const hours = Math.floor(gameState.totalStudyTime / 3600);
    const minutes = Math.floor((gameState.totalStudyTime % 3600) / 60);
    totalTimeEl.textContent = `${hours}h ${minutes}m`;
    
    const progressPercent = (gameState.xp / gameState.maxXP) * 100;
    levelProgress.style.width = progressPercent + '%';
    
    nextLevel.textContent = gameState.level + 1;
}

// Local Storage
function saveGameState() {
    localStorage.setItem('studyQuestState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('studyQuestState');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
    }
}

// Initialize the app
init();
