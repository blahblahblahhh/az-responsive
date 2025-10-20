<template>
  <div class="game-container">
    <div class="background-image-gradient"></div>
    <div class="content-wrapper">
      <!-- Corner icons -->
      <div class="content-header">
        <img src="/leaderboard-trophy.png" alt="Trophy" class="corner-trophy" @click="$emit('viewLeaderboard')">
        <img src="/home.png" alt="Home" class="corner-home" @click="$emit('playAgain')">
      </div>
  

      <div class="score-section">
        <div class="left-side">
          <!-- Level complete header -->
          <div :class="['level-complete-header', playerType]">
            <img :src="[playerType + '-level-complete.png']">
          </div>
          <div class="score-content">
            <!-- Trophy image based on player type -->
            <img :src="`/${playerType}.png`" alt="Achievement" class="trophy-image">
            
            <div class="score-stack">
              <!-- Score display -->
              <div :class="['player-score ' + playerType]">
                <img :src="`/${playerType}-star-icon.png`" alt="Star" class="score-star">
                <span class="score-initials">{{ playerInitials }}:</span>
                <div class="total-score-item">
                  <span class="total-score-text">TOTAL SCORE</span>
                  <span class="score-value">{{ score }}</span>
                </div>
              </div>
              
              <div class="player-details">
                <!-- Player type badge -->
                <div class="player-type-badge">
                  You're an<br>aldosterone<br>{{ playerType }}!
                </div>
                <!-- Description -->
                <p class="type-description" v-html="typeDescription"></p>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="button-section d-flex justify-content-center gap-3">
            <button class="game-button" @click="$emit('viewLeaderboard')">
              <img src="/button-trophy.png" alt="Play" class="button-icon">
              View Leaderboard
            </button>
            <button class="game-button" @click="$emit('playAgain')">
              <img src="/play-again.png" alt="Play" class="button-icon">
              Play Again
            </button>
          </div>
        </div>
        <div class="right-side">
          <!-- Stats section -->
          <div class="stats-section">
            <h1 class="keep-fighting">KEEP FIGHTING FOR CONTROL!</h1>
            <p class="stats-text">
              You answered {{ correctAnswers }} out of <strong>7</strong><br>
              questions correctly! Plus, you<br>
              earned a bonus time of {{ calculateBonusTimeScore().toFixed(2) }}
              <br>seconds to help fight Aldo<br>
              Sterone's hold on hypertension,
              <br>which adds to your total score.
            </p>
          </div>
        </div>
      </div>
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

function calculateBonusTimeScore() {
  // If bonus time is explicitly provided, use it
  if (props.bonusTimeScore > 0) {
    return props.bonusTimeScore;
  }
  
  // Otherwise calculate it based on total score and correct answers
  // Each correct answer gives 150 base points
  const baseScore = props.correctAnswers * 150;
  return props.score - baseScore;
}

const typeDescription = computed(() => {
  switch (props.playerType) {
    case 'expert':
      return 'Your knowledge of<br>aldosterone and its<br>link to hypertension<br>is masterful.';
    case 'scholar':
      return 'You have a solid<br>understanding of<br>aldosterone and its<br>link to hypertension.';
    default:
      return 'Your journey into the<br>world of aldosterone and<br>its link to hypertension<br>has begun!';
  }
});

defineEmits(['viewLeaderboard', 'playAgain']);
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: #000000;
  color: white;
  position: relative;
  overflow: hidden;
  background-image: url('/leaderboard-bg.png');
  background-size: 100% 100%;
}

.content-wrapper {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(90deg, #1a2632 0%, transparent 80%);
  z-index: 1;
  padding: 2rem;
}

.left-side {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.level-complete-header {
  text-align: center;
  margin-top: -150px;
  width: 779px;
  margin-left: 85px;
}

.level-complete-header img {
    width: 100%;
}

/* Score section */
.score-section {
  position: relative;
  text-align: center;
  margin-top: 125px;
  margin-bottom: 2rem;
  background-color: #0F2D42;
  padding: 2rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
}

.right-side {
  margin-right: auto;
  width: 350px;
  text-align: left;
}

.trophy-image {
  width: 200px;
  margin-bottom: 2rem;
}

.player-score {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 32px;
  font-family: 'PF Fuel Grime';
  /* scale: 1.4; */
}

.score-value {
  color: #CF9669;
  font-family: 'PF Fuel Grime';
  font-size: 104.699px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%;
  letter-spacing: -2.094px;
  position: relative;
}

.score-initials {
  margin-left: 10px;
  rotate: -2deg;
  margin-right: 5px;
  color: #FFF;
  font-family: 'PF Fuel Grime';
  font-size: 115.323px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%; /* 94.565px */
  letter-spacing: -2.306px;
}

.player-type-badge {
  font-size: 3.2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  border-right: 1px solid #fff;
  padding-right: 30px;
  margin-right: 30px;
  line-height: 1;
}

.type-description {
  color: #FFF;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  min-width: 255.347px;
}

/* Stats section */
.stats-text {
  font-size: 2rem;
  color: #FFF;
  font-family: 'Inter';
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 136%; /* 32.64px */
}

.stats-text strong {
  color: #FFF;
  font-family: Inter;
  font-size: 24px;
  font-style: normal;
  font-weight: 800;
  line-height: 136%;
}

/* Buttons */
.game-button {
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  height: 68px;
  padding: 11.333px 28.333px;
  justify-content: center;
  align-items: center;
  gap: 8.5px;
  flex-shrink: 0;
  border-radius: 14.167px;
  border: 1.417px solid var(--Color-Brand-Amber, #FFC130);
  background: var(--Color-Brand-Amber, #FFC130);
  font-family: 'PF Fuel Grime';
}

.game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
}

.game-button.secondary {
  background-color: #444444;
  color: white;
}

.button-icon {
  height: 24px;
}

/* Remove Bootstrap classes but keep functionality */
.d-flex {
  display: flex;
}

.justify-content-center {
  justify-content: center;
}

.gap-3 {
  gap: 1rem;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .background-image {
    opacity: 0.3;
  }
}

.score-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}

.player-details {
    display: flex;
    max-width: 450px;
    align-items: stretch;
    text-align: left;
}

.score-section::before {
    content: "";
    background: url("/aldo-full.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 924px;
    height: 1666px;
    display: flex;
    position: absolute;
    right: -375px;
    top: -100px;
}

.background-image-gradient {
    background: linear-gradient(0deg, rgba(0,0,0,1) 37%, transparent);
    height: 200px;
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 10;
}

.score-section {
  padding: 2.5rem;
}

.trophy-image {
  width: 250px;
  margin-bottom: 2.5rem;
  margin-right: 25px;
}

.score-star {
  width: 98.338px;
height: 98.338px;
}

.player-type-badge {
  padding-right: 37px;
  margin-right: 37px;
}

.game-button {
  padding: 1.25rem 2.5rem;
  border-radius: 10px;
  font-size: 2rem;
  gap: 0.625rem;
}

.right-side {
  width: 438px;
}

.keep-fighting {
  font-family: 'PF Fuel Grime';
  color: #FFF;
  font-size: 39.898px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 59.847px */
}

.content-header {
  display: flex;
  justify-content: right;
  gap: 25px;
}

.total-score-text {
    content: "TOTAL SCORE";
    color: #FFF;
    text-align: center;
    font-family: "Bebas Neue Pro";
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 92%; /* 13.8px */
    letter-spacing: 4.95px;
    /* position: absolute; */
}

.expert span.score-value {
    color: #F3BE00;
}

.scholar span.score-value {
  color: #A3A3A3;
}

.total-score-item {
    display: flex;
    flex-direction: column;
}
</style>