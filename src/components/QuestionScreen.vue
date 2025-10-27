<template>
  <!-- Wrapper div with v-if/v-else -->
  <div v-if="question">
    <transition name="fade-in" appear>
      <div class="quiz-screen" :class="timerBackgroundClass">
        <div class="question-overlay">
          <!-- Top Right Timer and Home -->
          <div class="header-section">
            <div class="timer-section">
              <div class="timer-bar-container">
                <div class="progress">
                  <div 
                    class="progress-bar" 
                    :class="timerColorClass"
                    role="progressbar" 
                    :style="{ width: `${(timeRemaining / 30) * 100}%` }"
                  ></div>
                  <div class="timer-circle" 
                       :class="timerColorClass"
                       :style="{ left: '-20px' }">
                    <svg class="clock-svg" viewBox="0 0 24 24" width="18" height="18">
                      <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none" />
                      <line x1="12" y1="12" x2="12" y2="6" stroke="white" stroke-width="2" stroke-linecap="round" />
                      <line x1="12" y1="12" x2="16" y2="12" stroke="white" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    <div class="timer-text">{{ timeRemaining }}</div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="$emit('playAgain')" class="home-button">
              <img src="/home.png" alt="Home">
            </button>
          </div>

          <div :class="['question-content', 'question-' + question.id]">
            <div class="question-text">
              <div class="question-number">Question {{ currentQuestionIndex + 1 }}</div>
              <h2 class="question-proper" v-html="question.text"></h2>
            </div>
            <div class="question-wrapper">
              <!-- Main Layout Container -->
              <div class="question-layout">
                
                <!-- Left Column: Question and Options -->
                <div class="question-column">
                  <div class="options-container">
                    <div
                      v-for="(option, index) in question.options"
                      :key="option"
                      class="option-row"
                    >
                      <!-- Light Indicator -->
                      <div 
                        class="light-container"
                        @click="!showExplanation && handleAnswer(option)"
                      >
                        <img 
                          :src="`/light${index + 1}.png`" 
                          :alt="`Option ${index + 1}`" 
                          class="light-indicator" 
                          :class="{
                            'faded-option-img': (selectedAnswer || timeRemaining === 0) && selectedAnswer !== option && option !== question.correctAnswer
                          }"
                        />
                        <span v-if="showExplanation && option === question.correctAnswer" class="check-icon">
                          <img src="/CHECK.png">
                        </span>
                        <span v-if="showExplanation && selectedAnswer === option && option !== question.correctAnswer" class="x-icon">
                          <img src="/X.png">
                        </span>
                      </div>
                      
                      <!-- Option Content -->
                      <div
                        class="option-content"
                        :class="{
                          'selected': selectedAnswer === option,
                          'correct-orange': showExplanation && option === question.correctAnswer && index === 0,
                          'correct-teal': showExplanation && option === question.correctAnswer && index === 1,
                          'correct-purple': showExplanation && option === question.correctAnswer && index === 2,
                          'correct-blue': showExplanation && option === question.correctAnswer && index === 3,
                          'incorrect': showExplanation && selectedAnswer === option && option !== question.correctAnswer,
                          'show-correct': showExplanation && option === question.correctAnswer && selectedAnswer !== question.correctAnswer,
                          'option-orange': index === 0,
                          'option-teal': index === 1,
                          'option-purple': index === 2,
                          'option-blue': index === 3,
                          'faded-option': (selectedAnswer || timeRemaining === 0) && selectedAnswer !== option && option !== question.correctAnswer
                        }"
                        @click="!showExplanation && handleAnswer(option)"
                      >
                        <span 
                          class="option-text"
                          v-html="(showExplanation || selectedAnswer) ? option : option.replace(/<sup>.*?<\/sup>/g, '')"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Explanation (when shown) -->
                <div v-if="showExplanation" class="explanation-column">
                  <div class="explanation-content" :class="{
                    'correct-answer': selectedAnswer === question.correctAnswer,
                    'incorrect-answer': selectedAnswer !== question.correctAnswer
                  }">
                    <img :src="getBoxImage()" class="explanation-image" @error="hideImage" style="display: block">
                    <div v-if="question.explanation && question.explanation.trim().length > 0" v-html="question.explanation"></div>
                  </div>
                  
                  <div class="additional-info desktop-only">
                    <button 
                      class="info-toggle-btn"
                      @click="toggleAdditionalInfo"
                    >
                      Abbreviations & References
                    </button>
                    <div v-if="showAdditionalInfo" class="additional-content">
                      <img :src="getNotesImage()" @error="hideImage" style="display: block">
                      <div v-if="question.additionalInfo && question.additionalInfo.trim().length > 0" v-html="question.additionalInfo"></div>
                    </div>
                  </div>
                </div>
                
              </div>
              <div class="mobile-only">
                <transition name="fade">
                  <div v-if="showExplanation" class="mobile-button-container text-center">
                    <button 
                      class="btn btn-primary btn-lg"
                      @click="$emit('next')"
                      :disabled="!selectedAnswer && timeRemaining > 0"
                    >
                      {{ isLastQuestion ? 'Finish' : 'Next Question' }} <img src="/next-q.png">
                    </button>
                  </div>
                </transition>

                <transition name="fade">
                  <div v-if="showExplanation && hasFinePrint" :class="['question-' + question.id + ' mobile-fine-print']">
                    <div class="fine-print-content" v-html="question.finePrint"></div>
                  </div>
                </transition>

                <transition name="fade">
                  <div v-if="showExplanation" class="additional-info mobile-only">
                    <button 
                      class="info-toggle-btn"
                      @click="toggleAdditionalInfo"
                    >
                      Abbreviations & References
                    </button>
                    <div v-if="showAdditionalInfo" class="additional-content">
                      <img :src="getNotesImage()" @error="hideImage" style="display: block">
                      <div v-if="question.additionalInfo && question.additionalInfo.trim().length > 0" v-html="question.additionalInfo"></div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
            <div class="timer-dial">
              <GaugeTimer :timeRemaining="timeRemaining" :maxTime="30" />
            </div>
            <transition v-if="showNotes" name="fade">
              <div class="question-faq-notes">Notes</div>
            </transition>
          </div>
        </div>
        <transition name="fade">
          <div v-if="showExplanation && hasFinePrint" :class="['question-' + question.id + ' fine-print']">
            <div class="fine-print-content" v-html="question.finePrint"></div>
          </div>
        </transition>
        <div class="button-container text-center mt-4">
          <button 
            class="btn btn-primary btn-lg"
            @click="$emit('next')"
            :disabled="!selectedAnswer && timeRemaining > 0"
          >
            {{ isLastQuestion ? 'Finish' : 'Next Question' }} <img src="/next-q.png">
          </button>
        </div>
      </div>
    </transition>
  </div>
  <div v-else class="container py-4">
    <div class="alert alert-warning">
      Loading question... 
      <button class="btn btn-sm btn-outline-warning ms-3" @click="reloadQuestion">Retry Loading</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, watch, computed, ref } from 'vue';
import { useGameStore } from '../stores/game';
import GaugeTimer from './GaugeTimerComponent.vue';

const gameStore = useGameStore();
const showNotes = ref(false);

const props = defineProps({
  question: {
    type: Object,
    required: true,
    validator(value) {
      if (!value) return false;
      return typeof value.text === 'string' && 
             Array.isArray(value.options) &&
             typeof value.correctAnswer !== 'undefined' &&
             typeof value.explanation === 'string';
    }
  },
  currentQuestionIndex: {
    type: Number,
    required: true
  },
  timeRemaining: {
    type: Number,
    required: true
  },
  selectedAnswer: {
    type: String,
    default: null
  },
  showExplanation: {
    type: Boolean,
    default: false
  },
  showAdditionalInfo: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['answer', 'next']);

onMounted(() => {
  validateQuestion();
});

watch(() => props.question, () => {
  validateQuestion();
}, { deep: true });

function validateQuestion() {
  if (!props.question) {
    console.error('Question is undefined in QuestionScreen');
    return;
  }
  
  if (!props.question.text) {
    console.error('Question text is missing:', props.question);
    return;
  }
  
  if (!Array.isArray(props.question.options) || props.question.options.length === 0) {
    console.error('Question options are invalid:', props.question);
    return;
  }
}

function handleAnswer(answer) {
  if (!props.question) {
    console.error('Cannot handle answer: question is undefined');
    return;
  }
  emit('answer', answer);
}

function toggleAdditionalInfo() {
  gameStore.state.showAdditionalInfo = !gameStore.state.showAdditionalInfo;
}

function toggleFinePrint() {
  gameStore.toggleFinePrint();
}

function reloadQuestion() {
  console.log('Attempting to reload question...');
  gameStore.initializeQuestions();
  gameStore.state.currentQuestionIndex = 0;
}


const isLastQuestion = computed(() => 
  props.currentQuestionIndex === gameStore.questionsList.length - 1
);

const hasFinePrint = computed(() => {
  const result = props.question?.finePrint && props.question.finePrint.trim().length > 0;
  if (props.question?.id === 4) {
    console.log(`Q4 Debug: hasFinePrint=${result}, finePrint exists=${!!props.question?.finePrint}, length=${props.question?.finePrint?.length}, trimmed length=${props.question?.finePrint?.trim()?.length}`);
  }
  return result;
});

// Watch for showExplanation changes specifically for question 4
watch([() => props.showExplanation, () => props.question?.id], ([showExpl, questionId]) => {
  if (questionId === 4) {
    console.log(`Q4 Watch: showExplanation=${showExpl}, hasFinePrint=${hasFinePrint.value}`);
  }
});

const timerColorClass = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'bg-danger timer-red';
  } else if (props.timeRemaining <= 24) {
    return 'bg-warning timer-orange';
  } else {
    return 'bg-success timer-green';
  }
});

const timerBackgroundClass = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'bg-red';
  } else if (props.timeRemaining <= 24) {
    return 'bg-yellow';
  } else {
    return 'bg-green';
  }
});


const isMobile = computed(() => {
  return window.innerWidth <= 768;
});

const getQuestionImage = (imageType) => {
  const questionId = props.question.id;
  let deviceSuffix = '';
  
  if (window.innerWidth <= 768) {
    deviceSuffix = '-mobile';
  } else if (window.innerWidth <= 1024) {
    deviceSuffix = '-tablet';
  } else {
    deviceSuffix = '-desktop';
  }
  
  const imagePath = `/question-${questionId}-${imageType}${deviceSuffix}.png`;
  console.log('Fine print image path:', imagePath);
  return imagePath;
};

const getNotesImage = () => {
  const questionId = props.question.id;
  let deviceSuffix = '';
  
  if (window.innerWidth <= 768) {
    deviceSuffix = '-mobile';
  } else if (window.innerWidth <= 1024) {
    deviceSuffix = '-tablet';
  } else {
    deviceSuffix = '-desktop';
  }
  
  return `/question-${questionId}-notes${deviceSuffix}.png`;
};

const getBoxImage = () => {
  const questionId = props.question.id;
  let deviceSuffix = '';
  
  if (window.innerWidth <= 768) {
    deviceSuffix = '-mobile';
  } else if (window.innerWidth <= 1024) {
    deviceSuffix = '-tablet';
  } else {
    deviceSuffix = '-desktop';
  }
  
  const answerStatus = props.selectedAnswer === props.question.correctAnswer ? 'correct' : 'incorrect';
  return `/question-${questionId}-box-${answerStatus}${deviceSuffix}.png`;
};


function hideImage(event) {
  // Hide the image when it fails to load
  event.target.style.display = 'none';
}

</script>

<style scoped>
.quiz-screen {
  background-size: cover;
  background-position: center left 200px;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  transition: background 0.5s ease;
}

/* Desktop/XL backgrounds (default) */
.quiz-screen.bg-green {
  background: url('/green-desktop.png');
  background-size: cover;
  background-position: center left 200px;
}

.quiz-screen.bg-yellow {
  background: url('/yellow-desktop.png');
  background-size: cover;
  background-position: center left 200px;
}

.quiz-screen.bg-red {
  background: url('/red-desktop.png');
  background-size: cover;
  background-position: center left 200px;
}

/* Tablet styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .quiz-screen.bg-green {
    background: url('/green-tablet.png');
    background-size: cover;
    background-position: center;
  }

  .quiz-screen.bg-yellow {
    background: url('/yellow-tablet.png');
    background-size: cover;
    background-position: center;
  }

  .quiz-screen.bg-red {
    background: url('/red-tablet.png');
    background-size: cover;
    background-position: center;
  }

  /* Apply 60% scaling for tablet to prevent overflow */
  .question-content {
    max-width: clamp(420px, 45vw, 632px); /* 60% of 700px and 1054px */
    padding: 20px 0px 0px 50px;
  }

  .options-container {
    padding: 1.2rem; /* 60% of 2rem */
    gap: 0.6rem; /* 60% of 1rem */
  }

  .option-content {
    padding: 0 18px; /* 60% of 30px */
    font-size: 0.9rem; /* Smaller for tablet */
  }
}

/* Mobile backgrounds */
@media (max-width: 768px) {
  .quiz-screen.bg-green {
    background: url('/green-mobile.png');
    background-size: contain;
    background-position: center bottom;
  }

  .quiz-screen.bg-yellow {
    background: url('/yellow-mobile.png');
    background-size: contain;
    background-position: center bottom;
  }

  .quiz-screen.bg-red {
    background: url('/red-mobile.png');
    background-size: contain;
    background-position: center bottom;
  }
}

.question-overlay {
  background: linear-gradient(to bottom, transparent 50%, rgba(15, 45, 66, 0.85) 100%),
    linear-gradient(90deg, rgba(15, 45, 66, 0.85) 0%, rgba(15, 45, 66, 0.6) 40%, transparent 70%);
  height: 100%;
  width: 100%;
  padding: clamp(50px, 8vh, 80px) 220px 2rem 2rem;
  color: white;
  display: flex;
  flex-direction: column;
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

.question-number {
  background: #F3BE00;
  text-transform: uppercase;
  margin: 0 auto;
  padding: clamp(6px, 1.2vh, 12px) clamp(8px, 1.6vw, 12px);
  position: absolute;
  left: 0;
  right: 0;
  top: clamp(-16px, -2.4vh, -20px);
  width: clamp(112px, 16vw, 129px);
  color: var(--Background-color-alternate, #0D161F);
  text-align: center;
  font-family: 'PF Fuel Grime';
  font-size: clamp(14px, 2.4vw, 28px);
  font-style: normal;
  font-weight: 400;
  line-height: 92%;
  letter-spacing: -0.35px;
}


.question-proper {
  padding-top: clamp(1.875rem, 5vh, 3rem);
  color: var(--Color-Brand-white, #FFF);
  text-align: center;
  font-family: "Bebas Neue Pro";
  font-size: 1.25rem;
  font-style: normal;
  font-weight: 700;
  line-height: 108%;
  letter-spacing: -1px;
}

.question-content {
  max-width: clamp(700px, 68.75vw, 1054px);
  padding-left: 3rem;
  flex: 1;
}

.timer-dial {
  position: absolute;
  right: clamp(40px, 5vw, 62px);
  top: clamp(180px, 25vh, 243px);
  zoom: clamp(1.5, 2.5vw, 2.1);
}







/* TIMER STYLES */
.timer-section {
  width: 200px;
  margin-left: auto;
}

.timer-bar-container {
  position: relative;
  /* padding-left: 30px; */
  /* padding-right: 30px; */
}

.progress {
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  position: relative;
  overflow: visible;
}

.progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/timer-bar.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 2;
}

.progress-bar {
  border-radius: 10px;
  position: relative;
  transition: all 1s linear;
  z-index: 1;
  height: 100%;
}

.timer-green {
  background-color: #4CAF50 !important;
}

.timer-orange {
  background-color: #FF9800 !important;
}

.timer-red {
  background-color: #F44336 !important;
}



.timer-circle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border: 3px solid white;
  z-index: 10;
  transition: left 1s linear, background-color 0.5s ease;
}

.clock-svg {
  margin-bottom: 2px;
}

.timer-text {
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  line-height: 1;
}













/* Regular fade transition */

.fade-in-enter-active {
  transition: opacity 0.8s ease;
}

.fade-in-leave-active {
  transition: opacity 0.3s ease;
}

.fade-in-enter-from,
.fade-in-appear-from {
  opacity: 0;
}

.fade-in-leave-to {
  opacity: 0;
}


@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}




/* Tablet styles */
@media (max-width: 1024px) {
  .timer-dial {
    zoom: clamp(1.2, 1.8vw, 1.8);
    right: clamp(20px, 3vw, 40px);
    top: clamp(140px, 15vh, 180px);
  }
  
  
  .question-content {
    /* max-width: 70%; */
  }
  
}

/* Tablet styles */

/* Mobile styles */
@media (max-width: 768px) {
  .header-section {
    top: 17px;
  }

  .quiz-screen {
    background-position: center;
  }
  
  .question-overlay {
    padding: 1rem 1rem !important;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 100px !important;
  }
  
  
  .timer-section {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .timer-dial {
    position: absolute;
    zoom: 1;
    margin: 1rem auto;
    display: flex;
    justify-content: center;
  }
  
  
  .question-text {
    width: 100%;
    max-width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    margin-top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .question-proper {
    font-size: 20px !important;
    padding-top: 0.5rem !important;
    line-height: 1.2 !important;
  }
  
  .question-number {
    font-size: 12px !important;
    padding: 4px 8px !important;
    top: -8px !important;
    width: 80px !important;
  }
  
  
  .question-wrapper {
    margin-top: 10px;
  }
  
  
  
  .button-container {
    position: static;
    margin-top: 2rem;
    text-align: center;
  }
  
  
  .question-layout {
    transform: scale(0.8);
    transform-origin: center top;
  }
  
  .desktop-only {
    display: none !important;
  }
}





.fine-print {
  margin-top: 20px;
  position: absolute;
  bottom: clamp(120px, 12vh, 150px);
  left: 4rem;
  max-width: clamp(400px, 70vw, 800px);
}

.fine-print-content {
  color: #fff;
  font-family: 'Inter';
  font-size: clamp(9px, 0.8vw, 11px);
  font-style: normal;
  font-weight: 400;
  line-height: clamp(11px, 1vw, 13px);
}

@media (max-width: 768px) {
  
  .fine-print-content {
    padding: 15px;
    font-size: 0.85rem;
  }
}

.button-container {
    position: absolute;
    right: 1rem;
    bottom: clamp(120px, 15vh, 175px);
}

.button-container button.btn.btn-primary.btn-lg {
    font-size: 2rem;
    text-transform: uppercase;
    height: 68px;
    width: 253px;
    font-family: 'PF Fuel Grime';
    color: #000;
}

.question-text {
    border-radius: 10.615px;
    background: rgba(0, 0, 0, .20);
    backdrop-filter: blur(2.122950792312622px);
    padding: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
}




/* General question styles */



/* Fine-print styles */


/* Desktop styles */
@media (min-width: 1025px) and (max-width: 1680px) {
  h2 {
    font-size: 1.5rem; /* 60% of 2.5rem */
  }

  .question-proper {
    padding-top: clamp(1.125rem, 3vh, 1.8rem); /* 60% of 3rem */
    font-size: clamp(20px, 3vw, 36px); /* Much smaller responsive sizing */
  }

  .question-content {
    max-width: 70%;
    padding: 20px 0px 0px 50px;
  }

  .timer-dial {
    right: clamp(24px, 3vw, 37px); /* 60% of 40px and 62px */
    top: clamp(108px, 15vh, 146px); /* 60% of 180px and 243px */
    zoom: clamp(0.9, 1.5vw, 1.26); /* 60% of 1.5 and 2.1 */
  }

  .question-overlay {
    padding: clamp(30px, 4.8vh, 48px) 132px 1.2rem 1.2rem; /* 60% scaling */
  }

  .header-section {
    top: 30px; /* 60% of 50px */
    right: 0.6rem;
    gap: 0.6rem;
  }

  .home-button img {
    height: clamp(24px, 3vw, 36px); /* 60% of 40px-60px */
  }

  .question-number {
    padding: clamp(3.6px, 0.72vh, 7.2px) clamp(4.8px, 0.96vw, 7.2px); /* 60% scaling */
    top: clamp(-9.6px, -1.44vh, -12px);
    width: clamp(67.2px, 9.6vw, 77.4px);
    font-size: clamp(8.4px, 1.44vw, 16.8px);
    letter-spacing: -0.21px;
  }

  .options-container {
    border-radius: 6.369px; /* 60% of 10.615px */
    padding: 1.2rem; /* 60% of 2rem */
    gap: 0.6rem; /* 60% of 1rem */
  }

  .option-row {
    gap: 0.6rem; /* 60% of 1rem */
  }

  .light-indicator {
    height: 36px; /* 60% of 60px */
  }

  .option-content {
    min-height: 49.3px; /* 60% of 82.131px */
    height: auto;
    padding: 0 18px; /* 60% of 30px */
    border: 1.5px solid rgba(255, 255, 255, 0.2); /* 60% of 2.5px */
    border-radius: 6px; /* 60% of 10px */
    margin-left: 0;
  }

  .timer-section {
    width: 120px; /* 60% of 200px */
  }

  .progress {
    height: 12px; /* 60% of 20px */
    border-radius: 6px; /* 60% of 10px */
  }

  .timer-circle {
    width: 36px; /* 60% of 60px */
    height: 36px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5); /* 60% of 10px */
    border: 1.8px solid white; /* 60% of 3px */
  }

  .clock-svg {
    margin-bottom: 1.2px; /* 60% of 2px */
  }

  .timer-text {
    font-size: 0.9rem; /* 60% of 1.5rem */
  }

  .question-wrapper {
    margin-top: 30px; /* 60% of 50px */
    gap: 1.2rem; /* 60% of 2rem */
  }

  .question-layout {
    gap: 1.2rem; /* 60% of 2rem */
  }

  .explanation-column {
    gap: 0.9rem; /* 60% of 1.5rem */
  }

  .explanation-content {
    border-radius: 6.369px; /* 60% of 10.615px */
    padding: 0;
  }

  .additional-info {
    left: 2.4rem; /* 60% of 4rem - matches additional-info */
    max-width: 511.8px; /* 60% of 853px */
  }

  .info-toggle-btn {
    border-radius: 4.8px 4.8px 0 0; /* 60% of 8px */
    padding: 6px 12px; /* 60% of 10px 20px */
    width: 229.2px; /* 60% of 382px */
    font-size: 19.55px; /* 60% of 32.583px */
  }

  .info-toggle-btn::after {
    height: 20.4px; /* 60% of 34px */
    width: 20.4px;
    font-size: 9.6px; /* 60% of 16px */
  }

  .additional-content {
    padding: 12px; /* 60% of 20px */
    font-size: 7.2px; /* 60% of 12px */
    line-height: 10.2px; /* 60% of 17px */
  }

  .button-container {
    right: 1rem;
    bottom: clamp(120px, 15vh, 175px); /* Original size */
  }

  .button-container button.btn.btn-primary.btn-lg {
    font-size: 2rem; /* Original size */
    height: 68px; /* Original size */
    width: 253px; /* Original size */
  }

  .question-text {
    border-radius: 6.369px; /* 60% of 10.615px */
    backdrop-filter: blur(1.274px); /* 60% of 2.123px */
    padding: 6px; /* 60% of 10px */
  }

  .fine-print {
    margin-top: 12px; /* 60% of 20px */
    bottom: clamp(72px, 7.2vh, 90px); /* 60% of 120px-150px */
    max-width: clamp(240px, 42vw, 511.2px); /* 60% of 400px-852px */
  }

  .fine-print-content {
    font-size: clamp(5.4px, 0.48vw, 6.6px); /* 60% of 9px-11px */
    line-height: clamp(6.6px, 0.6vw, 7.8px); /* 60% of 11px-13px */
  }

  .option-text {
    letter-spacing: -0.46px; /* 60% of -0.76px */
    margin-left: 9px; /* 60% of 15px */
  }

  .check-icon, .x-icon {
    width: 36px; /* 60% of 60px */
    height: 36px;
  }

  .check-icon img {
    width: 18px; /* 60% of 30px */
    height: 18px;
  }

  .x-icon img {
    width: 36px; /* 60% of 60px */
    height: 36px;
  }

  .info-toggle-btn {
    transform: scale(0.8);
    transform-origin: left bottom;
  }

  .button-container button.btn.btn-primary.btn-lg {
    transform: scale(0.8);
    transform-origin: center bottom;
  }
}

/* Large Desktop styles */
@media (min-width: 1681px) {
  
  h2 {
    font-size: 2rem; /* 80% of 2.5rem */
  }

  .question-proper {
    padding-top: clamp(1.5rem, 4vh, 2.4rem); /* 80% of 3rem */
    font-size: clamp(1rem, 2vw, 2.125rem); /* Scales from 80% to larger screens */
  }

  .question-content {
    max-width: 70%;
    padding-left: 2.4rem; /* 80% of 3rem */
  }

  .timer-dial {
    right: clamp(32px, 4vw, 50px); /* 80% of 40px and 62px */
    top: clamp(144px, 20vh, 194px); /* 80% of 180px and 243px */
    zoom: clamp(1.2, 2vw, 1.68); /* 80% of 1.5 and 2.1 */
  }

  .question-overlay {
    padding: clamp(40px, 6.4vh, 64px) 176px 1.6rem 1.6rem; /* 80% scaling */
  }

  .header-section {
    top: 40px; /* 80% of 50px */
    right: 0.8rem;
    gap: 0.8rem;
  }

  .home-button img {
    height: clamp(32px, 4vw, 48px); /* 80% of 40px-60px */
  }

  .question-number {
    padding: clamp(4.8px, 0.96vh, 9.6px) clamp(6.4px, 1.28vw, 9.6px); /* 80% scaling */
    top: clamp(-12.8px, -1.92vh, -16px);
    width: clamp(89.6px, 12.8vw, 103.2px);
    font-size: clamp(11.2px, 1.92vw, 22.4px);
    letter-spacing: -0.28px;
  }

  .options-container {
    border-radius: 8.492px; /* 80% of 10.615px */
    padding: 1.6rem; /* 80% of 2rem */
    gap: 0.8rem; /* 80% of 1rem */
  }

  .option-row {
    gap: 0.8rem; /* 80% of 1rem */
  }

  .light-indicator {
    height: 48px; /* 80% of 60px */
  }

  .option-content {
    min-height: 65.7px; /* 80% of 82.131px */
    height: auto;
    padding: 0 24px; /* 80% of 30px */
    border: 2px solid rgba(255, 255, 255, 0.2); /* 80% of 2.5px */
    border-radius: 8px; /* 80% of 10px */
    margin-left: 0;
  }

  .timer-section {
    width: 160px; /* 80% of 200px */
  }

  .progress {
    height: 16px; /* 80% of 20px */
    border-radius: 8px; /* 80% of 10px */
  }

  .timer-circle {
    width: 48px; /* 80% of 60px */
    height: 48px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.5); /* 80% of 10px */
    border: 2.4px solid white; /* 80% of 3px */
  }

  .clock-svg {
    margin-bottom: 1.6px; /* 80% of 2px */
  }

  .timer-text {
    font-size: 1.2rem; /* 80% of 1.5rem */
  }

  .question-wrapper {
    margin-top: 40px; /* 80% of 50px */
    gap: 1.6rem; /* 80% of 2rem */
  }

  .question-layout {
    gap: 1.6rem; /* 80% of 2rem */
  }

  .explanation-column {
    gap: 1.2rem; /* 80% of 1.5rem */
  }

  .explanation-content {
    border-radius: 8.492px; /* 80% of 10.615px */
    padding: 0;
  }

  .additional-info {
    left: 3.2rem; /* 80% of 4rem - matches additional-info */
    max-width: 682.4px; /* 80% of 853px */
  }

  .info-toggle-btn {
    border-radius: 6.4px 6.4px 0 0; /* 80% of 8px */
    padding: 8px 16px; /* 80% of 10px 20px */
    width: 305.6px; /* 80% of 382px */
    font-size: 26.07px; /* 80% of 32.583px */
  }

  .info-toggle-btn::after {
    height: 27.2px; /* 80% of 34px */
    width: 27.2px;
    font-size: 12.8px; /* 80% of 16px */
  }

  .additional-content {
    padding: 16px; /* 80% of 20px */
    font-size: 9.6px; /* 80% of 12px */
    line-height: 13.6px; /* 80% of 17px */
  }

  .button-container {
    right: 1rem;
    bottom: clamp(120px, 15vh, 175px); /* Original size */
  }

  .button-container button.btn.btn-primary.btn-lg {
    font-size: 2rem; /* Original size */
    height: 68px; /* Original size */
    width: 253px; /* Original size */
  }

  .question-text {
    border-radius: 8.492px; /* 80% of 10.615px */
    backdrop-filter: blur(1.698px); /* 80% of 2.123px */
    padding: 8px; /* 80% of 10px */
  }

  .fine-print {
    margin-top: 16px; /* 80% of 20px */
    bottom: clamp(96px, 9.6vh, 120px); /* 80% of 120px-150px */
    left: 3.2rem; /* 80% of 4rem - matches additional-info */
    max-width: clamp(320px, 56vw, 681.6px); /* 80% of 400px-852px */
  }

  .fine-print-content {
    font-size: clamp(7.2px, 0.64vw, 8.8px); /* 80% of 9px-11px */
    line-height: clamp(8.8px, 0.8vw, 10.4px); /* 80% of 11px-13px */
  }

  .option-text {
    letter-spacing: -0.61px; /* 80% of -0.76px */
    margin-left: 12px; /* 80% of 15px */
  }

  .check-icon, .x-icon {
    width: 48px; /* 80% of 60px */
    height: 48px;
  }

  .check-icon img {
    width: 24px; /* 80% of 30px */
    height: 24px;
  }

  .x-icon img {
    width: 48px; /* 80% of 60px */
    height: 48px;
  }
}

/* Large desktop styles - full size for very large screens */

/* NEW CLEAN QUESTION WRAPPER STYLES */
.question-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.question-layout {
  display: flex;
  gap: 2rem;
  width: 100%;
}

/* Left Column - Questions */
.question-column {
  flex: 1;
  min-width: 0;
  justify-content: center;
  align-content: center;
  display: flex;
}

.options-container {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2.123px);
  border-radius: 10.615px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 566px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.light-container {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 0;
  z-index: 2;
  margin-right: -36px;
}

.light-indicator {
  height: 60px;
  width: auto;
  transition: opacity 0.3s ease;
}

.check-icon, .x-icon {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
}

.check-icon img {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.x-icon img {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.option-content {
  position: relative;
  cursor: pointer;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 50.131px;
  height: auto;
  color: white;
  padding: 0 30px;
  border: 2.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-left: 0;
  box-sizing: border-box !important;
  flex: 1;
  min-width: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
}

.option-content.option-orange {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #FFA114;
}

.option-content.option-teal {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #29CBD5;
}

.option-content.option-purple {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #E44AFF;
}

.option-content.option-blue {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #2554D8;
}

.option-content.correct-orange {
  border-radius: 8.842px;
  border: 2.618px solid #FFA114 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-content.correct-teal {
  border-radius: 8.842px;
  border: 2.618px solid #29CBD5 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-content.correct-purple {
  border-radius: 8.842px;
  border: 2.618px solid #E44AFF !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-content.correct-blue {
  border-radius: 8.842px;
  border: 2.618px solid #2554D8 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-row:hover:not(.selected):not(.correct-orange):not(.correct-teal):not(.correct-purple):not(.correct-blue):not(.incorrect) {
  transform: translateY(-2px);
}

.option-row:hover .option-content:not(.selected):not(.correct-orange):not(.correct-teal):not(.correct-purple):not(.correct-blue):not(.incorrect) {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.option-content.selected {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.option-content.incorrect {
  border-color: #dc3545 !important;
  border-radius: 8.842px;
  background: linear-gradient(180deg, #EC4D56 0%, #FC6463 100%);
}

.option-content.show-correct {
  animation: pulse 2s infinite;
}

.option-content.faded-option {
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
  opacity: 0.7;
}

.option-text {
  color: var(--Color-Brand-white, #FFF);
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.76px;
  margin-left: 15px;
  display: block;
  white-space: nowrap;
  overflow-wrap: break-word;
}


/* Right Column - Explanation */
.explanation-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 60px;
}

.explanation-content {
  padding: clamp(30px, 5vh, 38px) clamp(20px, 3vw, 25px) clamp(30px, 6vh, 40px) clamp(20px, 3vw, 25px);
  color: #FFF;
  text-align: center;
  text-shadow: 0 3.655px 3.655px rgba(0, 0, 0, 0.25);
  font-family: Inter;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 136%; /* 24.48px */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.explanation-content.correct-answer::after {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background-image: url('/right-check.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 10;
}

.explanation-content.incorrect-answer::after {
  content: '';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  background-image: url('/wrong-x.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 10;
}

/* Desktop background images for non-stacked layout */
@media (min-width: 769px) {
  .explanation-content {
    padding: clamp(45px, 5vh, 38px) clamp(20px, 3vw, 25px) clamp(50px, 6vh, 40px) clamp(20px, 3vw, 25px);
    font-size: 15px;
  }

  .explanation-content.correct-answer {
    background-image: url('/correct-desktop.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .explanation-content.incorrect-answer {
    background-image: url('/incorrect-desktop.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
}

/* Mobile background images for stacked layout */
@media (max-width: 769px) {
  .explanation-content.correct-answer {
    background-image: url('/correct-mobile.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  .explanation-content.incorrect-answer {
    background-image: url('/incorrect-mobile.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
}

.explanation-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.additional-info {
  position: fixed;
  left: 4rem;
  bottom: 0px;
  z-index: 100;
  transition: transform 0.4s ease;
  max-width: 853px;
  text-align: left;
}

.info-toggle-btn {
  background-color: #f9cb4a;
  color: #000;
  text-transform: uppercase;
  border: none;
  border-radius: 8px 8px 0 0;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 382px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'PF Fuel Grime';
  font-size: 32.583px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
}

.info-toggle-btn::after {
  content: "";
  height: 34px;
  width: 34px;
  background-image: url('/drawer.png');
  font-size: 16px;
  transition: transform 0.3s ease;
}


.info-toggle-btn:hover {
  background-color: #ffd966;
}

.additional-content {
  background-color: #f1f1f1;
  padding: 20px;
  overflow-y: auto;
  width: 100%;
  color: #000;
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  /* font-weight: 700; */
  line-height: 17px;
}

.additional-content img {
  width: 100%;
}

/* Mobile Layout - Stack Vertically */
@media (max-width: 768px) {
  .question-wrapper {
    gap: 0; /* Remove gap between question-layout and mobile-only container */
  }

  .question-layout {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 100%;
  }
  
  .explanation-column {
    width: 100%;
    max-width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }
  
  .options-container {
    padding: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .light-indicator {
    height: 50px;
  }
  
  .light-container {
    z-index: 2;
    position: relative;
  }
  
  .option-content {
    min-height: 40px !important;
    max-width: 280px !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    padding: 0.5rem 0.75rem !important;
    margin-left: 0 !important;
    font-size: 14px !important;
  }
  
  .option-text {
    white-space: normal !important;
  }
  
  .option-row {
    width: 100%;
    max-width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    margin-left: calc(50% - 160px + 12.5px); /* Account for -25px total offset */
    margin-right: calc(50% - 160px - 12.5px);
  }
  
  /* Timer positioning - top center */
  
  .timer-section {
    width: 200px;
    margin: 0 auto;
  }
  
  .timer-bar-container {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
  
  .progress {
    height: 16px !important;
  }
  
  .timer-circle {
    width: 48px !important;
    height: 48px !important;
    transform: translate(-50%, -50%) !important;
  }
  
  .timer-text {
    font-size: 12px !important;
  }
  
  .clock-svg {
    width: 14px !important;
    height: 14px !important;
  }
  
}

  /* Mobile Layout - Stack Vertically */
@media (max-width: 768px) {
  .option-text {
    font-size: 18px;
    margin-left: 8px !important;
  }
}


/* Larger desktop question specific styles */


/* Hide mobile-only content on desktop/tablet */
@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }

}

@media (max-width: 768px){
  .question-content {
    max-width: 95% !important;
    padding-left: unset !important;
    align-items: center;
    /* justify-content: center; */
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  /* Hide default fine print and button on mobile */
  .fine-print:not(.mobile-fine-print) {
    display: none !important;
  }
  
  .button-container:not(.mobile-button-container) {
    display: none !important;
  }
  
  .fine-print {
    max-width: 80%;
    width: 100%;
  }

  .fine-print-content {
    padding: unset;
  }

  .info-toggle-btn {
    font-size: 18px;
    width: unset;
  }

  .additional-info {
    left: 13px !important; /* Mobile - matches additional-info */
  }

  .fine-print-content * {
    font-size: 7px;
  }
  
  .fine-print-content img {
    width: 100%;
    height: auto;
    max-width: 100%;
    object-fit: contain;
  }
  
  .mobile-fine-print  {
    margin-top: 20px;
  }

  .mobile-fine-print .fine-print-content {
    left: 13px !important; /* Mobile - matches additional-info */
    color: #FFF;
    font-family: Inter;
    font-size: 7px;
    font-style: normal;
    font-weight: 400;
    line-height: 9px; /* 128.571% */
  }

  .explanation-content {
    font-size: 13px;
  }

  .additional-content {
    color: #000;
    font-family: Inter;
    font-size: 10px;
    font-weight: 400;
    line-height: 14px;
  }

  .x-icon img {
    height: 50px;
    width: 50px;
  }
}

/* Utility classes for responsive display */
.mobile-only {
  display: none !important;
}

@media (max-width: 768px) {
  .mobile-only {
    display: block !important;
    margin-top: 0;
    margin-bottom: 0;
  }

  .mobile-button-container {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
}

</style>