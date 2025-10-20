<template>
  <!-- Wrapper div with v-if/v-else -->
  <div v-if="question">
    <transition name="fade-in" appear>
      <div class="quiz-screen" :class="timerBackgroundClass">
        <div class="question-overlay">
          <div class="question-header row mb-4">
            <div class="col-12">
              <!-- Timer Section -->
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
                         :style="{ left: `${(timeRemaining / 30) * 100}%` }">
                      <svg class="clock-svg" viewBox="0 0 24 24" width="18" height="18">
                        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none" />
                        <line x1="12" y1="12" x2="12" y2="6" stroke="white" stroke-width="2" stroke-linecap="round" />
                        <line x1="12" y1="12" x2="16" y2="12" stroke="white" stroke-width="2" stroke-linecap="round" />
                      </svg>
                      <div class="timer-text">{{ timeRemaining }}</div>
                    </div>
                    <div class="segment-overlay">
                      <div class="segment" v-for="n in 6" :key="n"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="corner-home-button">
            <img src="/home.png" alt="Home" class="corner-home" @click="$emit('playAgain')">
          </div>

          <div :class="['question-content', 'question-' + question.id]">
            <div class="question-text">
              <div class="question-number">Question {{ currentQuestionIndex + 1 }}</div>
              <h2 class="question-proper" v-html="question.text"></h2>
            </div>
            <div class="question-wrapper" :class="{ 'show-explanation': showExplanation, 'centered-wrapper': !selectedAnswer && timeRemaining > 0 }">
              <div class="question-with-answers row mb-4">
                <div class="col-12">
                  <div class="question-container" :class="{ 'centered-container': !selectedAnswer && timeRemaining > 0 }">
                    <div class="options">
                      <div
                        v-for="(option, index) in question.options"
                        :key="option"
                        class="question-option-wrapper"
                      >
                        <!-- Clickable indicator container -->
                        <div 
                          class="indicator-container"
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
                          <span v-if="showExplanation && option === question.correctAnswer" class="check-icon"><img src="/CHECK.png"></span>
                          <span v-if="showExplanation && selectedAnswer === option && option !== question.correctAnswer" class="x-icon"><img src="/X.png"></span>
                        </div>
                        <div
                          class="question-option"
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
                          <div class="option-content">
                            <template v-if="(showExplanation || selectedAnswer) && option === question.correctAnswer && [1, 2, 3, 5, 7, 8, 14, 19].includes(question.id)">
                              <img :src="'/question-' + question.id + '-correct.png'" alt="Correct answer image" />
                            </template>
                            <span 
                              v-else
                              class="option-text"
                              :style="getTextStyle()"
                              v-html="(showExplanation || selectedAnswer) ? option : option.replace(/<sup>.*?<\/sup>/g, '')"
                            ></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <transition name="explanation-fade">
                <div v-if="showExplanation" class="explanation-container row">
                  <div class="col-12">
                    <div class="explanation-card" :class="{
                      'correct-answer': selectedAnswer === question.correctAnswer,
                      'incorrect-answer': selectedAnswer !== question.correctAnswer
                    }">
                      <span class="explanation-text">
                        <img :src="['/question-' + question.id + '-box.png']">
                      </span>
                    </div>
                  </div>
                </div>
              </transition>
              <transition name="explanation-fade">
                <div v-if="showExplanation" class="addl-info-container" :class="{ active: showAdditionalInfo }">
                  <button 
                    class="addl-info-btn"
                    @click="toggleAdditionalInfo"
                  >
                    Abbreviations & References
                  </button>
                  <div v-if="showAdditionalInfo" class="explanation-desc">
                    <img :src="['/question-' + question.id + '-notes.png']">
                  </div>
                </div>
              </transition>
            </div>
            <div class="timer-dial">
              <GaugeTimer :timeRemaining="timeRemaining" :maxTime="30" />
            </div>
            <transition v-if="showNotes" name="fade">
              <div class="question-faq-notes">Notes</div>
            </transition>
            <div 
              class="wheel"
              :style="{ backgroundImage: `url('/${valveImage}.png')` }"
            ></div>
          </div>
        </div>
        <transition name="fade">
          <div v-if="showExplanation && question.finePrint && question.finePrint.trim().length > 0" :class="['question-' + question.id + ' fine-print']">
            <div class="fine-print-content">
              <img :src="['/question-' + question.id + '-fineprint.png']">
            </div>
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
  showFinePrint: {
    type: Boolean,
    default: false
  }
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

function getTextStyle() {
  if (!props.question || !props.question.options) return {};
  
  const maxLength = Math.max(...props.question.options.map(opt => {
    const plainText = opt.replace(/<[^>]*>/g, '');
    return plainText.length;
  }));
  
  if (maxLength <= 20) {
    return { fontSize: '38px' };
  }
  
  let fontSize = '38px';
  
  // if (maxLength > 60) {
  //   fontSize = '22px';
  // } else if (maxLength > 40) {
  //   fontSize = '28px';
  // } else if (maxLength > 30) {
  //   fontSize = '32px';
  // }
  
  return { fontSize: fontSize };
}

const isLastQuestion = computed(() => 
  props.currentQuestionIndex === gameStore.questionsList.length - 1
);

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
  if (props.timeRemaining <= 6) {
    return 'bg-red-xtra';
  } else if (props.timeRemaining <= 18) {
    return 'bg-red';
  } else if (props.timeRemaining <= 24) {
    return 'bg-yellow';
  } else {
    return 'bg-green';
  }
});

const valveImage = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'RED_VALVE';
  } else if (props.timeRemaining <= 24) {
    return 'YELLOW_VALVE';
  } else {
    return 'GREEN_VALVE';
  }
});

const valveShakeAnimation = computed(() => {
  if (props.timeRemaining <= 18) {
    return 'intense-shake';
  } else if (props.timeRemaining <= 24) {
    return 'medium-shake';
  } else {
    return 'gentle-shake';
  }
});

const valveShakeDuration = computed(() => {
  if (props.timeRemaining <= 18) {
    return 1;
  } else if (props.timeRemaining <= 24) {
    return 2;
  } else {
    return 3;
  }
});
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

.quiz-screen.bg-green {
  background: url('/GREEN.png');
  background-size: cover;
  background-position: center left 200px;
}

.quiz-screen.bg-yellow {
  background: url('/YELLOW.png');
  background-size: cover;
  background-position: center left 200px;
}

.quiz-screen.bg-red {
  background: url('/RED.png');
  background-size: cover;
  background-position: center left 200px;
}

.quiz-screen.bg-red-xtra {
  background: url('/RED-XTRA.png');
  background-size: cover;
  background-position: center left 200px;
}

.question-overlay {
  background: linear-gradient(to bottom, transparent 50%, rgba(15, 45, 66, 0.85) 100%),
    linear-gradient(90deg, rgba(15, 45, 66, 0.85) 0%, rgba(15, 45, 66, 0.6) 40%, transparent 70%);
  height: 100%;
  width: 100%;
  padding: clamp(1rem, 3vw, 4rem);
  color: white;
}

.question-header {
    position: absolute;
    top: clamp(80px, 8vh, 128px);
    right: clamp(100px, 12vw, 200px);
}

.question-number {
  background: #F3BE00;
  text-transform: uppercase;
  margin: 0 auto;
  padding: clamp(8px, 1.5vh, 15px) clamp(10px, 2vw, 15px);
  position: absolute;
  left: 0;
  right: 0;
  top: clamp(-20px, -3vh, -25px);
  width: clamp(140px, 20vw, 161px);
  color: var(--Background-color-alternate, #0D161F);
  text-align: center;
  font-family: 'PF Fuel Grime';
  font-size: clamp(18px, 3vw, 35px);
  font-style: normal;
  font-weight: 400;
  line-height: 92%;
  letter-spacing: -0.35px;
}

h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
}

.question-proper {
  padding-top: clamp(1.5rem, 4vh, 3rem);
  color: var(--Color-Brand-white, #FFF);
  text-align: center;
  font-family: "Bebas Neue Pro";
  font-size: clamp(24px, 4vw, 50px);
  font-style: normal;
  font-weight: 700;
  line-height: 108%;
  letter-spacing: -1px;
}

.question-content {
  max-width: min(61%, 1200px);
  padding-top: clamp(30px, 5vh, 50px);
}

.timer-dial {
  position: absolute;
  right: clamp(40px, 4vw, 62px);
  top: clamp(180px, 20vh, 243px);
  zoom: clamp(1.5, 2vw, 2.1);
}

.wheel {
  position: absolute;
  height: clamp(200px, 20vh, 266px);
  width: clamp(160px, 16vw, 216px);
  background-size: 100% 100%;
  background-position: center;
  top: clamp(350px, 40vh, 477px);
  right: clamp(400px, 40vw, 566px);
  transition: background-image 0.3s ease;
}

.gentle-shake {
  animation: gentle-shake 3s infinite;
}

.medium-shake {
  animation: medium-shake 2s infinite;
}

.intense-shake {
  animation: intense-shake 1s infinite;
}

@keyframes gentle-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
}

@keyframes medium-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-5deg); }
  100% { transform: rotate(0deg); }
}

@keyframes intense-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

/* FIXED-WIDTH QUESTION OPTIONS STYLING */
.options {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
}

.question-option-wrapper {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.indicator-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 85px;
}

.light-indicator {
  position: absolute;
  width: 102.298px;
  height: 102.298px;
  z-index: 2;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
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
}

.check-icon img {
  width: 60.65px;
  height: 62.375px;
  flex-shrink: 0;
}

.x-icon img {
  width: 102.298px;
  height: 102.298px;
  flex-shrink: 0;
}

.faded-option {
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
  opacity: 0.7;
}

.faded-option .option-text {
  opacity: 0.5;
}

.faded-option-img {
  filter: grayscale(50%) blur(0.5px);
}

/* IMPORTANT: Fixed width for all options */
.question-option {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: clamp(60px, 8vh, 82px);
  max-height: clamp(60px, 8vh, 82px);
  color: white;
  padding: 0 clamp(15px, 3vw, 30px);
  border: 2.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-left: clamp(-10px, -2vw, -15px);
  box-sizing: border-box !important;
  width: clamp(280px, 50vw, 677px);
  min-width: clamp(280px, 50vw, 677px);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
}

.option-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.option-orange {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #FFA114;
}

.option-teal {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #29CBD5;
}

.option-purple {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #E44AFF;
}

.option-blue {
  background-color: rgba(0, 0, 0, 0.6);
  border: 2px solid #2554D8;
}

.correct-orange {
  border-radius: 8.842px;
  border: 2.618px solid #FFA114 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-teal {
  border-radius: 8.842px;
  border: 2.618px solid #29CBD5 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-purple {
  border-radius: 8.842px;
  border: 2.618px solid #E44AFF !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.correct-blue {
  border-radius: 8.842px;
  border: 2.618px solid #2554D8 !important;
  background: linear-gradient(180deg, rgba(54, 103, 127, 0.60) 0%, rgba(87, 123, 154, 0.60) 100%) !important;
}

.option-text {
  color: var(--Color-Brand-white, #FFF);
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.76px;
  margin-left: clamp(10px, 2vw, 15px);
  display: block;
  white-space: normal;
  overflow-wrap: break-word;
  font-size: clamp(14px, 2.5vw, 38px);
}

.question-option:hover:not(.selected):not(.correct-orange):not(.correct-teal):not(.correct-purple):not(.correct-blue):not(.incorrect) {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.question-option.selected {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.question-option.incorrect {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.3);
}

.question-option.show-correct {
  animation: pulse 2s infinite;
}

/* TIMER STYLES */
.timer-section {
  width: 300px;
  margin-left: auto;
}

.timer-bar-container {
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
}

.progress {
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  position: relative;
  overflow: visible;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
}

.progress-bar {
  border-radius: 10px;
  position: relative;
  transition: all 1s linear;
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

.progress::before {
  content: none;
}

.segment-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 1px;
  pointer-events: none;
}

.segment {
  width: 2px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
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

.timer-value {
  display: none;
}

/* IMPROVED QUESTION WRAPPER TRANSITIONS */
.question-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 50px;
  justify-content: center;
  position: relative;
  transition: all 0.5s ease;
}

.question-with-answers {
  max-width: 100%;
  transition: all 0.5s ease;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.question-wrapper.show-explanation {
  gap: 30px;
  justify-content: flex-start;
}

.question-wrapper.show-explanation .question-with-answers {
  flex: 0 0 50%;
  max-width: 50%;
  transition: all 0.5s ease;
}

.question-wrapper:not(.show-explanation) .question-with-answers {
  max-width: 100%;
  flex: 0 0 100%;
  transition: all 0.5s ease;
}

/* EXPLANATION CONTAINER STYLING */
.explanation-container {
  flex: 0 0 45%;
  max-width: 45%;
  margin-top: 0;
  z-index: 10;
  position: absolute;
  right: 0px;
  top: 0;
  transform: translateX(0);
  transition: all 0.5s ease;
  visibility: visible;
}

.centered-wrapper .question-with-answers {
  justify-content: center;
}

.question-wrapper.show-explanation .question-with-answers {
  justify-content: flex-start;
}

/* New transition group for explanation fade with transform */
.explanation-fade-enter-active,
.explanation-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.explanation-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.explanation-fade-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.explanation-card {
  padding: 30px;
  margin-left: 30px;
  transition: all 0.3s ease;
  width: 421px;
  min-height: 466px;
  margin-top: -50px;
}

.explanation-card.correct-answer {
  background-image: url('/correct-bg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat; 
  height: 500px;
  margin-top: -75px;
}

.explanation-card.incorrect-answer {
  border-color: #dc3545;
  background-image: url('/incorrect-bg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat; 
  height: 422px;
}

.explanation-title {
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 2.25rem;
}

.explanation-card.correct-answer .explanation-title {
  color: #28a745;
}

.explanation-card.incorrect-answer .explanation-title {
  color: #dc3545;
}

.explanation-card p {
  font-size: 1.8rem;
  line-height: 1.5;
  padding: 75px 10px;
  color: #FFF;
  text-align: center;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  font-family: Inter;
  font-size: 27px;
  font-style: normal;
  font-weight: 700;
  line-height: 136%; /* 36.72px */
}

.explanation-text img {
    width: 100%;
}

.explanation-card {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 10px;
}

/* Regular fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.centered-options .options {
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.5s ease;
}

.question-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: all 0.5s ease;
  align-items: center;
}

.question-container.centered-container {
  justify-content: center;
}

.question-with-answers {
  max-width: 100%;
  transition: all 0.5s ease;
}

/* Tablet styles */
@media (max-width: 1024px) {
  .timer-dial {
    zoom: clamp(1.2, 1.8vw, 1.8);
    right: clamp(20px, 3vw, 40px);
    top: clamp(140px, 15vh, 180px);
  }
  
  .wheel {
    right: clamp(300px, 35vw, 400px);
    top: clamp(280px, 35vh, 350px);
  }
  
  .question-content {
    max-width: 70%;
  }
  
  .question-option {
    width: clamp(250px, 45vw, 500px);
    min-width: clamp(250px, 45vw, 500px);
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .quiz-screen {
    background-position: center;
  }
  
  .question-overlay {
    padding: clamp(1rem, 4vw, 2rem);
  }
  
  .question-header {
    position: static;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }
  
  .timer-section {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .timer-dial {
    position: static;
    zoom: 1;
    margin: 1rem auto;
    display: flex;
    justify-content: center;
  }
  
  .wheel {
    display: none;
  }
  
  .question-content {
    max-width: 100%;
    padding-top: 1rem;
  }
  
  .question-text {
    width: 100%;
    max-width: 100%;
  }
  
  .question-option {
    width: 100%;
    min-width: 100%;
    margin-left: 0;
    margin-bottom: 15px;
  }
  
  .question-wrapper {
    margin-top: 20px;
  }
  
  .question-wrapper.show-explanation {
    flex-direction: column;
    gap: 20px;
  }
  
  .question-wrapper.show-explanation .question-with-answers,
  .explanation-container {
    flex: 0 0 100%;
    max-width: 100%;
  }
  
  .explanation-container {
    position: relative;
    margin-top: 20px;
  }
  
  .explanation-card {
    width: 100%;
    margin-left: 0;
    padding: 20px;
    min-height: auto;
  }
  
  .button-container {
    position: static;
    margin-top: 2rem;
    text-align: center;
  }
  
  .corner-home-button {
    right: clamp(20px, 5vw, 50px);
    top: clamp(20px, 5vh, 50px);
  }
}

.addl-info-container {
  position: fixed;
  left: 4rem;
  bottom: 0px;
  z-index: 100;
  transition: transform 0.4s ease;
  max-width: 853px;
  text-align: left;
}

.addl-info-btn {
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
  color: var(--Text-primary, #000);
  font-family: 'PF Fuel Grime';
  font-size: 32.583px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
}

.addl-info-btn::after {
  content: "";
  height: 34px;
  width: 34px;
  background-image: url('/drawer.png');
  font-size: 16px;
  transition: transform 0.3s ease;
}

.active .addl-info-btn::after {
  transform: rotate(180deg);
}

.addl-info-btn:hover {
  background-color: #ffd966;
}

.explanation-desc {
  background-color: #f1f1f1;
  padding: 20px;
  overflow-y: auto;
  width: 100%;
  color: #000;
  font-family: 'Inter';
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 17px;
}

.explanation-desc img {
  width: 100%;
}

.fine-print {
  margin-top: 20px;
  position: absolute;
  bottom: 100px;
  left: 64px;
}

.fine-print-content {
  color: #fff;
  font-family: 'Inter';
  font-size: 11px;
  font-style: normal;
  font-weight: 400;
  line-height: 13px;
}

@media (max-width: 768px) {
  .addl-info-container {
    width: 220px;
    left: 20px;
    bottom: 20px;
  }
  
  .addl-info-btn {
    font-size: 12px;
    padding: 8px 15px;
  }
  
  .explanation-desc, .fine-print-content {
    padding: 15px;
    font-size: 0.85rem;
  }
}

.button-container {
    position: absolute;
    right: 100px;
    bottom: 175px;
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

.centered-wrapper .options {
    align-items: center;
}

.fine-print img {
  width: 100%;
}

/**** FIGMA */
.question-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}

/* General question styles */
.question-text {
  width: clamp(300px, 60vw, 826px);
  max-width: 90vw;
}

.question-option {
  min-width: 467.4px !important;
}

.question-wrapper.show-explanation {
  max-width: 900px;
}

.explanation-text {
  padding-top: 45px;
}

/* Fine-print styles */
.fine-print {
  width: 852px;
}

/* Explanation text width and padding overrides */
.question-1 .explanation-text {
  padding-top: 60px;
}

.question-2 .explanation-text {
  padding-top: 35px;
}

.question-6 .explanation-text {
  padding-top: 55px;
  width: 305.821px;
  height: 333.608px;
  flex-shrink: 0;
}

.question-9 .explanation-text,
.question-8 .explanation-text,
.question-11 .explanation-text,
.question-12 .explanation-text,
.question-13 .explanation-text,
.question-16 .explanation-text,
.question-17 .explanation-text,
.question-18 .explanation-text {
  padding-top: 45px;
}

.question-10 .explanation-text,
.question-13 .explanation-text,
.question-14 .explanation-text,
.question-15 .explanation-text,
.question-19 .explanation-text {
  padding-top: 37px;
  width: 320.052px;
}

.question-2 .explanation-text img {
  width: 324px;
}

.question-9 .explanation-text,
.question-8 .explanation-text {
  width: 320.052px;
}

.question-11 .explanation-text {
  width: 352.679px;
}

/* Specific styles for individual questions */

/* Question 1 */
.question-1.fine-print {
  width: 852px;
}

.question-1 .explanation-text img {
  height: 248px;
  width: 320px;
}

.question-1 .question-option {
  width: 467.4px !important;
}

.question-1 .question-text {
  width: 900px;
}

/* Question 2 */
.question-2.fine-print {
  width: 904.405px;
  height: 126px;
  flex-shrink: 0;
}

.question-2 .explanation-container {
  right: -235px;
}

.question-2 .question-option {
  width: 824px !important;
}

.question-2 .question-text {
  width: 826px;
}

.question-2 .show-explanation {
  max-width: unset;
}

/* Question 3 */
.question-3 .question-text {
  width: 892px;
}

.question-3 .question-option {
  width: 467.4px;
}

/* Question 4 */
.question-4 .question-option {
  width: 729px;
}

.question-4 .question-wrapper.show-explanation {
  max-width: unset;
  width: 1230px;
}

/* Question 5 */
.question-5 .question-option {
  width: 220px;
}

.question-5 .question-wrapper.show-explanation {
  /* display: flex; */
  max-width: 900px;
  margin: 50px auto;
  /* justify-content: center;
  align-items: center; */
}

/* Question 6 */
.question-6 .question-wrapper.show-explanation {
  display: flex;
  max-width: 900px;
  margin: 50px auto;
}

.question-6 .question-option {
  width: 467.4px;
}

/* Question 7 */
.question-7 .question-wrapper.show-explanation {
  max-width: unset;
  width: 1130px;
}

.question-7 .question-option {
  width: 618px;
}

/* Question 8 */
.question-8 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1130px;
  margin: 50px auto;
}

.question-8 .question-option {
  width: 618px;
}

.question-8.fine-print {
  width: 651px;
}

/* Question 9 */
.question-9 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-9 .question-option {
  width: 618px;
}

/* Q 10 */
.question-10.fine-print {
  width: 252px;
}

/* Question 11 */
.question-11 .option-text {
  font-size: 28px !important; 
}

.question-11 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-11 .question-option {
  width: 618px;
}

/* Question 15 */
.question-15 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1120px;
  margin: 50px auto;
}

.question-15 .question-option {
  width: 618px;
}

/* Question 18 */
.question-18 .question-wrapper.show-explanation {
  display: flex;
  min-width: 1050px;
  margin: 50px auto;
}

.question-18 .question-option {
  width: 541px;
}

/* Question 19 */
.question-19.fine-print {
  width: 770px;
}

.corner-home-button {
  position: absolute;
  right: 104px;
  top: 104px;
}

.question-3 h2.question-proper,
.question-6 h2.question-proper,
.question-16 h2.question-proper{
    font-size: 47px;
}

.question-12 h2.question-proper,
.question-13 h2.question-proper,
.question-14 h2.question-proper {
    font-size: 42px;
}

.option-content img {
    margin-left: 15px;
}

.question-1 .option-content img {
    width: 351px;
}

.question-2 .option-content img {
    width: 318px;
}

.question-3 .option-content img {
    width: 113px;
}

.question-5 .option-content img {
    width: 111px;
}

.question-7 .option-content img {
    width: 503px;
}

.question-8 .option-content img {
    width: 292px;
}

.question-14 .option-content img,
.question-19 .option-content img {
    width: 151px;
}
</style>
