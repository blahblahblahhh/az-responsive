<template>
  <div class="instructions-container">
    <div class="background-image"></div>
    <div class="content-overlay">
      <!-- Top Right Timer and Home -->
      <div class="header-section">
        <div class="timer-section">
          <img src="/instructions-timer.png" alt="Timer" class="instructions-timer">
        </div>
        <button @click="$emit('back')" class="home-button">
          <img src="/home.png" alt="Home">
        </button>
      </div>
      
      <div class="instructions-content">
        <div class="instructions-box">
          <div class="how-to-play-banner">
            <img src="/how-to-play.png" alt="How to Play" class="how-to-play-title">
          </div>
          <div class="back-button-container">
            <button @click="$emit('back')" class="back-button">
              <img src="/go-back.png" alt="Go Back">
            </button>
          </div>
          
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
                The <span class="highlight">faster</span> you correctly answer, the <span class="highlight">more 
                points</span> you earn to <span class="highlight">drive up your score!</span>
              </span>
            </div>
            
            <div class="instruction-item">
              <span class="bullet">•</span>
              <span class="instruction-text">
                Ready to test <span class="highlight">your knowledge</span> of hypertension 
                and its link to aldosterone?
              </span>
            </div>
          </div>
          
          <button @click="$emit('startGame')" class="start-game-button">
            <img src="/start-the-game.png" alt="Start The Game">
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
  height: 100dvh; /* Dynamic viewport height for mobile */
  overflow: hidden;
}

.header-section {
  position: absolute;
  top: 50px;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 3;
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 900px) {
  .header-section {
    top: 40px;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .header-section {
    top: 17px;
  }
}

.timer-section {
  display: flex;
  align-items: center;
}

.instructions-timer {
  height: clamp(40px, 5vw, 60px);
  width: auto;
}

.home-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
}

.home-button:hover {
  transform: scale(1.05);
}

.home-button img {
  height: clamp(40px, 5vw, 60px);
  width: auto;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

/* Mobile background */
@media (max-width: 768px) {
  .background-image {
    background-image: url('/instructions.png');
  }
}

/* Tablet background */
@media (min-width: 769px) and (max-width: 1024px) {
  .background-image {
    background-image: url('/instructions.png');
  }
  
  .how-to-play-title {
    width: clamp(200px, 25vw, 410.183px) !important; /* Responsive equivalent for tablet range */
    max-width: 410.183px !important;
  }
  
  .how-to-play-banner {
    left: clamp(-1.2rem, -2vw, -2.5rem); /* Adjust negative margin to maintain overlay */
    top: clamp(-0.8rem, -1vw, -1.5rem);
  }
  
  .instructions-box {
    padding: clamp(2rem, 3vw, 3.5rem); /* Scale padding proportionally */
  }
}

/* Desktop background */
@media (min-width: 1025px) {
  .background-image {
    background-image: url('/instructions.png');
  }
}

.content-overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  padding: clamp(50px, 8vh, 80px) 220px 2rem 2rem;
  display: flex;
  align-items: flex-start;
}

.instructions-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: clamp(700px, 55vw, 1054px);
  padding-left: 3rem;
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 900px) {
  .content-overlay {
    padding: clamp(40px, 6vh, 60px) clamp(150px, 15vw, 200px) 2rem 2rem;
  }
  
  .instructions-content {
    max-width: clamp(350px, 56vw, 450px);
    padding-left: 2rem;
  }
  
  .instructions-box {
    padding: 2.5rem 2rem 2rem 2rem;
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .content-overlay {
    padding: 2rem 1rem !important;
    align-items: center;
    justify-content: center;
  }
  
  .instructions-content {
    max-width: 90% !important;
    align-items: center;
    padding-left: unset !important;
  }
  
  .instructions-box {
    padding: 1.5rem !important;
    min-height: auto !important;
  }
  
  .instruction-text {
    font-size: 1rem !important;
  }
  
  .how-to-play-title {
    max-width: 120px;
  }
  
  .how-to-play-banner {
    left: -1.5rem;
  }
  
  .start-game-button {
    font-size: 1.1rem;
    padding: 0.875rem 1.5rem;
  }
}

.instructions-box {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 3.688rem;
  width: 100%;
  min-height: clamp(500px, 41vh, 789px);
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-top: 2rem;
}

.back-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.how-to-play-banner {
  position: absolute;
  top: -1rem;
  left: -1.5rem;
}

.how-to-play-title {
  height: auto;
  max-width: 150px;
  filter: drop-shadow(-2px 2px 0px rgba(128, 128, 128, 0.6));
}

.back-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease;
  align-self: flex-start;
}

.back-button:hover {
  transform: scale(1.05);
}

.back-button img {
  height: clamp(25px, 3vw, 32px);
  width: auto;
}

.instructions-list {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  line-height: 1.36;
}

.bullet {
  color: #000;
  font-size: 1.5rem;
  font-family: 'Inter-SemiBold', 'Inter', sans-serif;
  font-weight: 600;
  margin-top: -0.2rem;
  flex-shrink: 0;
}

.instruction-text {
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: 'Inter';
  line-height: 136%;
}

.highlight {
  font-family: 'Inter-SemiBold', 'Inter', sans-serif;
  font-weight: 600;
}

.start-game-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.start-game-button:hover {
  transform: scale(1.02);
}

.start-game-button img {
  width: 100%;
  max-width: clamp(200px, 50vw, 300px);
  height: auto;
}


/* Small/Medium Desktop (13" MacBook) - 60% scaling */
@media (min-width: 1025px) and (max-width: 1680px) {
  .home-button img {
    height: clamp(24px, 3vw, 36px); /* 60% of 40px-60px */
  }

  .instructions-timer {
    height: clamp(24px, 3vw, 36px); /* 60% of 40px-60px */
  }

  .header-section {
    top: 30px; /* 60% of 50px */
    right: 0.6rem;
    gap: 0.6rem;
  }
  
  .how-to-play-title {
    width: clamp(246px, 15.4vw, 410.183px) !important; /* Responsive equivalent scaled for desktop range */
    max-width: 410.183px !important;
  }
  
  .how-to-play-banner {
    left: clamp(-1.5rem, -2.2vw, -3.5rem); /* Adjust negative margin to maintain overlay */
    top: clamp(-1rem, -1.2vw, -2rem);
  }
  
  .instructions-box {
    padding: clamp(2.2rem, 3.4vw, 5.688rem); /* Scale padding proportionally */
  }
  
  .instructions-list {
    margin-top: clamp(2rem, 3vw, 5rem);
  }
}

/* Larger Desktop - 80% scaling */
@media (min-width: 1681px) and (max-width: 1919px) {
  .home-button img {
    height: clamp(32px, 4vw, 48px); /* 80% of 40px-60px */
  }

  .instructions-timer {
    height: clamp(32px, 4vw, 48px); /* 80% of 40px-60px */
  }

  .header-section {
    top: 40px; /* 80% of 50px */
    right: 0.8rem;
    gap: 0.8rem;
  }
  
  .how-to-play-title {
    width: clamp(328px, 21.4vw, 410.183px) !important; /* Responsive equivalent to 410.183px */
    max-width: 410.183px !important;
  }
  
  .how-to-play-banner {
    left: clamp(-2rem, -2.5vw, -2.5rem); /* Adjust negative margin to maintain overlay */
  }
  
  .instructions-box {
    padding: clamp(2.5rem, 4vw, 3.688rem); /* Scale padding proportionally */
  }
}

/* Large desktop styles */
@media (min-width: 1681px) {
  .instructions-content {
    width: 1054px;
  }
  
  .instructions-box {
    width: 1054px;
    padding: 5.688rem;
  }
  
  .instructions-list {
    margin-top: 5rem;
  }

  .instruction-text {
    font-size: 2.125rem;
  }
  
  .how-to-play-title {
    width: 410.183px !important;
    max-width: 410.183px !important;
  }
  
  .how-to-play-banner {
    left: -3.5rem;
    top: -2rem;
  }
}
</style>