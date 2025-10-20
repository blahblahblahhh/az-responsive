<template>
  <div class="instructions-container">
    <video class="background-video" autoplay loop muted playsinline>
      <source src="/aldo_start.mp4" type="video/mp4">
    </video>
    <div class="content-overlay">
      <div class="instructions-content">
        <div class="instructions-box">
          <div class="how-to-play-banner">
            <img src="/how-to-play.png" alt="How to Play" class="how-to-play-title">
          </div>
          <button @click="$emit('back')" class="back-button">
            <span class="back-arrow">←</span> GO BACK
          </button>
          
          <div class="instructions-list">
            <div class="instruction-item">
              <span class="bullet">•</span>
              <span class="instruction-text">
                You have <span class="highlight">30 seconds</span> per question to answer 
                <span class="highlight">7 questions</span>
              </span>
            </div>
            
            <div class="instruction-item">
              <span class="bullet">•</span>
              <span class="instruction-text">
                The <span class="highlight">faster</span> you correctly answer, the more 
                points you earn to drive up your score!
              </span>
            </div>
            
            <div class="instruction-item">
              <span class="bullet">•</span>
              <span class="instruction-text">
                Ready to test your knowledge of hypertension 
                and its link to aldosterone?
              </span>
            </div>
          </div>
          
          <button @click="$emit('startGame')" class="start-game-button">
            <span class="play-icon"></span>
            START THE GAME!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['back', 'startGame']);
</script>

<style scoped>
.instructions-container {
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
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.instructions-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  width: 90%;
}

.instructions-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 3rem 2rem 2rem 2rem;
  width: 100%;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
}

.how-to-play-banner {
  position: absolute;
  top: -1rem;
  left: -1.5rem;
}

.how-to-play-title {
  height: auto;
  max-width: 150px;
}

.back-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #333;
}

.back-arrow {
  font-size: 1.2rem;
}

.instructions-list {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  line-height: 1.4;
}

.bullet {
  color: #000;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: -0.2rem;
  flex-shrink: 0;
}

.instruction-text {
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
}

.highlight {
  color: #F3BE00;
  font-weight: 700;
}

.start-game-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: #F3BE00;
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  padding: 1rem 2rem;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.start-game-button:hover {
  background: #e6ab00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(243, 190, 0, 0.3);
}

.play-icon {
  background: url('/play-start.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .instructions-content {
    max-width: 90%;
  }
  
  .instructions-box {
    padding: 1.5rem;
  }
  
  .instruction-text {
    font-size: 1rem;
  }
  
  .start-game-button {
    font-size: 1.1rem;
    padding: 0.875rem 1.5rem;
  }
  
  .how-to-play-title {
    max-width: 120px;
  }
  
  .how-to-play-banner {
    left: 1rem;
  }
}
</style>