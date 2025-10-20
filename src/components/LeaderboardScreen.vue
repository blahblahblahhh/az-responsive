<template>
  <div class="leaderboard-screen">
    <div class="leaderboard-content">

      <!-- Corner icons -->
      <div class="content-header">
        <button class="game-button" @click="$emit('playAgain')" v-if="isFromResultsScreen">
          <img src="/play-again.png" alt="Play" class="button-icon">
          Play Again
        </button>
        <button v-if="isAdmin" class="game-button admin-clear" @click="clearDatabase">
          Clear Database
        </button>
        <!-- Admin export button -->
        <button v-if="isAdmin" class="game-button admin-export" @click="exportAllScores">
          Export Data
        </button>
        <!-- Live indicator -->
        <div v-if="isLive" class="live-indicator">
          <span class="live-dot"></span> LIVE UPDATES
        </div>
        <img src="/home.png" alt="Trophy" class="corner-trophy" @click="$emit('playAgain')">
      </div>

      <div class="take-down-container">
        <img src="/take-down-final.png">
      </div>
      
      <!-- Updated Top 3 Players -->
      <div class="top-players">
        <!-- 2nd Place -->
        <div class="trophy-container rank-2-container">
          <div class="trophy-shield">
            <div class="initials-display">{{ getPlayerByRank(2)?.initials}}</div>
          </div>
          <div class="rank-badge">
            <span class="rank-number">2<sup>ND</sup></span>
            <span class="score-number">{{ getPlayerByRank(2)?.score || 0 }}</span>
          </div>
        </div>
        
        <!-- 1st Place -->
        <div class="trophy-container rank-1-container">
          <div class="trophy-shield">
            <div class="initials-display">{{ getPlayerByRank(1)?.initials}}</div>
          </div>
          <div class="rank-badge">
            <span class="rank-number">1<sup>ST</sup></span>
            <span class="score-number">{{ getPlayerByRank(1)?.score || 0 }}</span>
          </div>
        </div>
        
        <!-- 3rd Place -->
        <div class="trophy-container rank-3-container">
          <div class="trophy-shield">
            <div class="initials-display">{{ getPlayerByRank(3)?.initials}}</div>
          </div>
          <div class="rank-badge">
            <span class="rank-number">3<sup>RD</sup></span>
            <span class="score-number">{{ getPlayerByRank(3)?.score || 0 }}</span>
          </div>
        </div>
      </div>
      
      <!-- Rest of the leaderboard in two columns -->
      <div class="leaderboard-grid">
        <div class="column left-column">
          <div 
            v-for="rank in [4, 5, 6, 7]" 
            :key="'left-' + rank"
            :class="['score-card', `rank-${rank}`, isCurrentPlayer(rank) ? 'current-player' : '']"
          >
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span class="rank-indicator">{{ rank }}<sup>{{ getSuffix(rank) }}</sup></span>
                <span class="player-initials">{{ getPlayerByRank(rank)?.initials || '' }}</span>
              </div>
              <div v-if="isCurrentPlayer(rank) && isFromResultsScreen" class="your-score">
                YOUR SCORE
                <span class="score-arrow"><img src="/your-score.png" alt="Your Score"></span>
                <span class="score">{{ getPlayerByRank(rank)?.score || 0 }}</span>
              </div>
              <div v-else class="score">{{ getPlayerByRank(rank)?.score || 0 }}</div>
            </div>
          </div>
        </div>
        
        <div class="column right-column">
          <div 
            v-for="rank in [8, 9, 10, 11]" 
            :key="'right-' + rank"
            :class="['score-card', `rank-${rank}`, isCurrentPlayer(rank) ? 'current-player' : '']"
          >
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <!-- Display the actual rank from the player object instead of the position -->
                <span class="rank-indicator">
                  {{ getPlayerByRank(rank)?.rank || rank }}<sup>{{ getSuffix(getPlayerByRank(rank)?.rank || rank) }}</sup>
                </span>
                <span class="player-initials">{{ getPlayerByRank(rank)?.initials || '' }}</span>
              </div>
              <div v-if="isCurrentPlayer(rank) && isFromResultsScreen" class="your-score">
                YOUR SCORE
                <span class="score-arrow"><img src="/your-score.png" alt="Your Score"></span>
                <span class="score">{{ getPlayerByRank(rank)?.score || 0 }}</span>
              </div>
              <div v-else class="score">
                {{ getPlayerByRank(rank)?.score || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="background-bar"></div>
    <span class="az-logo-leaderboard">
      <img src="/AZLOGO.png">
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '../stores/game';

const gameStore = useGameStore();

const props = defineProps({
  leaderboard: {
    type: Array,
    required: true
  },
  currentPlayer: {
    type: Object,
    default: () => ({ initials: 'TSD', score: 560 })
  },
  isFromResultsScreen: {
    type: Boolean,
    default: false
  }
});

const rankedLeaderboard = ref([]);
const currentPlayerRank = ref(12);
const displayLeaderboard = ref([]);
const isAdmin = ref(false);
const isLive = ref(false);
let refreshInterval = null;

// Check for URL parameters and watch for changes
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  isAdmin.value = urlParams.has('admin');
  isLive.value = urlParams.has('live');
  
  // Setup or clear the refresh interval based on live status
  setupRefreshInterval();
}

// Set up or clear the refresh interval
function setupRefreshInterval() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  
  // Set up new interval if live mode is enabled
  if (isLive.value) {
    refreshInterval = setInterval(async () => {
      console.log('Live refresh - fetching new leaderboard data');
      await gameStore.loadLeaderboard();
      processLeaderboard();
    }, 3000); // Refresh every 3 seconds
  }
}

// Watch for changes in the leaderboard data
watch(() => gameStore.leaderboard, (newLeaderboard) => {
  if (newLeaderboard.length > 0) {
    processLeaderboard();
  }
}, { deep: true });

onMounted(async () => {
  // Check for URL parameters
  checkUrlParams();
  
  // Add listener for URL changes
  window.addEventListener('popstate', checkUrlParams);
  
  // Ensure the database is initialized
  await gameStore.initializeDatabase();
  
  // If the leaderboard is empty, try to load it
  if (gameStore.leaderboard.length === 0) {
    await gameStore.loadLeaderboard();
  }
  
  processLeaderboard();
});

// Clean up the interval when the component is unmounted
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  window.removeEventListener('popstate', checkUrlParams);
});

// Function to clear the database
async function clearDatabase() {
  try {
    // Confirm before proceeding
    if (!confirm('Are you sure you want to clear all leaderboard data? This action cannot be undone.')) {
      return;
    }
    
    // Open database connection
    const request = indexedDB.open('quizGameDB', 1);
    
    request.onerror = event => {
      console.error("Database error:", event.target.error);
      alert("Error opening database");
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(['leaderboard'], 'readwrite');
      const store = transaction.objectStore('leaderboard');
      
      // Clear all records
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        console.log("Database cleared successfully");
        alert("Leaderboard database has been cleared");
        
        // Refresh the view
        gameStore.leaderboard = [];
        displayLeaderboard.value = [];
        rankedLeaderboard.value = [];
      };
      
      clearRequest.onerror = () => {
        console.error("Error clearing database:", clearRequest.error);
        alert("Error clearing database");
      };
    };
  } catch (error) {
    console.error("Error in clearDatabase:", error);
    alert("An error occurred while trying to clear the database");
  }
}

// Function to export all scores from the database
async function exportAllScores() {
  try {
    // Get all scores from the database
    const allScores = await getAllScores();
    
    // If no scores, show alert and return
    if (!allScores || allScores.length === 0) {
      alert('No scores to export');
      return;
    }
    
    // Convert to CSV
    const headers = ['ID', 'Initials', 'Score', 'Type', 'Total Bonus Time', 'Date', 'Questions Correct'];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    allScores.forEach(entry => {
      // Calculate estimated correct questions based on score and bonus time
      const baseScore = entry.score - (entry.bonusTimeScore || 0);
      const estimatedCorrectQuestions = Math.round(baseScore / 150);
      
      const row = [
        entry.id || '',
        entry.initials || '',
        entry.score || 0,
        entry.type || '',
        entry.bonusTimeScore || 0,
        entry.date || '',
        estimatedCorrectQuestions
      ];
      
      // Properly handle CSV escaping (wrap fields with commas in quotes)
      const escapedRow = row.map(field => {
        const str = String(field);
        return str.includes(',') ? `"${str}"` : str;
      });
      
      csvContent += escapedRow.join(',') + '\n';
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz-scores-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV export complete');
  } catch (error) {
    console.error('Error exporting scores:', error);
    alert('Error exporting scores. See console for details.');
  }
}

// Helper function to get all scores from the DB
async function getAllScores() {
  return new Promise((resolve, reject) => {
    // Check if DB is initialized
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    
    // Open the database
    const request = indexedDB.open('quizGameDB', 1);
    
    request.onerror = event => {
      console.error("Database error:", event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      const transaction = db.transaction(['leaderboard'], 'readonly');
      const store = transaction.objectStore('leaderboard');
      
      const getAll = store.getAll();
      
      getAll.onsuccess = () => {
        resolve(getAll.result);
      };
      
      getAll.onerror = () => {
        reject(getAll.error);
      };
    };
  });
}

function processLeaderboard() {
  // Create a copy of the current player with the isCurrentPlayer flag
  const currentPlayerEntry = props.currentPlayer?.initials 
    ? { ...props.currentPlayer, isCurrentPlayer: true } 
    : { initials: 'TSD', score: 560, isCurrentPlayer: true };
  
  // Use the database leaderboard data
  let allEntries = [...gameStore.leaderboard];
  
  // If coming from results screen, include the current player in the leaderboard
  if (props.isFromResultsScreen) {
    // Add current player
    allEntries.push(currentPlayerEntry);
  }
  
  // Sort by score (descending)
  allEntries.sort((a, b) => {
    // Primary sort by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Secondary sort by bonusTimeScore if scores are equal
    if (b.bonusTimeScore !== undefined && a.bonusTimeScore !== undefined && b.bonusTimeScore !== a.bonusTimeScore) {
      return b.bonusTimeScore - a.bonusTimeScore;
    }
    // Tertiary sort by date (more recent first) if both scores are equal
    if (b.date && a.date) {
      return new Date(b.date) - new Date(a.date);
    }
    return 0;
  });
  
  // Add rank to each entry
  rankedLeaderboard.value = allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
  
  // Find current player's rank if we're from results screen
  if (props.isFromResultsScreen) {
    const playerEntry = rankedLeaderboard.value.find(entry => entry.isCurrentPlayer === true);
    if (playerEntry) {
      currentPlayerRank.value = playerEntry.rank;
    } else {
      currentPlayerRank.value = 999; // Set to a high number if not found
    }
  }

  // Create the display leaderboard
  if (props.isFromResultsScreen) {
    // If coming from results screen, ensure player is visible
    if (currentPlayerRank.value <= 11) {
      // Player is already in top 11, use top 11
      displayLeaderboard.value = rankedLeaderboard.value.slice(0, 11);
    } else {
      // Player is below top 10, replace 11th position with player
      // BUT preserve their actual rank
      const playerEntry = rankedLeaderboard.value.find(entry => entry.isCurrentPlayer === true);
      if (playerEntry) {
        displayLeaderboard.value = [
          ...rankedLeaderboard.value.slice(0, 10),
          playerEntry // Keep original rank
        ];
      } else {
        // Fallback if player entry not found
        displayLeaderboard.value = rankedLeaderboard.value.slice(0, 11);
      }
    }
  } else {
    // Just viewing leaderboard - show actual top 11
    displayLeaderboard.value = rankedLeaderboard.value.slice(0, 11);
  }
}

function getPlayerByRank(rank) {
  // Special case: If we're looking at position 11 in the display but the player
  // has a rank outside the top 11, return the player at display position 11
  // (which is the current player) with their actual rank preserved
  if (rank === 11 && props.isFromResultsScreen && currentPlayerRank.value > 11) {
    return displayLeaderboard.value[10]; // Return player at display position 11 (index 10)
  }
  
  // Guard against out-of-bounds access
  if (rank < 1 || rank > displayLeaderboard.value.length) {
    return null;
  }
  
  // Get player at specific index in display leaderboard
  return displayLeaderboard.value[rank - 1];
}

function isCurrentPlayer(rank) {
  // Skip applying current-player class for top 3 ranks
  if (rank <= 3) return false;
  
  const player = getPlayerByRank(rank);
  return player && player.isCurrentPlayer === true;
}

function getSuffix(rank) {
  if (rank % 10 === 1 && rank !== 11) return 'ST';
  if (rank % 10 === 2 && rank !== 12) return 'ND';
  if (rank % 10 === 3 && rank !== 13) return 'RD';
  return 'TH';
}

function getBadgeClass(type) {
  switch (type) {
    case 'expert':
      return 'bg-warning text-dark';
    case 'scholar':
      return 'bg-info';
    default:
      return 'bg-secondary';
  }
}

// Create an exportable function to refresh leaderboard data
function refreshLeaderboard() {
  gameStore.loadLeaderboard().then(() => {
    processLeaderboard();
  });
}

defineEmits(['playAgain', 'viewLeaderboard']);
</script>

<style scoped>
.leaderboard-screen {
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('/leaderboard-bg.png') center/cover no-repeat;
  /* background: url(/Leaderboardbg.png);               */
  display: flex;
  justify-content: center;
  align-items: center;
}

.leaderboard-content {
  /* width: 90%;
  max-width: 1200px; */
  padding: 20px;
  z-index: 1;
  margin-bottom: 75px;
}

/* Updated Top players section */
.top-players {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 70px;
  position: relative;
  gap: 0;
  padding-top: 20px;
  background: url(/TROPHIES-1.png);
  background-size: 100% 100%;
  width: 609.66px;
  margin: 0 auto 20px;
  height: 444.53px;
}

.current-trophy {
  background-color: #F9C74F !important;
  color: #000 !important;
  box-shadow: 0 0 10px rgba(249, 199, 79, 0.8);
}

.current-trophy .rank-number,
.current-trophy .score-number {
  color: #000 !important;
  text-shadow: none;
}

/* Color customizations for each trophy */
.rank-1-container .initials-display {
  color: #6A2922;
  font-family: 'PF Fuel Grime';
  font-size: 98.98px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%; /* 81.163px */
  letter-spacing: -1.98px;
  padding-top: 22px;
}

.rank-2-container .initials-display,
.rank-3-container .initials-display {
  color: #131F2D;
  font-family: 'PF Fuel Grime';
  font-size: 57.664px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%; /* 47.285px */
  letter-spacing: -1.153px;
}

/* Trophy container */
.trophy-container {
  position: relative;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0 -5px; /* Create slight overlap */
}

/* Trophy shield (top part with initials) */
.trophy-shield {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 85px;
}

/* Initials display */
.initials-display {
  font-family: 'PF Fuel Grime';
  font-weight: 900;
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: -1px;
}

/* Rank badge (bottom part with rank and score) */
.rank-badge {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  position: absolute;
  bottom: 45px;
}

.rank-number, .score-number {
  font-size: 2.25rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

.rank-number sup {
  font-size: 0.8rem;
  position: relative;
  top: -1em;
}

/* Grid layout for remaining players */
.leaderboard-grid {
  display: flex;
  gap: 32px;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9.5px;
}

.card-body {
  color: #FFF;
  font-family: "Bebas Neue Pro";
  font-size: 47.196px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
}

.score-card {
  width: 739.093px;
  /* height: 92.505px; */
  flex-shrink: 0;
  border-radius: 28.318px;
  background: #4888A0;
  box-shadow: 0px 3.776px 3.776px 0px rgba(0, 0, 0, 0.25);
  padding: 20px 40px;
}

.rank-indicator {
  font-size: 47.196px;
  font-weight: bold;
  margin-right: 65px;
}

.player-initials {
  color: #FFF;
  font-family: "Bebas Neue Pro";
  font-size: 47.196px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
}

.score {
  font-weight: bold;
}

/* Current player highlight */
.current-player {
  background-color: #F9C74F !important;
  position: relative;
  color: #000;
}

.current-player .rank-indicator,
.current-player .player-initials {
  color: #000;
}

.your-score {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #0F2D42;
  font-family: "Bebas Neue Pro";
  font-size: 47.196px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
}

.score-arrow {
  margin: 0 10px;
  font-size: 2rem;
}

.score-arrow img {
  width: 104px;
}

/* Top player current player styling */
.top-your-score {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #F9C74F;
  color: #000;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

sup {
  font-size: 0.6em;
  position: relative;
  top: -0.6em;
}

.content-header {
  display: flex;
  justify-content: right;
  gap: 25px;
  padding-right: 2rem;
  position: absolute;
  right: 0;
  top: 104px;
  right: 104px;
  z-index: 100000;
}

.corner-home {
  visibility: hidden;
}

.game-button {
  display: flex;
  width: 253.583px;
  height: 68px;
  padding: 11.333px 28.333px;
  justify-content: center;
  align-items: center;
  gap: 8.5px;
  flex-shrink: 0;
  font-family: 'PF Fuel Grime';
  border-radius: 14.167px;
  border: 1.417px solid #A3A3A3;
  background: var(--Color-Brand-Amber, #FFC130);
  color: var(--Text-primary, #000);
  font-size: 32.583px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 48.875px */
}

.game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
}

.game-button.secondary {
  background-color: #444444;
  color: white;
}

/* Admin export button styling */
.admin-export {
  background-color: #4b8a3a !important;
  color: white !important;
}

.admin-export:hover {
  background-color: #5aa347 !important;
  box-shadow: 0 4px 8px rgba(75, 138, 58, 0.3);
}

.button-icon {
  height: 24px;
}

.background-bar {
  background: #0F2D42;
  height: 630px;
  width: 100%;
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
}

.leaderboard-screen::before {
    content: "";
    position: absolute;
    left: 60px;
    top: 207px;
    width: 450px;
    height: 155px;
    background: url('/leaderboard-title.png');
    background-size: 100% 100%;
}

.take-down-container {
  position: absolute;
  display: inline-block;
  padding: 1rem 2rem;
  margin-bottom: 1rem;
  background: url(/take-down.png);
  background-size: 100% 100%;
  padding: 20px 75px 20px 65px;
  left: -62px;
  top: 39px;
}

.title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  line-height: 1;
  white-space: nowrap;
  font-family: 'PF Fuel Grime';
}

.take-down {
  font-family: 'PF Fuel Grime';
  font-size: 2.5rem;
  /* font-weight: 700; */
  color: #fff;
  text-transform: uppercase;
}

.aldo-sterone {
  font-size: 4.125rem;
  font-weight: 800;
  color: #F3BE00;
  text-transform: uppercase;
  font-family: 'PF Fuel Grime';
}

.background-bar::before {
    content: "";
    background: linear-gradient(0deg, rgba(15, 45, 66,1) 37%, transparent);
    height: 100px;
    width: 100%;
    position: absolute;
    top: -62px;
}

/* Specific trophy styles */
/* .rank-1-container {
  background-image: url(/gold-lb.png);
  height: 339px;
  width: 304px;
  z-index: 3;
  transform: scale(1.3);
} */

.rank-1-container .trophy-shield {
    margin-top: 15px;
}

.rank-1-container .rank-badge {
  bottom: 0;
  gap: 20px;
  padding-bottom: 5px;
}

.rank-1-container .rank-number,
.rank-1-container .score-number {
    bottom: 0px;
    color: #FFF;
    font-family: "Bebas Neue Pro";
    font-size: 60.209px;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
    text-transform: uppercase;
}

.rank-1-container .rank-number sup {
  top: 1rem;
  position: absolute;
}
/* 
.rank-2-container {
  background-image: url(/silver-lb.png);
  height: 400px;
  width: 220px;
  z-index: 2;
}

.rank-3-container {
  background-image: url(/bronze-lb.png);
  height: 400px;
  width: 220px;
  z-index: 1;
} */

.az-logo-leaderboard {
  position: absolute;
  bottom: 50px !important;
  right: 104px;
}

.az-logo-leaderboard img {
  max-height: 50px;
}

.trophy-container.rank-1-container {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    justify-content: space-between;
    color: #FFF;
    font-family: "Bebas Neue Pro";
    font-size: 60.209px;
    font-style: normal;
    font-weight: 800;
    line-height: normal;
    text-transform: uppercase;
}

.trophy-container.rank-2-container {
    position: absolute;
    left: 45px;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    width: 155px;
}

.rank-2-container .rank-badge {
    bottom: 32px;
    gap: 20px;
}

.rank-2-container span.score-number,
.rank-2-container span.rank-number {
    color: #FFF;
font-family: "Bebas Neue Pro";
font-size: 50.576px;
font-style: normal;
font-weight: 800;
line-height: normal;
text-transform: uppercase;
}

.rank-2-container sup {
    position: absolute;
    top: 1.5em;
}

.trophy-container.rank-3-container {
    position: absolute;
    right: 45px;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    width: 155px;
}

.rank-3-container .rank-badge {
    bottom: 32px;
    gap: 20px;
}

.rank-3-container span.score-number,
.rank-3-container span.rank-number {
    color: #FFF;
font-family: "Bebas Neue Pro";
font-size: 50.576px;
font-style: normal;
font-weight: 800;
line-height: normal;
text-transform: uppercase;
}

.rank-3-container sup {
    position: absolute;
    top: 1.5em;
}
</style>