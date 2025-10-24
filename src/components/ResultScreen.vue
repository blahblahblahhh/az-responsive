<template>
  <div class="results-container">
    <!-- Background -->
    <div class="background-layer"></div>
    
    <!-- Header Icons -->
    <div class="header-icons">
      <img src="/leaderboard-trophy.png" alt="Leaderboard" class="header-icon" @click="$emit('viewLeaderboard')">
      <img src="/home.png" alt="Home" class="header-icon" @click="$emit('playAgain')">
    </div>

    <!-- Game Complete Header - Fixed Position -->
    <div class="game-complete-header">
      <img src="/level-complete-header.png" alt="Game Complete">
    </div>

    <!-- Main Content Panel -->
    <div class="main-panel">
      
      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Left Side - Trophy Section -->
        <div class="trophy-section">
          <!-- Trophy Background with Score Overlay -->
          <div class="trophy-container">
            <img :src="getTrophyImage()" alt="Trophy" class="trophy-background">
            
            <!-- Score Overlay -->
            <div class="score-overlay">
              <div class="total-score-label">TOTAL SCORE</div>
              <div class="score-number" :class="playerType">{{ score }}</div>
              <div class="player-type-message">
                You're a hypertension {{ playerType }}!
              </div>
            </div>
          </div>

          <!-- Play Again Button -->
          <button class="play-again-btn" @click="$emit('playAgain')">
            <img src="/play-again.png" alt="Play Again" class="btn-icon">
            PLAY AGAIN
          </button>
        </div>

        <!-- Vertical Divider Line -->
        <div class="divider-line"></div>

        <!-- Right Side - Description -->
        <div class="description-section">
          <div class="description-text" v-html="getDescription()"></div>
          
          <!-- QR Code Section -->
          <div class="qr-section">
            <div class="qr-code">
              <img src="/qr-code.png" alt="QR Code">
            </div>
            <div class="website-text">
              Visit<br>
              <strong>aldosteronehypertension.com</strong><br>
              to learn more
            </div>
          </div>
        </div>
      </div>

          <!-- Character Image -->
      <div class="character-image">
        <img src="/aldo-hammer-score.png" alt="Character" class="character-desktop">
        <img src="/aldo-hammer-score-mobile.png" alt="Character" class="character-mobile">
      </div>
    </div>

    <div class="gradient-overlay"></div>

    <!-- AstraZeneca Logo -->
    <div class="logo-section">
      <img src="/AZLOGO.png" alt="AstraZeneca" class="az-logo">
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  playerInitials: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  playerType: {
    type: String,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },
  bonusTimeScore: {
    type: Number,
    default: 0
  }
});

const getTrophyImage = () => {
  switch (props.playerType) {
    case 'expert':
      return '/expert-trophy.png';
    case 'scholar':
      return '/trophy-scholar.png';
    case 'explorer':
      return '/trophy-explorer.png';
    default:
      return '/trophy-explorer.png';
  }
};

const getDescription = () => {
  const baseText = `Your knowledge of hypertension and its link to aldosterone is masterful. You correctly answered ${props.correctAnswers} out of 7 questions—plus earned a bonus time of ${calculateBonusTimeScore().toFixed(2)} seconds to help fight Aldo Sterone's hold on hypertension, which adds to your total score.`;
  
  switch (props.playerType) {
    case 'expert':
      return baseText.replace('is masterful', 'is masterful');
    case 'scholar':
      return baseText.replace('is masterful', 'is solid');
    case 'explorer':
      return baseText.replace('is masterful', 'has begun');
    default:
      return baseText;
  }
};

function calculateBonusTimeScore() {
  if (props.bonusTimeScore > 0) {
    return props.bonusTimeScore;
  }
  const baseScore = props.correctAnswers * 150;
  return props.score - baseScore;
}

defineEmits(['viewLeaderboard', 'playAgain']);
</script>

<style scoped>
.results-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  color: white;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/leaderboard-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.header-icons {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.header-icon {
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.header-icon:hover {
  transform: scale(1.1);
}

.game-complete-header {
  position: absolute;
  top: 1rem;
  left: 2rem;
  z-index: 10;
}

.game-complete-header img {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.main-panel {
  position: absolute;
  top: 50%;
  left: 2rem;
  right: 2rem;
  transform: translateY(-50%);
  background: #0F2D42;
  border-radius: 8px;
  padding: 2rem;
  z-index: 5;
  max-height: 682px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(0deg, rgba(0,0,0,1) 37%, transparent);
  z-index: 15;
  pointer-events: none;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 6;
  width: 100%;
  padding-right: 300px; /* Space for character image on the right */
}

.trophy-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.divider-line {
  width: 1px;
  background-color: #FFF;
  height: 100%;
  min-height: 400px;
  opacity: 0.3;
}

.trophy-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.trophy-background {
  width: 100%;
  height: auto;
  display: block;
}

.score-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 7;
}

.total-score-label {
  font-family: 'Bebas Neue Pro', sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 4.95px;
  color: #FFF;
  margin-bottom: 0.5rem;
}

.score-number {
  font-family: 'PF Fuel Grime', sans-serif;
  font-size: 104px;
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -2px;
  margin: 0.5rem 0;
}

.score-number.expert {
  color: #F3BE00;
}

.score-number.scholar {
  color: #A3A3A3;
}

.score-number.explorer {
  color: #CF9669;
}

.player-type-message {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #FFF;
  margin-top: 1rem;
}

.qr-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.qr-code img {
  width: 80px;
  height: 80px;
}

.website-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.4;
  color: #FFF;
}

.website-text strong {
  font-weight: 700;
}

.play-again-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #FFC130;
  border: 2px solid #FFC130;
  border-radius: 14px;
  color: #000;
  font-family: 'PF Fuel Grime', sans-serif;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-again-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 48, 0.3);
}

.btn-icon {
  width: 24px;
  height: 24px;
}

.description-section {
  padding: 2rem;
  color: #FFF;
}

.description-text {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.4;
  color: #FFF;
}

.character-image {
  position: absolute;
  right: -200px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 6;
  pointer-events: none;
}

.character-desktop {
  width: 600px;
  height: auto;
}

.character-mobile {
  display: none;
}

.logo-section {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
}

.az-logo {
  width: 120px;
  height: auto;
}

/* Tablet Styles */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    padding-right: 0;
  }
  
  .character-image {
    right: -150px;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .character-desktop {
    width: 400px;
    height: auto;
  }
  
  .character-mobile {
    display: none;
  }
  
  .description-section {
    order: -1;
    margin-bottom: 2rem;
  }
  
  .score-number {
    font-size: 80px;
  }
  
  .description-text {
    font-size: 20px;
  }
  
  .game-complete-header {
    position: relative;
    left: 0;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .main-panel {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    transform: none;
    margin: 2rem;
    display: block;
    max-height: none;
  }
  
  .divider-line {
    display: none;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .results-container {
    overflow-x: hidden;
  }
  
  .main-panel {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    transform: none;
    padding: 1rem;
    margin: 1rem;
    margin-top: 2rem;
    display: block;
    max-height: none;
    overflow: visible;
  }
  
  .gradient-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
  }
  
  .header-icons {
    top: 1rem;
    right: 1rem;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .game-complete-header {
    position: relative;
    top: 0;
    left: 0;
    text-align: center;
    margin: 1rem;
    margin-bottom: 2rem;
  }
  
  .game-complete-header img {
    max-width: 350px;
    width: 100%;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-right: 0;
    max-width: 100%;
    overflow: visible;
  }
  
  .trophy-section {
    gap: 1.5rem;
    order: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .trophy-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .trophy-background {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .score-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 7;
    width: 90%;
  }
  
  .description-section {
    order: 2;
    padding: 1rem;
    width: 100%;
    max-width: 100%;
  }
  
  .divider-line {
    display: none;
  }
  
  .score-number {
    font-size: 48px;
    line-height: 1;
  }
  
  .total-score-label {
    font-size: 10px;
    letter-spacing: 2px;
  }
  
  .player-type-message {
    font-size: 14px;
    margin-top: 0.5rem;
  }
  
  .qr-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
  }
  
  .qr-code img {
    width: 60px;
    height: 60px;
  }
  
  .website-text {
    font-size: 12px;
    text-align: left;
  }
  
  .play-again-btn {
    padding: 0.8rem 1.5rem;
    font-size: 16px;
    margin-top: 1rem;
  }
  
  .description-text {
    font-size: 16px;
    line-height: 1.4;
  }
  
  .character-image {
    position: absolute;
    right: 0;
    bottom: 0;
    top: unset;
    transform: unset;
    z-index: 7;
    pointer-events: none;
    text-align: right;
  }
  
  .character-desktop {
    display: none;
  }
  
  .character-mobile {
    display: block;
    width: 160px;
    height: 363px;
    flex-shrink: 0;
    object-fit: contain;
    margin-left: auto;
    margin-right: 0;
  }
  
  .logo-section {
    position: relative;
    text-align: center;
    margin-top: 2rem;
  }
  
  .az-logo {
    width: 80px;
  }
}

/* Extra small mobile */
@media (max-width: 480px) {
  .game-complete-header img {
    max-width: 250px;
  }
  
  .score-number {
    font-size: 36px;
  }
  
  .description-text {
    font-size: 14px;
  }
  
  .character-image {
    right: 0;
    bottom: 0;
    top: unset;
    transform: unset;
  }
  
  .character-mobile {
    width: 100px;
    height: auto;
    max-height: 220px;
    margin-left: auto;
    margin-right: 0;
  }
  
  .trophy-container {
    max-width: 250px;
  }
  
  .main-panel {
    margin: 0.5rem;
    padding: 0.5rem;
  }
  
  .total-score-label {
    font-size: 8px;
    letter-spacing: 1px;
  }
  
  .player-type-message {
    font-size: 12px;
  }
}

/* Small/Medium Desktop (13" MacBook) - 60% scaling */
@media (min-width: 1025px) and (max-width: 1680px) {
  .main-panel {
    padding: 1.2rem; /* 60% of 2rem */
    margin: 1.2rem; /* 60% of 2rem */
    max-height: 409.2px; /* 60% of 682px */
  }

  .content-grid {
    gap: 2.4rem; /* 60% of 4rem */
    padding-right: 180px; /* 60% of 300px */
  }

  .game-complete-header img {
    max-width: 360px; /* 60% of 600px */
  }

  .trophy-container {
    max-width: 240px; /* 60% of 400px */
  }

  .score-number {
    font-size: 62.4px; /* 60% of 104px */
  }

  .total-score-label {
    font-size: 8.4px; /* 60% of 14px */
    letter-spacing: 2.97px; /* 60% of 4.95px */
    margin-bottom: 0.3rem; /* 60% of 0.5rem */
  }

  .player-type-message {
    font-size: 10.8px; /* 60% of 18px */
    margin-top: 0.6rem; /* 60% of 1rem */
  }

  .description-section {
    padding: 1.2rem; /* 60% of 2rem */
  }

  .description-text {
    font-size: 14.4px; /* 60% of 24px */
  }

  .qr-section {
    margin: 1.2rem 0; /* 60% of 2rem */
    gap: 0.6rem; /* 60% of 1rem */
  }

  .qr-code img {
    width: 48px; /* 60% of 80px */
    height: 48px;
  }

  .website-text {
    font-size: 8.4px; /* 60% of 14px */
  }

  .play-again-btn {
    padding: 0.6rem 1.2rem; /* 60% of 1rem 2rem */
    font-size: 10.8px; /* 60% of 18px */
    border-radius: 8.4px; /* 60% of 14px */
  }

  .btn-icon {
    width: 14.4px; /* 60% of 24px */
    height: 14.4px;
  }

  .character-image {
    right: -120px; /* 60% of -200px */
  }

  .character-desktop {
    width: 360px; /* 60% of 600px */
  }

  .header-icons {
    top: 1.2rem; /* 60% of 2rem */
    right: 1.2rem;
    gap: 0.6rem; /* 60% of 1rem */
  }

  .header-icon {
    width: 36px; /* 60% of 60px */
    height: 36px;
  }

  .logo-section {
    bottom: 1.2rem; /* 60% of 2rem */
    right: 1.2rem;
  }

  .az-logo {
    width: 72px; /* 60% of 120px */
  }

  .divider-line {
    min-height: 240px; /* 60% of 400px */
  }
}

/* Larger Desktop - 80% scaling */
@media (min-width: 1681px) and (max-width: 1919px) {
  .main-panel {
    padding: 1.6rem; /* 80% of 2rem */
    margin: 1.6rem; /* 80% of 2rem */
    max-height: 545.6px; /* 80% of 682px */
  }

  .content-grid {
    gap: 3.2rem; /* 80% of 4rem */
    padding-right: 240px; /* 80% of 300px */
  }

  .game-complete-header img {
    max-width: 480px; /* 80% of 600px */
  }

  .trophy-container {
    max-width: 320px; /* 80% of 400px */
  }

  .score-number {
    font-size: 83.2px; /* 80% of 104px */
  }

  .total-score-label {
    font-size: 11.2px; /* 80% of 14px */
    letter-spacing: 3.96px; /* 80% of 4.95px */
    margin-bottom: 0.4rem; /* 80% of 0.5rem */
  }

  .player-type-message {
    font-size: 14.4px; /* 80% of 18px */
    margin-top: 0.8rem; /* 80% of 1rem */
  }

  .description-section {
    padding: 1.6rem; /* 80% of 2rem */
  }

  .description-text {
    font-size: 19.2px; /* 80% of 24px */
  }

  .qr-section {
    margin: 1.6rem 0; /* 80% of 2rem */
    gap: 0.8rem; /* 80% of 1rem */
  }

  .qr-code img {
    width: 64px; /* 80% of 80px */
    height: 64px;
  }

  .website-text {
    font-size: 11.2px; /* 80% of 14px */
  }

  .play-again-btn {
    padding: 0.8rem 1.6rem; /* 80% of 1rem 2rem */
    font-size: 14.4px; /* 80% of 18px */
    border-radius: 11.2px; /* 80% of 14px */
  }

  .btn-icon {
    width: 19.2px; /* 80% of 24px */
    height: 19.2px;
  }

  .character-image {
    right: -160px; /* 80% of -200px */
  }

  .character-desktop {
    width: 480px; /* 80% of 600px */
  }

  .header-icons {
    top: 1.6rem; /* 80% of 2rem */
    right: 1.6rem;
    gap: 0.8rem; /* 80% of 1rem */
  }

  .header-icon {
    width: 48px; /* 80% of 60px */
    height: 48px;
  }

  .logo-section {
    bottom: 1.6rem; /* 80% of 2rem */
    right: 1.6rem;
  }

  .az-logo {
    width: 96px; /* 80% of 120px */
  }

  .divider-line {
    min-height: 320px; /* 80% of 400px */
  }
}
</style>