<template>
  <div class="game-container">
    <video class="background-video" autoplay loop muted playsinline>
      <source src="/NudgeGauge_1.mp4" type="video/mp4">
    </video>
    <div class="content-overlay">
      <div class="header-section">
        <p class="question-text">
          How much do <i>you</i><br>
          know about hypertension and<br>
          the role of aldosterone?
        </p>
        <button @click="$emit('startQuiz')" class="play-button">
          <span class="play-icon"></span>
          PLAY THE GAME
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['startQuiz']);
</script>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.content-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: 
    linear-gradient(to bottom, transparent 50%, rgba(15, 45, 66, 0.85) 100%),
    linear-gradient(90deg, rgba(15, 45, 66, 0.85) 0%, rgba(15, 45, 66, 0.6) 40%, transparent 70%);
}

.header-section {
  margin-top: 214px;
  margin-left: 75px;
  display: flex;
  flex-direction: column;
  gap: 84px;
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .header-section {
    margin-top: 219px;
    margin-left: 68px;
  }
  
  .play-icon {
    width: 159px;
    height: 159px;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .header-section {
    margin-top: 91px;
    margin-left: 0;
    padding: 0 20px;
    align-items: center;
    text-align: center;
  }
}


.question-text {
  color: #FFF;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #000;
  font-family: "Bebas Neue Pro";
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-style: normal;
  font-weight: 700;
  line-height: 113%;
  letter-spacing: -0.05em;
  margin: 0;
}

.question-text em,
.question-text i {
  color: #FFF;
  font-family: "Bebas Neue Pro";
  font-size: inherit;
  font-style: italic;
  font-weight: 700;
  line-height: 113%;
  letter-spacing: -0.05em;
  text-shadow: none;
  -webkit-text-stroke-width: 0;
}

.question-text span {
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: #000;
}

.play-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: transparent;
  border: none;
  color: #FFF;
  font-family: "PF Fuel Grime";
  font-size: clamp(2.5rem, 6vw, 60px);
  font-style: normal;
  font-weight: 400;
  line-height: 82%;
  letter-spacing: -1.776px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.play-button:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.play-icon {
  background: url('/play-start.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  width: 94px;
  height: 94px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

/* Desktop styles */
@media (min-width: 1025px) {
  .play-icon {
    width: 160px;
    height: 158px;
  }
}



</style>