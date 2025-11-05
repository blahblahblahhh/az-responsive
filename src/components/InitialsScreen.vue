<!-- InitialsScreen.vue with modified play-icon background -->
<template>
  <div class="game-container">
    <!-- <div class="background-image"></div> -->
    <div class="content-wrapper">
    <div class="top-bar">
      <div class="nav-items">
        <button @click="$emit('back')" class="back-button">
          <img src="/arrow-from-left.png"> <span>GO BACK</span>
        </button>
        <img src="/leaderboard-trophy.png" alt="Trophy" class="corner-trophy" @click="$emit('viewLeaderboard')">
      </div>
    </div>

    <div class="content-section">
      <div class="pressure-banner">CAN YOU HANDLE THE PRESSURE?</div>
      <h1 class="title">
        <span class="take-down">Take down</span>
        <span class="aldo-sterone">ALDO STERONE</span>
      </h1>

      <p class="instructions">
        <span class="highlight">Answer 7 questions,</span> responding quickly and correctly to secure your spot on the leaderboard.
      </p>

      <div class="initials-section">
        <div class="initials-box">
          <input
            type="text"
            v-model="initials"
            maxlength="3"
            placeholder="XXX"
            class="initials-input"
            @input="formatInitials"
          />
        </div>
        <div class="input-label" v-if="!initials"><img src="/enter-initials.png"></div>
        <div class="input-label" v-if="initials"><img src="/initials-entered.png"></div>
      </div>

      <div class="game-rules">
        <ul>
          <li>You have <span class="highlight">30 seconds</span> to answer each question</li>
          <li>
            The <span class="highlight">faster</span> you correctly answer using the touchscreen,
            <br>
            the <span class="highlight">more points</span> you earn to drive up your score
          </li>
        </ul>
      </div>

      <button 
        @click="$emit('continue', initials)" 
        :disabled="!initials"
        :class="['continue-button', { 'continue-button--active': initials }]"
      >
        <div class="button-content">
          <span class="play-icon"></span>
          CONTINUE
        </div>
      </button>

      <div class="pro-tip">
        <!-- <div class="tip-header">PRO<br>TIP</div>
        <p class="tip-text">
          Many of the answers can be <br>found within this booth.<br>
          Reviewing its attractions first <br>may improve your score.
        </p> -->
        <img src="/pro-tip-text.png">
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const initials = ref('');
const emit = defineEmits(['continue', 'back']);

function formatInitials(event) {
  initials.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '');
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background-image: url('/initials-final.png');
  background-size: 100% 100%;
  color: white;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  position: relative;
  min-height: 100vh;
  /* background: linear-gradient(90deg, #1a2632 0%, transparent 80%); */
  z-index: 1;
}

.background-image {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 45%;
  height: 80vh;
  background: url('/initial-screen-bg.png') right center/contain no-repeat;
  z-index: 0;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  position: absolute;
  top: 100px;
  right: 100px;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pressure-banner {
  background-color: var(--primary-color);
  white-space: nowrap;
  max-width: 416px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  color: var(--Background-color-alternate, #0D161F);
  font-family: 'PF Fuel Grime';
  font-size: 41.679px;
  font-style: normal;
  font-weight: 400;
  line-height: 92%; /* 38.345px */
  letter-spacing: -0.417px;
}

.back-button {
  background: transparent;
  border: none;
  color: var(--primary-color);
  font-weight: bold;
  cursor: pointer;
  font-size: clamp(1.35rem, 3vw, 1.5rem);
  font-family: 'PF Fuel Grime';
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-button span {
  color: #fff;
  font-size: 32.583px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 48.875px */
}

.back-button img {
  width: 28.333px;
  height: 28.333px;
  flex-shrink: 0;
}

.trophy-icon {
  background-color: var(--primary-color);
  border-radius: 50%;
  width: clamp(3rem, 6vw, 3.75rem);
  height: clamp(3rem, 6vw, 3.75rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-section {
  padding: 104px;
}

.title {
  margin-bottom: 2rem;
  display: flex;
  gap: 15px;
}

.take-down {
  color: var(--Color-Brand-white, #FFF);
  font-family: "Bebas Neue Pro";
  font-size: 114.002px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 114.002px */
  letter-spacing: -2.28px;
}

.aldo-sterone {
  display: block;
  margin-top: -0.5rem;
  font-family: 'PF Fuel Grime';
  color: #F3BE00;
  font-size: 125.009px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%; /* 102.507px */
  letter-spacing: -2.5px;
}

.instructions {
  margin-bottom: 3rem;
  color: #FFF;
  font-family: 'Inter';
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 146%;
  letter-spacing: -0.56px;
}

.highlight {
  color: #FCC822;
  font-family: 'Inter';
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 146%; /* 40.88px */
  letter-spacing: -0.56px;
}

.initials-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.initials-box {
  /* background: #2a3642; */
  /* padding: 0.8rem; */
  /* border: 2px solid var(--primary-color); */
  width: clamp(225px, 22.5vw, 300px);
  background: url('/input-bg.png');
  background-size: 100% 100%;
  outline: transparent;
  width: 254px;
  height: 155.524px;
  flex-shrink: 0;
}

input:focus{
    outline: none;
}

.initials-input {
  background: transparent;
  border: none;
  color: #000;
  font-size: 149.233px;
  font-weight: bold;
  text-align: center;
  font-family: 'PF Fuel Grime';
  width: 254px;
  height: 155.524px;
  flex-shrink: 0;
}

.initials-input::placeholder {
  /* color: rgba(170, 131, 6, 0.3); */
  color: #AA8306;
  font-family: 'PF Fuel Grime';
  font-size: 149.233px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%; /* 122.371px */
  letter-spacing: -2.985px;
}

.arrow {
  color: var(--primary-color);
  font-size: clamp(2.25rem, 4.5vw, 3rem);
}

.input-label {
  color: var(--Color-Brand-white, #FFF);
  font-family: "Bebas Neue Pro";
  font-size: 68.287px;
  font-style: normal;
  font-weight: 700;
  line-height: 108%; /* 73.75px */
  letter-spacing: -1.366px;
}

.game-rules {
  margin-bottom: 3rem;
}

.game-rules ul {
  /* list-style: none; */
  padding: 0;
  margin-left: 25px;
}

.game-rules li {
  margin-bottom: 1rem;
  color: #FFF;
  font-family: 'Inter';
  font-size: 27px;
  font-style: normal;
  font-weight: 500;
  line-height: 136%; /* 36.72px */
}

.continue-button {
  background: transparent;
  border: none;
  color: #666;
  font-size: clamp(1.8rem, 3.75vw, 2.25rem);
  font-weight: bold;
  cursor: not-allowed;
  padding: 0;
  margin-bottom: 3rem;
  transition: transform 0.2s ease;
}

.continue-button:hover {
  transform: scale(1.05);
}

.continue-button--active {
  color: white;
  cursor: pointer;
}

.continue-button--active .play-icon {
  background-color: var(--primary-color);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 4.25rem;
}

.play-icon {
  background: url('/start-inactive.png');
  background-size: 100% 100%;
  transition: filter 0.2s ease;
  width: clamp(7.5rem, 12vw, 9rem);
  height: clamp(7.5rem, 12vw, 9rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.continue-button--active .play-icon {
  background: url('/play-active.png');
  background-size: 100% 100%;
}

.pro-tip {
  position: absolute;
  bottom: 250px;
  right: 72px;
  width: 603.229px;
  height: 225.566px;
}

.pro-tip img {
  height: 100%;
  width: 100%;
}

/* .pro-tip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 9.665px solid #F3BE00;
  z-index: -1;
  width: 603.229px;
  height: 225.566px;
  transform: skew(-0.819deg);
  flex-shrink: 0;
} */

.pro-tip > * {
  /* transform: skew(5deg); */
}

.tip-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100px;
  margin-right: 10px;
  color: #FFF;
  font-size: 76.304px;
  font-style: normal;
  font-weight: 400;
  line-height: 82%;
  letter-spacing: -1.526px;
  font-family: 'PF Fuel Grime';
}

.tip-text {
  font-family: 'Inter';
  color: #FFF;
  font-size: 25.38px;
  font-style: normal;
  font-weight: 600;
  line-height: 136%; /* 34.517px */
}

.continue-button:disabled .play-icon {
  filter: grayscale(100%);
}

@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .content-section {
    padding: 0 1rem;
  }

  .pro-tip {
    position: static;
    margin: 2rem 0;
  }
}

@media (max-width: 480px) {
  .top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-items {
    width: 100%;
    justify-content: space-between;
  }

  .initials-section {
    flex-direction: column;
    align-items: flex-start;
  }
}

.corner-trophy {
  width: 71px;
  height: 71px;
  flex-shrink: 0;
}

.pressure-banner,
h1.title,
.pro-tip,
p.instructions,
.game-rules {
    display: none !important;
}

.initials-section {
    position: absolute;
    top: 429px;
    left: 136px;
    /* opacity: .3; */
}


button.continue-button {
    left: 131px;
    position: absolute;
    bottom: 73px;
}
</style>